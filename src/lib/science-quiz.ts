import "server-only";

import { randomUUID } from "node:crypto";
import { getJson, setJson, withLock } from "@windrun-huaiin/backend-core/upstash/server";
import { getEnabledScienceQuestionIds, getQuestionsByIds, type DailyQuizPayload } from "@/lib/trivia";

const QUESTIONS_PER_GROUP = 5;
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;

type ScienceQuizGroupCache = {
  version: 1;
  cursor: number;
  groups: string[][];
};

export type GeneratedScienceQuiz = {
  quiz: DailyQuizPayload;
  questionIds: string[];
  remainingGroups: number;
  cacheAvailable: boolean;
};

function getGroupsKey(uuid: string) {
  return `science-trivia:user-groups:${uuid}`;
}

function getGroupsLockKey(uuid: string) {
  return `science-trivia:user-groups-lock:${uuid}`;
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

async function takeQuestionIdsFromCache(uuid: string) {
  const key = getGroupsKey(uuid);
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

async function takeNextQuestionIds(uuid: string) {
  const locked = await withLock(getGroupsLockKey(uuid), 10_000, () => takeQuestionIdsFromCache(uuid));

  if (locked) {
    return locked;
  }

  return takeFallbackQuestionIds();
}

export async function generateScienceQuiz(uuid: string): Promise<GeneratedScienceQuiz> {
  const normalizedUuid = uuid.trim();
  if (!normalizedUuid) {
    throw new Error("A user uuid is required to generate a science quiz.");
  }

  const { questionIds, remainingGroups, cacheAvailable } = await takeNextQuestionIds(normalizedUuid);
  const questions = await getQuestionsByIds(questionIds);

  if (questions.length !== QUESTIONS_PER_GROUP) {
    throw new Error("Question details are unavailable for the generated science quiz.");
  }

  const quizId = `${normalizedUuid}:${randomUUID()}`;

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
