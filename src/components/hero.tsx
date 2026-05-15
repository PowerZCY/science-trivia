import { getTranslations } from "next-intl/server";
import { DailyQuizClient } from "@/components/daily-quiz-client";
import { WeeklyFeaturedCard } from "@/components/weekly-featured-card";
import { getHomeTriviaData } from "@/lib/home-trivia";

export async function Hero({ locale }: { locale: string }) {
  const [t, quizT] = await Promise.all([
    getTranslations({ locale, namespace: "hero" }),
    getTranslations({ locale, namespace: "quiz" }),
  ]);
  const { featuredTopic } = await getHomeTriviaData();

  return (
    <section className="mx-auto mt-15 flex w-full max-w-6xl flex-col gap-5 px-4 py-3 sm:mt-15 sm:px-6 sm:py-4 lg:gap-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-2 py-1 text-center sm:py-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100 sm:text-4xl lg:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-3xl text-base leading-7 text-slate-600 dark:text-gray-400 sm:text-lg sm:leading-8">
          {t("description")}
        </p>
      </div>

      <WeeklyFeaturedCard
        locale={locale}
        topic={featuredTopic}
        copy={{
          eyebrow: t("featured.eyebrow"),
          title: t("featured.highlightsTitle"),
          description: t("featured.description"),
          readMore: t("featured.readMore"),
          archive: t("featured.archive"),
          emptyTitle: t("featured.emptyTitle"),
          emptyDescription: t("featured.emptyDescription"),
        }}
      />

      <div id="science-quiz">
        <DailyQuizClient
          quiz={null}
          mode="random"
          copy={{
            progressLabel: quizT("session.progressLabel"),
            questionLabel: quizT("session.questionLabel"),
            correctLabel: quizT("session.correctLabel"),
            categoryLabel: quizT("session.categoryLabel"),
            explanationLabel: quizT("session.explanationLabel"),
            correctState: quizT("session.correctState"),
            incorrectState: quizT("session.incorrectState"),
            nextQuestion: quizT("session.nextQuestion"),
            viewReport: quizT("session.viewReport"),
            reportEyebrow: quizT("report.eyebrow"),
            reportTitle: quizT("report.title"),
            reportCopyPerfect: quizT("report.copyPerfect", { score: "{score}" }),
            reportCopyStrong: quizT("report.copyStrong", { score: "{score}" }),
            reportCopyNice: quizT("report.copyNice", { score: "{score}" }),
            reviewTitle: quizT("report.reviewTitle"),
            showWrongOnly: quizT("report.showWrongOnly"),
            showAll: quizT("report.showAll"),
            share: quizT("report.share"),
            copied: quizT("report.copied"),
            retry: quizT("report.retry"),
            generateTitle: quizT("generate.title"),
            generateDescription: quizT("generate.description"),
            generateButton: quizT("generate.button"),
            generating: quizT("generate.generating"),
            generateError: quizT("generate.error"),
          }}
        />
      </div>
    </section>
  );
}
