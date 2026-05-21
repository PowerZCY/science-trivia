import { getAsNeededLocalizedUrl } from "@windrun-huaiin/lib/utils";
import { ArrowRight, CalendarDays } from "lucide-react";
import { NavigationFeedbackLink } from "@/components/navigation-feedback-link";
import type { ArchiveTopic } from "@/lib/archive-topics";

type Props = {
  locale: string;
  topics: ArchiveTopic[];
};

export function ArchiveTopicList({ locale, topics }: Props) {
  return (
    <section className="mx-auto mt-8 w-full max-w-4xl px-0 pb-10">
      <div className="mb-4 rounded-[1.4rem] border border-white/70 bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Biweekly Science Archive
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
          Browse published Science Trivia themes, each built from a small cluster of questions around one
          clear idea.
        </p>
      </div>

      <div className="grid gap-3">
        {topics.map((topic) => {
          const href = getAsNeededLocalizedUrl(locale, `/archive/${topic.slug}`);
          return (
            <NavigationFeedbackLink
              key={topic.slug}
              href={href}
              className="group rounded-[1.75rem] border border-white/55 bg-[linear-gradient(135deg,#fff8ec_0%,#f5fbff_56%,#fffaf6_100%)] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-white/80 sm:p-5"
              activeClassName="border-amber-400 ring-1 ring-amber-300/70 animate-[navigation-feedback-pulse_0.8s_ease-in-out_1]"
            >
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 sm:text-base">
                    <CalendarDays className="h-4 w-4" />
                    <span>Issue {topic.issueNumber}</span>
                    <span className="text-xs tracking-[0.08em] text-slate-400 sm:text-sm">
                      {topic.publishDate}
                    </span>
                  </p>
                  <span className="inline-flex w-fit rounded-full border border-emerald-300/70 bg-emerald-50/70 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Published
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold leading-7 tracking-tight text-slate-950 transition-colors group-hover:text-slate-800 sm:text-2xl sm:leading-8">
                    {topic.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                    {topic.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {topic.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 pt-1 text-sm font-semibold text-slate-800">
                  <span>Read the theme</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </NavigationFeedbackLink>
          );
        })}
      </div>
    </section>
  );
}
