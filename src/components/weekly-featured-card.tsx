import { getAsNeededLocalizedUrl } from "@windrun-huaiin/lib/utils";
import { ArrowRight, Archive, Sparkles } from "lucide-react";
import { NavigationFeedbackLink } from "@/components/navigation-feedback-link";
import type { ArchiveTopic } from "@/lib/archive-topics";

type Props = {
  locale: string;
  topic: ArchiveTopic | null;
  copy: {
    eyebrow: string;
    title: string;
    description: string;
    readMore: string;
    archive: string;
    emptyTitle: string;
    emptyDescription: string;
  };
};

export function WeeklyFeaturedCard({ locale, topic, copy }: Props) {
  const archiveHref = getAsNeededLocalizedUrl(locale, "/archive");

  if (!topic) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-5 text-center text-slate-600 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{copy.emptyTitle}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-7 sm:text-base">{copy.emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(135deg,#f8fafc_0%,#ecfeff_46%,#fff7ed_100%)] p-5 shadow-[0_24px_90px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.16),transparent_46%),radial-gradient(circle_at_bottom,rgba(251,191,36,0.18),transparent_34%)] lg:block" />
      <div className="relative grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{copy.eyebrow}</span>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Week {topic.weekNumber} · {topic.publishDate}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {topic.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {topic.description}
          </p>
        </div>

        <div className="rounded-[1.25rem] border border-white/75 bg-white/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-xl">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
            {copy.title}
          </h3>
          <ul className="mt-3 grid gap-2.5">
            {topic.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2 text-sm leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 lg:col-span-2">
          <NavigationFeedbackLink
            href={getAsNeededLocalizedUrl(locale, `/archive/${topic.slug}`)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            activeClassName="ring-2 ring-amber-300/70"
          >
            <span>{copy.readMore}</span>
            <ArrowRight className="h-4 w-4" />
          </NavigationFeedbackLink>
          <NavigationFeedbackLink
            href={archiveHref}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white"
            activeClassName="ring-2 ring-amber-300/70"
          >
            <Archive className="h-4 w-4" />
            <span>{copy.archive}</span>
          </NavigationFeedbackLink>
        </div>
      </div>
    </section>
  );
}
