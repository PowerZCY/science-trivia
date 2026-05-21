import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { getAsNeededLocalizedUrl } from "@windrun-huaiin/lib/utils";
import { appConfig, defaultLocale, localePrefixAsNeeded } from "@/lib/appConfig";
import { getPublishedArchiveTopicBySlug } from "@/lib/archive-topics";
import { resolveMdxSourceDir } from "@/lib/mdx-source";

export const revalidate = 86_400;

type SitemapEntry = MetadataRoute.Sitemap[number];

type MdxRoute = {
  route: string;
  date?: string;
  changeFrequency: SitemapEntry["changeFrequency"];
  priority: number;
};

function toAbsoluteUrl(route: string) {
  return new URL(route, appConfig.baseUrl).toString();
}

function getLocalizedRoute(locale: string, route: string) {
  return getAsNeededLocalizedUrl(locale, route, localePrefixAsNeeded, defaultLocale);
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function normalizeFrontmatterDate(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return isValidDate(trimmed) ? trimmed : undefined;
}

function extractFrontmatterDate(content: string) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) {
    return undefined;
  }

  const dateMatch = match[1].match(/^date:\s*([^\n]+)\s*$/m);
  return normalizeFrontmatterDate(dateMatch?.[1]);
}

function getMdxRoutesFromDirectory(
  dir: string,
  baseRoute: string,
  defaultChangeFrequency: SitemapEntry["changeFrequency"],
  defaultPriority: number,
  shouldIncludeSlug?: (slug: string) => boolean,
) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return [] as MdxRoute[];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .filter((entry) => {
      const slug = entry.name.replace(/\.mdx$/, "");
      return shouldIncludeSlug ? shouldIncludeSlug(slug) : true;
    })
    .map((entry) => {
      const slug = entry.name.replace(/\.mdx$/, "");
      const filePath = path.join(dir, entry.name);
      const content = fs.readFileSync(filePath, "utf8");
      const date = extractFrontmatterDate(content);
      const route = slug === "index" ? baseRoute : `${baseRoute}/${slug}`;

      return {
        route,
        date,
        changeFrequency: defaultChangeFrequency,
        priority: slug === "index" ? 1 : defaultPriority,
      };
    });
}

function buildLocalizedEntries(
  route: string,
  options: {
    lastModified?: string;
    changeFrequency: SitemapEntry["changeFrequency"];
    priority: number;
  },
) {
  return (appConfig.i18n.locales as string[]).map((locale) => ({
    url: toAbsoluteUrl(getLocalizedRoute(locale, route)),
    lastModified: options.lastModified,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { route: "/", changeFrequency: "daily" as const, priority: 1 }
  ];

  const archiveRoutes = getMdxRoutesFromDirectory(
    path.join(process.cwd(), resolveMdxSourceDir('archive')),
    "/archive",
    "monthly",
    0.8,
    (slug) => slug === "index" || getPublishedArchiveTopicBySlug(slug) !== null,
  );

  const legalRoutes = getMdxRoutesFromDirectory(
    path.join(process.cwd(), resolveMdxSourceDir('legal')),
    "/legal",
    "yearly",
    0.6,
  );

  return [
    ...staticRoutes.flatMap((route) =>
      buildLocalizedEntries(route.route, {
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }),
    ),
    ...archiveRoutes.flatMap((route) =>
      buildLocalizedEntries(route.route, {
        lastModified: route.date,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }),
    ),
    ...legalRoutes.flatMap((route) =>
      buildLocalizedEntries(route.route, {
        lastModified: route.date,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      }),
    ),
  ];
}
