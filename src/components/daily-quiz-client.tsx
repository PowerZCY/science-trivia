"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Check, ChevronRight, RotateCcw, Sparkles, X } from "lucide-react";
import { trackGaEvent } from "@/lib/analytics";
import type { DailyQuizPayload } from "@/lib/science-quiz";

type Props = {
  quiz: DailyQuizPayload | null;
  mode?: "daily" | "random";
  copy: {
    progressLabel: string;
    questionLabel: string;
    correctLabel: string;
    categoryLabel: string;
    explanationLabel: string;
    correctState: string;
    incorrectState: string;
    nextQuestion: string;
    viewReport: string;
    reportEyebrow: string;
    reportTitle: string;
    reportCopyPerfect: string;
    reportCopyStrong: string;
    reportCopyNice: string;
    reviewTitle: string;
    showWrongOnly: string;
    showAll: string;
    share: string;
    retry: string;
    generateTitle?: string;
    generateDescription?: string;
    generateButton?: string;
    generating?: string;
    generateError?: string;
  };
};

type CompletionRecord = {
  completed: true;
  date: string;
  correctCount: number;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
  }>;
};

type AnswerState = {
  questionId: string;
  isCorrect: boolean;
};

type GenerateFailSource = "home_start" | "report_new";
type GenerateFailReason = "http_error" | "empty_quiz" | "network_error" | "unknown";

class ScienceQuizGenerateError extends Error {
  constructor(readonly reason: GenerateFailReason) {
    super(reason);
  }
}

function getQuizStorageKey(date: string) {
  return `science-trivia:quiz:${date}`;
}

function getCompletedDaysKey() {
  return "science-trivia:completed-days";
}

function getCompletedDaysChangedEventName() {
  return "science-trivia:completed-days-changed";
}

function createSeededRandom(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return function next() {
    hash += 0x6d2b79f5;
    let t = hash;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleAnswers(seed: string, correctAnswer: string, incorrectAnswers: string[]) {
  const answers = [correctAnswer, ...incorrectAnswers];
  const random = createSeededRandom(seed);
  for (let i = answers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  return answers;
}

function readCompletion(date: string): CompletionRecord | null {
  try {
    const raw = window.localStorage.getItem(getQuizStorageKey(date));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CompletionRecord;
    if (!parsed?.completed || parsed.date !== date || !Array.isArray(parsed.answers)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeCompletion(record: CompletionRecord) {
  window.localStorage.setItem(getQuizStorageKey(record.date), JSON.stringify(record));
}

function readCompletedDays() {
  try {
    const raw = window.localStorage.getItem(getCompletedDaysKey());
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCompletedDay(date: string) {
  const current = readCompletedDays();
  if (current.includes(date)) {
    return;
  }
  window.localStorage.setItem(getCompletedDaysKey(), JSON.stringify([...current, date]));
  window.dispatchEvent(new Event(getCompletedDaysChangedEventName()));
}

function removeCompletedDay(date: string) {
  const current = readCompletedDays().filter((item) => item !== date);
  window.localStorage.setItem(getCompletedDaysKey(), JSON.stringify(current));
  window.dispatchEvent(new Event(getCompletedDaysChangedEventName()));
}

function getScoreTitle(score: number, total: number, copy: Props["copy"]) {
  if (score === total) {
    return {
      title: copy.reportTitle,
      body: copy.reportCopyPerfect,
    };
  }

  if (score >= Math.ceil(total * 0.7)) {
    return {
      title: copy.reportTitle,
      body: copy.reportCopyStrong,
    };
  }

  return {
    title: copy.reportTitle,
    body: copy.reportCopyNice,
  };
}

function formatReportCopy(body: string, score: string) {
  if (body.includes("{score}")) {
    return body.replace("{score}", score);
  }

  const trimmedBody = body.trim();
  const normalizedBody = trimmedBody.replace(/^you made it through all five\.?\s*/i, "");

  return `You got ${score}. ${normalizedBody}`;
}

function getAnonymousUuid() {
  const key = "science-trivia:anonymous-uuid";
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }

  const next = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, next);
  return next;
}

function getGenerateFailReason(error: unknown): GenerateFailReason {
  if (error instanceof ScienceQuizGenerateError) {
    return error.reason;
  }

  if (error instanceof TypeError) {
    return "network_error";
  }

  return "unknown";
}

export function DailyQuizClient({ quiz: initialQuiz, copy, mode = "daily" }: Props) {
  const finalRevealDurationMs = 1500;
  const [quiz, setQuiz] = useState<DailyQuizPayload | null>(initialQuiz);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(false);
  const totalQuestions = quiz?.questions.length ?? 0;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [isFinishingQuiz, setIsFinishingQuiz] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong">("all");
  const confettiTimerRef = useRef<number | null>(null);
  const confettiFrameRef = useRef<number | null>(null);
  const finalRevealTimerRef = useRef<number | null>(null);

  const currentQuestion = quiz?.questions[currentIndex];

  const options = useMemo(() => {
    if (!currentQuestion) {
      return [];
    }
    return shuffleAnswers(
      `${quiz?.date ?? "science"}:${currentQuestion.id}`,
      currentQuestion.correctAnswer,
      currentQuestion.incorrectAnswers,
    );
  }, [currentQuestion, quiz?.date]);

  useEffect(() => {
    if (!quiz) {
      return;
    }

    const saved = readCompletion(quiz.date);
    Promise.resolve().then(() => {
      if (!saved) {
        return;
      }

      setCorrectCount(saved.correctCount);
      setAnswers(saved.answers);
      setCurrentIndex(quiz.questions.length);
      setShowReport(true);
    });
  }, [quiz]);

  useEffect(() => {
    return () => {
      if (finalRevealTimerRef.current !== null) {
        window.clearTimeout(finalRevealTimerRef.current);
      }

      if (confettiTimerRef.current !== null) {
        window.clearTimeout(confettiTimerRef.current);
      }

      if (confettiFrameRef.current !== null) {
        window.cancelAnimationFrame(confettiFrameRef.current);
      }
    };
  }, []);

  const reviewItems = quiz?.questions.map((question) => {
    const answer = answers.find((item) => item.questionId === question.id);
    return {
      question,
      isCorrect: answer?.isCorrect ?? false,
    };
  }) ?? [];

  const wrongCount = reviewItems.filter((item) => !item.isCorrect).length;
  const scoreTitle = getScoreTitle(correctCount, totalQuestions, copy);
  const reportScore = `${correctCount}/${totalQuestions}`;
  const reportBody = formatReportCopy(scoreTitle.body, reportScore);
  const reportBodyRest = reportBody.startsWith(`You got ${reportScore}. `)
    ? reportBody.slice(`You got ${reportScore}. `.length)
    : reportBody;

  function saveFinishedQuiz(nextAnswers: AnswerState[], nextCorrectCount: number) {
    if (!quiz) {
      return;
    }

    writeCompletion({
      completed: true,
      date: quiz.date,
      correctCount: nextCorrectCount,
      answers: nextAnswers,
    });
    writeCompletedDay(quiz.date);
  }

  function triggerQuizConfetti() {
    if (typeof window === "undefined") {
      return;
    }

    const confettiColors = [
      "#A8BFA0",
      "#C9B79C",
      "#D6A6A1",
      "#BFA6C9",
      "#9FB4C7",
      "#C8C7A3",
      "#D2B48C",
      "#8FB8A8",
    ];

    if (confettiTimerRef.current !== null) {
      window.clearTimeout(confettiTimerRef.current);
    }

    if (confettiFrameRef.current !== null) {
      window.cancelAnimationFrame(confettiFrameRef.current);
    }

    confettiTimerRef.current = window.setTimeout(() => {
      const duration = 2000;
      const end = Date.now() + duration;
      const isMobile = window.innerWidth < 640;

      const frame = () => {
        if (isMobile) {
          confetti({
            particleCount: 3,
            angle: 55,
            spread: 58,
            startVelocity: 34,
            decay: 0.92,
            scalar: 0.75,
            ticks: 170,
            origin: { x: 0, y: 0.7 },
            colors: confettiColors,
            zIndex: 2147483647,
          });
        } else {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 58,
            startVelocity: 46,
            decay: 0.91,
            scalar: 0.9,
            ticks: 180,
            origin: { x: 0, y: 0.62 },
            colors: confettiColors,
            zIndex: 2147483647,
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 58,
            startVelocity: 46,
            decay: 0.91,
            scalar: 0.9,
            ticks: 180,
            origin: { x: 1, y: 0.62 },
            colors: confettiColors,
            zIndex: 2147483647,
          });
        }

        if (Date.now() < end) {
          confettiFrameRef.current = window.requestAnimationFrame(frame);
        } else {
          confettiFrameRef.current = null;
        }
      };

      frame();
      confettiTimerRef.current = null;
    }, 300);
  }

  function handleAnswer(answer: string) {
    if (!quiz || !currentQuestion || selectedAnswer) {
      return;
    }

    const isCorrect = answer === currentQuestion.correctAnswer;
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    const nextAnswers = [
      ...answers,
      {
        questionId: currentQuestion.id,
        isCorrect,
      },
    ];

    setSelectedAnswer(answer);
    setAnswers(nextAnswers);
    setCorrectCount(nextCorrectCount);

    if (currentIndex === totalQuestions - 1) {
      saveFinishedQuiz(nextAnswers, nextCorrectCount);
      setIsFinishingQuiz(true);
      if (finalRevealTimerRef.current !== null) {
        window.clearTimeout(finalRevealTimerRef.current);
      }
      finalRevealTimerRef.current = window.setTimeout(() => {
        setShowReport(true);
        setCurrentIndex(totalQuestions);
        setIsFinishingQuiz(false);
        triggerQuizConfetti();
        finalRevealTimerRef.current = null;
      }, finalRevealDurationMs);
      trackGaEvent("science_quiz_complete", {
        score: nextCorrectCount,
      });
    }
  }

  function goNext() {
    if (!selectedAnswer) {
      return;
    }

    if (currentIndex >= totalQuestions - 1) {
      return;
    }

    setCurrentIndex((value) => value + 1);
    setSelectedAnswer(null);
  }

  async function handleNewQuiz() {
    if (!quiz) {
      return;
    }

    trackGaEvent("science_quiz_new_click");

    await handleGenerateQuiz("report_new");
  }

  function handleRetry() {
    if (!quiz) {
      return;
    }

    trackGaEvent("science_quiz_retry_click", {
      score: correctCount,
    });
    if (finalRevealTimerRef.current !== null) {
      window.clearTimeout(finalRevealTimerRef.current);
      finalRevealTimerRef.current = null;
    }
    window.localStorage.removeItem(getQuizStorageKey(quiz.date));
    removeCompletedDay(quiz.date);
    setCurrentIndex(0);
    setCorrectCount(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowReport(false);
    setIsFinishingQuiz(false);
    setReviewFilter("all");
  }

  async function handleGenerateQuiz(source: GenerateFailSource = "home_start") {
    if (isGenerating) {
      return;
    }

    if (source === "home_start") {
      trackGaEvent("science_quiz_generate_start");
    }

    setIsGenerating(true);
    setGenerateError(false);

    try {
      const uuid = getAnonymousUuid();
      const response = await fetch("/api/science-quiz/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uuid }),
      });

      if (!response.ok) {
        throw new ScienceQuizGenerateError("http_error");
      }

      const payload = (await response.json()) as { quiz?: DailyQuizPayload };
      if (!payload.quiz?.questions?.length) {
        throw new ScienceQuizGenerateError("empty_quiz");
      }

      setQuiz(payload.quiz);
      setCurrentIndex(0);
      setCorrectCount(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setShowReport(false);
      setIsFinishingQuiz(false);
      setReviewFilter("all");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(error);
      }
      trackGaEvent("science_quiz_generate_fail", {
        source,
        reason: getGenerateFailReason(error),
      });
      setGenerateError(true);
    } finally {
      setIsGenerating(false);
    }
  }

  if (!quiz) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-neutral-900/58 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_0_42px_rgba(255,255,255,0.035),0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute bottom-5 left-0 top-5 z-10 w-[2px] bg-linear-to-b from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="pointer-events-none absolute left-5 right-5 top-0 z-10 h-px bg-linear-to-r from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="pointer-events-none absolute bottom-5 right-0 top-5 z-10 w-[2px] bg-linear-to-b from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="pointer-events-none absolute bottom-0 left-5 right-5 z-10 h-px bg-linear-to-r from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="relative mx-auto grid min-h-[330px] max-w-3xl place-items-center text-center sm:min-h-[390px]">
          <div className="w-full">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-100/35 bg-emerald-300/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_14px_40px_rgba(16,185,129,0.16)] sm:h-24 sm:w-24">
              <span className="text-4xl font-black text-emerald-100 sm:text-5xl">?</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-300 sm:text-4xl">
              {copy.generateTitle ?? "Ready for a challenge?"}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              {copy.generateDescription ?? "Tap the button below to answer 5 quick science questions, then review every answer with a clear explanation."}
            </p>

            {generateError ? (
              <p className="mt-3 text-sm font-medium text-rose-300">
                {copy.generateError ?? "Unable to generate questions. Please try again."}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => handleGenerateQuiz("home_start")}
              disabled={isGenerating}
              className="group mt-7 inline-flex min-h-12 w-full max-w-60 items-center justify-center gap-2 rounded-xl border border-emerald-200/30 bg-emerald-200/12 px-5 py-3 text-base font-semibold text-emerald-50 shadow-[0_14px_32px_rgba(16,185,129,0.14),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-emerald-100/45 hover:bg-emerald-200/18 hover:shadow-[0_18px_40px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.24)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto sm:min-w-52"
            >
              <span>
                {isGenerating
                  ? copy.generating ?? "Preparing your quiz..."
                  : copy.generateButton ?? "Start Quiz"}
              </span>
              <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-neutral-900/58 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_0_42px_rgba(255,255,255,0.035),0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-6 lg:p-7">
        <div className="pointer-events-none absolute bottom-5 left-0 top-5 z-10 w-[2px] bg-linear-to-b from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="pointer-events-none absolute left-5 right-5 top-0 z-10 h-px bg-linear-to-r from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="pointer-events-none absolute bottom-5 right-0 top-5 z-10 w-[2px] bg-linear-to-b from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="pointer-events-none absolute bottom-0 left-5 right-5 z-10 h-px bg-linear-to-r from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="relative">
          {!showReport && currentQuestion ? (
            <div className="grid gap-5">
              <div className="grid gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/25 bg-emerald-200/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">
                      {mode === "random" ? "Random Science Trivia" : `Day ${quiz.dayNumber}`}
                    </div>
                    {mode !== "random" ? (
                      <h2 className="mt-2 text-sm font-medium tracking-tight text-slate-400 sm:text-base">
                        {quiz.date}
                      </h2>
                    ) : null}
                  </div>

                  <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1.5 text-sm font-semibold text-emerald-100 sm:text-base">
                    <Check className="h-4 w-4" />
                    <span>
                      {copy.correctLabel}: {correctCount}/{totalQuestions}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-end justify-between gap-3 text-xs text-slate-400 sm:text-sm">
                    <span className="font-medium text-slate-400">
                      {copy.questionLabel} {currentIndex + 1}/{totalQuestions}
                    </span>
                    {currentQuestion.category ? (
                      <span className="text-right">
                        {copy.categoryLabel}: <span className="text-slate-400">{currentQuestion.category}</span>
                      </span>
                    ) : null}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.07] sm:h-2.5">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-white/35 via-emerald-200/55 to-emerald-300/75 opacity-90 transition-all"
                      style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/7.5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_18px_54px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:p-6">
                <h3 className="relative text-xl font-semibold leading-8 text-slate-300 sm:text-2xl sm:leading-9">
                  {currentQuestion.question}
                </h3>

                <div className="relative mt-5 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2">
                  <div
                    className="contents"
                  >
                    {options.map((answer, index) => {
                      const hasAnswered = selectedAnswer !== null;
                      const isCorrect = answer === currentQuestion.correctAnswer;
                      const isSelected = answer === selectedAnswer;
                      const baseClass =
                        "flex min-h-14 items-start rounded-2xl border px-4 py-3 text-left text-sm font-medium leading-6 transition sm:min-h-16 sm:px-5 sm:py-4 sm:text-base sm:leading-6";
                      const stateClass = hasAnswered
                        ? isCorrect
                          ? "border-emerald-200/[0.35] bg-emerald-200/[0.14] text-emerald-50"
                          : isSelected
                            ? "border-rose-300/[0.35] bg-rose-300/[0.12] text-rose-50"
                            : "border-white/[0.08] bg-white/[0.035] text-slate-300"
                        : "border-white/15 bg-white/[0.065] text-slate-300 hover:-translate-y-0.5 hover:border-emerald-200/35 hover:bg-emerald-200/[0.1]";

                      return (
                        <button
                          key={answer}
                          type="button"
                          disabled={hasAnswered}
                          onClick={() => handleAnswer(answer)}
                          className={`${baseClass} ${stateClass}`}
                        >
                          <span className="mr-3 font-semibold text-emerald-100/85">{String.fromCharCode(65 + index)}.</span>
                          <span>{answer}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {currentQuestion.questionImageUrl ? (
                  <Image
                    src={currentQuestion.questionImageUrl}
                    alt={currentQuestion.question}
                    width={1200}
                    height={675}
                    className="mt-5 h-52 w-full rounded-2xl border border-white/10 object-cover sm:h-72 lg:h-80"
                  />
                ) : null}

                {selectedAnswer ? (
                  <div
                    className={`mt-5 rounded-2xl border p-4 sm:mt-6 sm:p-5 ${
                      selectedAnswer === currentQuestion.correctAnswer
                        ? "border-emerald-200/25 bg-emerald-200/10"
                        : "border-rose-300/25 bg-rose-300/10"
                    }`}
                  >
                    <div className="mb-3 flex flex-col items-start gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="text-base font-semibold text-slate-300">
                        {selectedAnswer === currentQuestion.correctAnswer
                          ? copy.correctState
                          : `${copy.incorrectState} ${currentQuestion.correctAnswer}`}
                      </div>
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={isFinishingQuiz}
                        className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-emerald-200/30 bg-emerald-200/12 px-4 py-2.5 text-base font-semibold text-emerald-50 shadow-[0_14px_32px_rgba(16,185,129,0.14),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-emerald-100/45 hover:bg-emerald-200/18 hover:shadow-[0_18px_40px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.24)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:min-w-44"
                      >
                        <span>{currentIndex === totalQuestions - 1 ? copy.viewReport : copy.nextQuestion}</span>
                        <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                      </button>
                    </div>
                    {currentQuestion.explanation ? (
                      <div className="mt-1 text-[15px] leading-7 text-slate-300 sm:mt-2 sm:text-base">
                        <span className="font-semibold text-slate-300">{copy.explanationLabel}: </span>
                        <span>{currentQuestion.explanation}</span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4.5 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-md sm:p-6">
                <div className="mx-auto mb-3 inline-flex items-center rounded-full border border-teal-200/20 bg-teal-200/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-teal-100">
                  {copy.reportEyebrow}
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-300 sm:text-3xl">
                  {scoreTitle.title}
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  <span className="font-semibold text-slate-300">You got {reportScore}.</span>
                  <span>{` ${reportBodyRest}`}</span>
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleNewQuiz}
                    disabled={isGenerating}
                    className="inline-flex whitespace-nowrap items-center justify-center gap-2 rounded-full border border-teal-200/25 bg-teal-200/[0.14] px-5 py-2.5 text-sm font-semibold text-teal-50 transition hover:border-teal-100/35 hover:bg-teal-200/20"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isGenerating ? copy.generating ?? "Preparing your quiz..." : copy.share}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex whitespace-nowrap items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-teal-200/20 hover:bg-teal-200/8 hover:text-teal-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{copy.retry}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/4 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-md sm:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="text-lg font-semibold text-slate-300">{copy.reviewTitle}</h4>
                  <button
                    type="button"
                    onClick={() => setReviewFilter((value) => (value === "all" ? "wrong" : "all"))}
                    className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-teal-200/20 hover:bg-teal-200/8 hover:text-teal-50"
                  >
                    {reviewFilter === "all"
                      ? `${copy.showWrongOnly} (${wrongCount})`
                      : copy.showAll}
                  </button>
                </div>

                <div className="grid gap-3">
                  {reviewItems
                    .filter((item) => (reviewFilter === "wrong" ? !item.isCorrect : true))
                    .map(({ question, isCorrect }, index) => (
                      <details
                        key={question.id}
                        className="rounded-2xl border border-white/10 bg-white/4 p-3 backdrop-blur-md transition hover:border-white/15 hover:bg-white/6 sm:p-4"
                      >
                        <summary className="flex cursor-pointer list-none items-start gap-2 sm:gap-3">
                          <span
                            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border sm:h-6 sm:w-6 ${
                              isCorrect
                                ? "border-emerald-200/20 bg-emerald-200/12 text-emerald-100"
                                : "border-rose-200/20 bg-rose-200/12 text-rose-100"
                            }`}
                          >
                            {isCorrect ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                          </span>
                          <span className="flex-1 text-[15px] font-medium leading-6 text-slate-300 sm:text-[18px] sm:leading-7">
                            Q{index + 1}. {question.question}
                          </span>
                        </summary>
                        <div className="mt-3 grid gap-2.5 pl-0 sm:mt-4 sm:gap-3 sm:pl-9">
                          {question.category ? (
                            <div className="inline-flex w-fit items-center rounded-full border border-teal-200/20 bg-teal-200/10 px-3 py-1 text-xs font-semibold text-teal-100">
                              {question.category}
                            </div>
                          ) : null}
                          <div className="rounded-xl border border-emerald-200/25 bg-emerald-200/10 px-3 py-2.5 text-[15px] leading-6 text-slate-300 sm:px-4 sm:py-3 sm:text-[16px] sm:leading-7">
                            <span className="font-semibold text-slate-300">{copy.correctLabel}: </span>
                            <span>{question.correctAnswer}</span>
                          </div>
                          {question.explanation ? (
                            <div className="rounded-xl border border-white/10 bg-white/4 px-3 py-2.5 text-[15px] leading-6 text-slate-300 backdrop-blur-sm sm:px-4 sm:py-3 sm:text-[16px] sm:leading-7">
                              <span className="font-semibold text-slate-300">{copy.explanationLabel}: </span>
                              <span>{question.explanation}</span>
                            </div>
                          ) : null}
                        </div>
                      </details>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
    </section>
  );
}
