import "server-only";

import { randomUUID } from "node:crypto";
import { getJson, setJson, withLock } from "@windrun-huaiin/backend-core/upstash/server";
import { AnswersUniverseSdkError, createAnswersUniverseClientFromEnv } from "@windrun-huaiin/faq-sdk";
import type { OuterQuestionBaseItemDto } from "@windrun-huaiin/faq-sdk";
import type { Prisma } from "@app-prisma";
import { prisma as rawPrisma } from "@/server/prisma";

const QUESTIONS_PER_GROUP = 5;
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;
const ENABLE_UPSTASH_CACHE = process.env.ENABLE_UPSTASH_CACHE === "true";

let faqClient: ReturnType<typeof createAnswersUniverseClientFromEnv> | null = null;
const scienceQuestionPool = (rawPrisma as typeof rawPrisma & {
  scienceQuestionPool: Prisma.ScienceQuestionPoolDelegate;
}).scienceQuestionPool;

type ScienceQuizGroupCache = {
  version: 1;
  cursor: number;
  groups: string[][];
};

export type DailyQuizQuestion = {
  id: string;
  uuid: string;
  question: string;
  questionImageUrl?: string | null;
  correctAnswer: string;
  incorrectAnswers: string[];
  explanation?: string | null;
  category?: string | null;
  sortOrder: number;
};

export type DailyQuizPayload = {
  date: string;
  dayNumber: number;
  questions: DailyQuizQuestion[];
};

export type GeneratedScienceQuiz = {
  quiz: DailyQuizPayload;
  questionIds: string[];
  remainingGroups: number;
  cacheAvailable: boolean;
};

function getGroupsKey(fingerprintId: string) {
  return `user-groups:${fingerprintId}`;
}

function getGroupsLockKey(fingerprintId: string) {
  return `user-groups-lock:${fingerprintId}`;
}

function isUpstashCacheEnabled() {
  return ENABLE_UPSTASH_CACHE;
}

function getQuestionId(item: OuterQuestionBaseItemDto): string {
  return String(item.id ?? "");
}

function normalizeQuestion(
  item: OuterQuestionBaseItemDto,
  sortOrder: number,
): DailyQuizQuestion {
  return {
    id: String(item.id),
    uuid: item.uuid,
    question: item.question,
    questionImageUrl: item.questionImageUrl ?? null,
    correctAnswer: item.correctAnswer,
    incorrectAnswers: item.incorrectAnswers ?? [],
    explanation: item.explanation ?? null,
    category: item.category ?? null,
    sortOrder,
  };
}

function getFaqClient() {
  faqClient ??= createAnswersUniverseClientFromEnv();
  return faqClient;
}

function isRecoverableQuestionProviderError(error: unknown) {
  if (!(error instanceof AnswersUniverseSdkError)) {
    return false;
  }

  return (
    error.code === "REQUEST_FAILED" ||
    error.code === "REQUEST_TIMEOUT" ||
    (error.code === "HTTP_ERROR" && typeof error.status === "number" && error.status >= 500)
  );
}

async function getQuestionMap(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, OuterQuestionBaseItemDto>();
  }

  let result: Awaited<ReturnType<ReturnType<typeof getFaqClient>["v1"]["questionsBase"]["getByIds"]>>;
  try {
    result = await getFaqClient().v1.questionsBase.getByIds(ids);
  } catch (error) {
    if (isRecoverableQuestionProviderError(error)) {
      console.warn("[science-quiz] Question provider unavailable; rendering without question details.", error);
      return new Map<string, OuterQuestionBaseItemDto>();
    }

    throw error;
  }

  const items = Array.isArray(result?.items) ? result.items : [];

  return new Map(
    items
      .filter((item) => item?.id != null)
      .map((item) => [getQuestionId(item), item]),
  );
}

async function getQuestionsByIds(ids: string[]) {
  const questionMap = await getQuestionMap(ids);
  return ids
    .map((id, index) => {
      const question = questionMap.get(id);
      if (!question) {
        return null;
      }

      return normalizeQuestion(question, index + 1);
    })
    .filter((item): item is DailyQuizQuestion => item !== null);
}

async function getEnabledScienceQuestionIds() {
  const rows = await scienceQuestionPool.findMany({
    where: {
      enabled: 1,
    },
    select: {
      questionId: true,
    },
    orderBy: {
      questionId: "asc",
    },
  });

  return rows.map((item) => item.questionId.toString());
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildGroups(ids: string[]) {
  const shuffled = shuffle(ids);
  const groups: string[][] = [];

  for (let index = 0; index + QUESTIONS_PER_GROUP <= shuffled.length; index += QUESTIONS_PER_GROUP) {
    groups.push(shuffled.slice(index, index + QUESTIONS_PER_GROUP));
  }

  return groups;
}

function isValidCache(value: ScienceQuizGroupCache | null): value is ScienceQuizGroupCache {
  return (
    value?.version === 1 &&
    Number.isInteger(value.cursor) &&
    Array.isArray(value.groups) &&
    value.groups.every(
      (group) =>
        Array.isArray(group) &&
        group.length === QUESTIONS_PER_GROUP &&
        group.every((id) => typeof id === "string" && id.length > 0),
    )
  );
}

async function createFreshCache() {
  const ids = await getEnabledScienceQuestionIds();
  const groups = buildGroups(ids);

  if (groups.length === 0) {
    throw new Error("Not enough enabled science questions to generate a quiz.");
  }

  return {
    version: 1,
    cursor: 0,
    groups,
  } satisfies ScienceQuizGroupCache;
}

async function takeQuestionIdsFromCache(fingerprintId: string) {
  const key = getGroupsKey(fingerprintId);
  let cache = await getJson<ScienceQuizGroupCache>(key);
  let cacheAvailable = true;

  if (!isValidCache(cache) || cache.cursor >= cache.groups.length) {
    cache = await createFreshCache();
  }

  const questionIds = cache.groups[cache.cursor];
  const nextCache = {
    ...cache,
    cursor: cache.cursor + 1,
  };
  const saved = await setJson(key, nextCache, CACHE_TTL_SECONDS);
  cacheAvailable = saved;

  return {
    questionIds,
    remainingGroups: Math.max(nextCache.groups.length - nextCache.cursor, 0),
    cacheAvailable,
  };
}

async function takeFallbackQuestionIds() {
  const ids = await getEnabledScienceQuestionIds();
  const [questionIds] = buildGroups(ids);

  if (!questionIds) {
    throw new Error("Not enough enabled science questions to generate a quiz.");
  }

  return {
    questionIds,
    remainingGroups: 0,
    cacheAvailable: false,
  };
}

async function takeNextQuestionIds(fingerprintId: string) {
  if (!isUpstashCacheEnabled()) {
    return takeFallbackQuestionIds();
  }

  const locked = await withLock(getGroupsLockKey(fingerprintId), 10_000, () => takeQuestionIdsFromCache(fingerprintId));

  if (locked) {
    return locked;
  }

  return takeFallbackQuestionIds();
}

export async function generateScienceQuiz(fingerprintId: string): Promise<GeneratedScienceQuiz> {
  const normalizedFingerprintId = fingerprintId.trim();
  if (!normalizedFingerprintId) {
    throw new Error("A fingerprint id is required to generate a science quiz.");
  }

  const { questionIds, remainingGroups, cacheAvailable } = await takeNextQuestionIds(normalizedFingerprintId);
  const questions = await getQuestionsByIds(questionIds);

  if (questions.length !== QUESTIONS_PER_GROUP) {
    throw new Error("Question details are unavailable for the generated science quiz.");
  }

  const quizId = `${normalizedFingerprintId}:${randomUUID()}`;

  return {
    quiz: {
      date: quizId,
      dayNumber: 0,
      questions,
    },
    questionIds,
    remainingGroups,
    cacheAvailable,
  };
}
