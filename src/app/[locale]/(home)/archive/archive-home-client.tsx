'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Archive, Sparkles } from 'lucide-react';
import { cn } from '@windrun-huaiin/lib/utils';
import { themeRingColor } from '@windrun-huaiin/base-ui/lib';
import { AnimeBeamFrame } from '@windrun-huaiin/third-ui/main/anime';
import { trackGaEvent } from '@/lib/analytics';

type ArchiveCardItem = {
  title: string;
  cardTitle?: string;
  description?: string;
  date?: string;
  publishDate?: string;
  issueNumber?: number;
  tags?: string[];
  href: string;
};

export function ArchiveHomeClient({
  items,
}: {
  locale: string;
  items: ArchiveCardItem[];
  localePrefixAsNeeded: boolean;
  defaultLocale: string;
}) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [pressedHref, setPressedHref] = useState<string | null>(null);

  return (
    <main className="mt-12 min-h-screen bg-neutral-950 px-5 pb-14 pt-8 text-slate-500 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <section className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/35 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_48px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:p-7 lg:p-8">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-teal-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-teal-200/20 bg-teal-200/10">
                <Archive className="h-3.5 w-3.5 text-teal-200" />
              </span>
              <span>Biweekly Archive</span>
            </div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-300 sm:text-4xl lg:text-5xl">
              Biweekly Science Archive
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
              {items.length
                ? 'Browse each published biweekly science feature, organized by issue and built from connected science trivia questions.'
                : 'No biweekly science features have been published yet.'}
            </p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {items.map((item) => {
            const active = hoveredHref === item.href || pressedHref === item.href;
            const content = (
              <Link
                href={item.href}
                prefetch={false}
                onTouchStart={() => setPressedHref(item.href)}
                onTouchEnd={() => setPressedHref((current) => (current === item.href ? null : current))}
                onTouchCancel={() => setPressedHref((current) => (current === item.href ? null : current))}
                onMouseEnter={() => setHoveredHref(item.href)}
                onMouseLeave={() => setHoveredHref((current) => (current === item.href ? null : current))}
                onFocus={() => setHoveredHref(item.href)}
                onBlur={() => setHoveredHref((current) => (current === item.href ? null : current))}
                onClick={() => {
                  if (typeof item.issueNumber === 'number') {
                    trackGaEvent('science_archivepage_card_click', {
                      issue_number: item.issueNumber,
                    });
                  }
                }}
                className={cn(
                  'group relative flex h-56 flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/35 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_48px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-neutral-900/42 sm:h-60 sm:p-5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
                  themeRingColor,
                )}
              >
                <div className="pointer-events-none absolute bottom-4 left-0 top-4 z-10 w-px bg-linear-to-b from-transparent via-emerald-300/80 to-transparent shadow-[0_0_10px_rgba(110,231,183,0.35)]" />
                <div className="pointer-events-none absolute left-4 right-4 top-0 z-10 h-px bg-linear-to-r from-transparent via-emerald-300/80 to-transparent shadow-[0_0_10px_rgba(110,231,183,0.35)]" />
                <div className="pointer-events-none absolute bottom-4 right-0 top-4 z-10 w-px bg-linear-to-b from-transparent via-emerald-300/80 to-transparent shadow-[0_0_10px_rgba(110,231,183,0.35)]" />
                <div className="pointer-events-none absolute bottom-0 left-4 right-4 z-10 h-px bg-linear-to-r from-transparent via-emerald-300/80 to-transparent shadow-[0_0_10px_rgba(110,231,183,0.35)]" />

                <div className="relative flex min-h-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-teal-200/15 bg-teal-200/8">
                        <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                      </span>
                      <span>Biweekly Feature{item.issueNumber ? ` · Issue ${item.issueNumber}` : ''}</span>
                    </div>

                    <p className="text-xs font-medium text-slate-500 sm:text-right">
                      {item.publishDate ?? item.date}
                    </p>
                  </div>

                  <div className="mt-4 flex-1">
                    <h2 className="line-clamp-2 min-h-11 text-base font-semibold leading-snug tracking-tight text-slate-300 sm:min-h-[3.15rem] sm:text-lg lg:text-xl">
                      {item.cardTitle ?? item.title}
                    </h2>
                    {item.description ? (
                      <p className="mt-2 line-clamp-3 min-h-18 text-sm leading-6 text-slate-500 sm:text-[15px]">
                        {item.description}
                      </p>
                    ) : (
                      <p className="line-clamp-2 text-sm leading-6 text-transparent select-none">&nbsp;</p>
                    )}
                  </div>
                </div>
              </Link>
            );

            return (
              <div
                key={item.href}
                className="h-full"
                onMouseEnter={() => setHoveredHref(item.href)}
                onMouseLeave={() => setHoveredHref((current) => (current === item.href ? null : current))}
                onFocus={() => setHoveredHref(item.href)}
                onBlur={() => setHoveredHref((current) => (current === item.href ? null : current))}
                onTouchStart={() => setPressedHref(item.href)}
                onTouchEnd={() => setPressedHref((current) => (current === item.href ? null : current))}
                onTouchCancel={() => setPressedHref((current) => (current === item.href ? null : current))}
              >
                {active ? (
                  <AnimeBeamFrame
                    active
                    interactive={false}
                    tone="theme"
                    radius={20}
                    className="h-full"
                  >
                    {content}
                  </AnimeBeamFrame>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
