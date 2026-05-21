import { appConfig, generatedLocales, themeMode } from '@/lib/appConfig';
import { montserrat } from '@/lib/fonts';
import { cn } from '@windrun-huaiin/lib/utils';
import { DocsRootProvider } from '@windrun-huaiin/third-ui/fuma/base/docs-root-provider';
import { getFumaTranslations } from '@windrun-huaiin/third-ui/fuma/fuma-translate-util';
import { createLocalizedPageMetadata, createLocalizedSiteMetadata } from '@windrun-huaiin/third-ui/lib/seo-metadata';
import { NProgressBar } from '@windrun-huaiin/third-ui/main';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import React from 'react';
import './globals.css';

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const siteMetadata = await createLocalizedSiteMetadata({
    locale,
    baseUrl: appConfig.baseUrl,
    locales: appConfig.i18n.locales,
    defaultLocale: appConfig.i18n.defaultLocale,
    localePrefixAsNeeded: appConfig.i18n.localePrefixAsNeeded,
  });

  return createLocalizedPageMetadata({
    url: {
      locale,
      pathname: '/',
      baseUrl: appConfig.baseUrl,
      locales: appConfig.i18n.locales,
      defaultLocale: appConfig.i18n.defaultLocale,
      localePrefixAsNeeded: appConfig.i18n.localePrefixAsNeeded,
    },
    site: siteMetadata,
  });
}

export default async function RootLayout({
  children,
  params: paramsPromise
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await paramsPromise;
  setRequestLocale(locale);
  const messages = await getMessages();
  const fumaTranslations = await getFumaTranslations(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <NextIntlClientProvider messages={messages}>
        <body className={cn(montserrat.className)}>
          <NProgressBar />
          <DocsRootProvider
          theme={{
            mode: themeMode,
          }}
            i18n={{
              locale: locale,
              locales: generatedLocales,
              translations: fumaTranslations,
            }}
          >
            {children}
          </DocsRootProvider>
        </body>
      </NextIntlClientProvider>
    </html>
  )
}
