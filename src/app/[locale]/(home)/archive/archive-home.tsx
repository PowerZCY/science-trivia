import { appConfig } from '@/lib/appConfig';
import { siteDocs } from '@/lib/site-docs';
import { getAsNeededLocalizedUrl } from '@windrun-huaiin/lib/utils';
import { ArchiveHomeClient } from './archive-home-client';

const sourceKey = 'archive';

function getTodayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

export type ArchiveHomeItem = {
  title: string;
  cardTitle?: string;
  description?: string;
  date?: string;
  publishDate?: string;
  issueNumber?: number;
  tags?: string[];
  href: string;
};

export async function buildArchiveHomeItems(locale: string) {
  const source = await siteDocs.getContentSource(sourceKey);
  const entries = source.generateParams('slug', 'locale') as Array<{
    slug: string[];
    locale: string;
  }>;
  const today = getTodayUtcDate();

  return entries
    .filter(({ locale: entryLocale }) => entryLocale === locale)
    .map(({ slug, locale: entryLocale }) => {
      const page = source.getPage(slug, entryLocale);

      if (!page) {
        return null;
      }

      const publishDate =
        typeof page.data.publishDate === 'string'
          ? page.data.publishDate
          : typeof page.data.date === 'string'
            ? page.data.date
            : undefined;

      if (!publishDate || publishDate > today) {
        return null;
      }

      return {
        title: page.data.title ?? slug.join('/'),
        cardTitle: typeof page.data.cardTitle === 'string' ? page.data.cardTitle : undefined,
        description: page.data.description,
        date: typeof page.data.date === 'string' ? page.data.date : undefined,
        publishDate,
        issueNumber: typeof page.data.issueNumber === 'number' ? page.data.issueNumber : undefined,
        tags: Array.isArray(page.data.tags)
          ? page.data.tags.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
          : undefined,
        href: getAsNeededLocalizedUrl(
          entryLocale,
          `/${sourceKey}/${slug.join('/')}`,
          appConfig.i18n.localePrefixAsNeeded,
          appConfig.i18n.defaultLocale,
        ),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item != null)
    .sort((a, b) => {
      const aTime = a.publishDate ? Date.parse(a.publishDate) : 0;
      const bTime = b.publishDate ? Date.parse(b.publishDate) : 0;
      return bTime - aTime;
    });
}

export async function ArchiveHome({
  locale,
}: {
  locale: string;
}) {
  const items = await buildArchiveHomeItems(locale);

  return (
    <ArchiveHomeClient
      locale={locale}
      items={items}
      localePrefixAsNeeded={appConfig.i18n.localePrefixAsNeeded}
      defaultLocale={appConfig.i18n.defaultLocale}
    />
  );
}
