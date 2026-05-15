import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { appConfig } from '@/lib/appConfig';
import { defaultLocale, localePrefixAsNeeded } from '@/lib/appConfig';
import { getAsNeededLocalizedUrl } from '@windrun-huaiin/lib/utils';
import { ArchiveTopicList } from '@/components/archive-topic-list';
import {
  getPublishedArchiveTopicBySlug,
  getPublishedArchiveTopics,
} from '@/lib/archive-topics';
import { siteDocs } from '@/lib/site-docs';
import { createFumaPage } from '@windrun-huaiin/third-ui/fuma/server/page-generator';

const sourceKey = 'blog';
const { Page: FumaPage } = createFumaPage({
  sourceKey: sourceKey,
  mdxContentSource: () => siteDocs.getContentSource(sourceKey),
  getMDXComponents: siteDocs.getMDXComponents,
  mdxSourceDir: appConfig.mdxSourceDir[sourceKey],
  githubBaseUrl: appConfig.githubBaseUrl,
  showBreadcrumb: false,
  showTableOfContent: true,
  showTableOfContentPopover: false,
  tocRenderMode: 'portable-clerk',
});

type PageProps = {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
};

function getArchiveRouteFromSlug(slug?: string[]) {
  return `/archive${slug?.length ? `/${slug.join('/')}` : ''}`;
}

async function getBlogSource() {
  return siteDocs.getContentSource(sourceKey);
}

function isIndexSlug(slug?: string[]) {
  return !slug || slug.length === 0;
}

export async function generateStaticParams() {
  const source = await getBlogSource();
  const params = source.generateParams('slug', 'locale') as Array<{
    locale: string;
    slug?: string[];
  }>;

  return params.filter((param) => {
    if (isIndexSlug(param.slug)) {
      return true;
    }

    const slug = param.slug?.join('/');
    return Boolean(slug && getPublishedArchiveTopicBySlug(slug));
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const source = await getBlogSource();
  const page = source.getPage(slug, locale);

  if (!page) {
    return {
      title: '404 - Page Not Found',
      description: 'This page could not be found.',
    };
  }

  if (!isIndexSlug(slug)) {
    const normalizedSlug = slug?.join('/');
    if (!normalizedSlug || !getPublishedArchiveTopicBySlug(normalizedSlug)) {
      return {};
    }
  }

  const route = getArchiveRouteFromSlug(slug);
  const currentUrl = `${appConfig.baseUrl}${getAsNeededLocalizedUrl(locale || defaultLocale, route, localePrefixAsNeeded, defaultLocale)}`;
  const languages = Object.fromEntries(
    (appConfig.i18n.locales as string[]).map((item) => [
      item,
      `${appConfig.baseUrl}${getAsNeededLocalizedUrl(item, route, localePrefixAsNeeded, defaultLocale)}`,
    ]),
  );

  return {
    metadataBase: new URL(appConfig.baseUrl),
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: currentUrl,
      languages,
    },
  };
}

export default async function ArchivePage({ params }: PageProps) {
  const resolvedParams = await params;

  if (!isIndexSlug(resolvedParams.slug)) {
    const normalizedSlug = resolvedParams.slug?.join('/');
    if (!normalizedSlug || !getPublishedArchiveTopicBySlug(normalizedSlug)) {
      notFound();
    }
  }

  return (
    <>
      <FumaPage params={Promise.resolve(resolvedParams)} />
      {isIndexSlug(resolvedParams.slug) ? (
        <ArchiveTopicList
          locale={resolvedParams.locale}
          topics={getPublishedArchiveTopics()}
        />
      ) : null}
    </>
  );
}
