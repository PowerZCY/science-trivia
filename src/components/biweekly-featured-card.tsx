"use client";

import { getAsNeededLocalizedUrl } from "@windrun-huaiin/lib/utils";
import { ArrowRight, Archive, Sparkles } from "lucide-react";
import { NavigationFeedbackLink } from "@/components/navigation-feedback-link";
import { trackGaEvent } from "@/lib/analytics";
import type { ArchiveTopic } from "@/lib/archive-topics";

type Props = {
  locale: string;
  topic: ArchiveTopic | null;
  copy: {
    eyebrow: string;
    readMore: string;
    archive: string;
    emptyTitle: string;
    emptyDescription: string;
  };
};

export function BiweeklyFeaturedCard({ locale, topic, copy }: Props) {
  const archiveHref = getAsNeededLocalizedUrl(locale, "/archive");

  if (!topic) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/35 p-5 text-center text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_48px_rgba(0,0,0,0.16)] backdrop-blur-xl">
        <div className="pointer-events-none absolute bottom-4 left-0 top-4 z-10 w-[2px] bg-linear-to-b from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="pointer-events-none absolute left-4 right-4 top-0 z-10 h-px bg-linear-to-r from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="pointer-events-none absolute bottom-4 right-0 top-4 z-10 w-[2px] bg-linear-to-b from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <div className="pointer-events-none absolute bottom-0 left-4 right-4 z-10 h-px bg-linear-to-r from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
        <h2 className="relative text-2xl font-semibold tracking-tight text-slate-300">{copy.emptyTitle}</h2>
        <p className="relative mx-auto mt-2 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
          {copy.emptyDescription}
        </p>
      </section>
    );
  }

  return (
    <section className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_48px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-colors hover:border-white/15 hover:bg-neutral-900/42 sm:p-5">
      <div className="pointer-events-none absolute bottom-4 left-0 top-4 z-10 w-[2px] bg-linear-to-b from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
      <div className="pointer-events-none absolute left-4 right-4 top-0 z-10 h-px bg-linear-to-r from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
      <div className="pointer-events-none absolute bottom-4 right-0 top-4 z-10 w-[2px] bg-linear-to-b from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />
      <div className="pointer-events-none absolute bottom-0 left-4 right-4 z-10 h-px bg-linear-to-r from-transparent via-emerald-300/90 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.55)]" />

      <div className="relative grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-teal-200/15 bg-teal-200/8">
              <Sparkles className="h-3.5 w-3.5 text-slate-400" />
            </span>
            <span>
              {copy.eyebrow} · Issue {topic.issueNumber}
            </span>
          </div>

          <p className="text-xs font-medium text-slate-500 sm:text-right">{topic.publishDate}</p>
        </div>

        <div>
          <h2 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-slate-300 sm:text-2xl">
            {topic.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 sm:text-[15px]">
            {topic.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <NavigationFeedbackLink
            href={getAsNeededLocalizedUrl(locale, `/archive/${topic.slug}`)}
            onClick={() => trackGaEvent("science_readmore_click", { issue_number: topic.issueNumber })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-teal-200/25 bg-teal-200/14 px-4 py-2 text-sm font-semibold text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-teal-100/35 hover:bg-teal-200/20"
            activeClassName="ring-2 ring-teal-200/70"
          >
            <span>{copy.readMore}</span>
            <ArrowRight className="h-4 w-4" />
          </NavigationFeedbackLink>
          <NavigationFeedbackLink
            href={archiveHref}
            onClick={() => trackGaEvent("science_readarchive_click")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-teal-200/20 hover:bg-teal-200/8 hover:text-slate-300"
            activeClassName="ring-2 ring-teal-200/60"
          >
            <Archive className="h-4 w-4" />
            <span>{copy.archive}</span>
          </NavigationFeedbackLink>
        </div>
      </div>
    </section>
  );
}
