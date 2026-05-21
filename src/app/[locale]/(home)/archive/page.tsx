import { ArchiveHome } from './archive-home';
import { appConfig } from '@/lib/appConfig';
import { createLocalizedMetadata } from '@windrun-huaiin/third-ui/lib/seo-metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return createLocalizedMetadata({
    namespace: 'metadata.archive',
    url: {
      locale,
      pathname: '/archive',
      baseUrl: appConfig.baseUrl,
      locales: appConfig.i18n.locales,
      defaultLocale: appConfig.i18n.defaultLocale,
      localePrefixAsNeeded: appConfig.i18n.localePrefixAsNeeded,
    },
  });
}

export default async function ArchiveHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return ArchiveHome({ locale });
}
