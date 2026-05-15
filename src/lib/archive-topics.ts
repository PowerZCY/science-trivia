import "server-only";

export type ArchiveTopicStatus = "published" | "scheduled";

export type ArchiveTopic = {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  weekStart: string;
  weekNumber: number;
  status: ArchiveTopicStatus;
  primaryQuestionId: string;
  supportingQuestionIds: string[];
  tags: string[];
  highlights: string[];
};

export const archiveTopics = [
  {
    slug: "everyday-science-is-stranger-than-it-looks",
    title: "Everyday Science Is Stranger Than It Looks",
    description:
      "A guided tour through kitchen chemistry, heat transfer, taste, smell, and soap: ordinary moments that work very differently from how they feel.",
    publishDate: "2026-05-04",
    weekStart: "2026-05-04",
    weekNumber: 1,
    status: "published",
    primaryQuestionId: "10054",
    supportingQuestionIds: ["10017", "10155", "10221", "10395", "10662"],
    tags: ["Everyday Science", "Chemistry", "Senses"],
    highlights: [
      "Why cilantro can genuinely taste soapy to some people",
      "Why cold, freshness, and cleanliness are not always what they feel like",
      "How tiny molecular and heat-transfer effects shape daily experience",
    ],
  },
  {
    slug: "the-body-is-not-as-simple-as-it-feels",
    title: "The Body Is Not as Simple as It Feels",
    description:
      "A science trivia theme about smell, memory, pain, balance, brain freeze, phosphenes, and the hidden systems behind familiar sensations.",
    publishDate: "2026-05-11",
    weekStart: "2026-05-11",
    weekNumber: 2,
    status: "published",
    primaryQuestionId: "10308",
    supportingQuestionIds: ["10031", "10073", "10246", "10279", "10636", "10400"],
    tags: ["Human Body", "Neuroscience", "Perception"],
    highlights: [
      "Why smell can unlock memory and emotion so directly",
      "How nerves, blood vessels, and balance systems turn signals into sensation",
      "Why pain and perception often say more than simple damage does",
    ],
  },
] as const satisfies ArchiveTopic[];

function getTodayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

export function isArchiveTopicPublished(topic: ArchiveTopic, today = getTodayUtcDate()) {
  return topic.status === "published" && topic.publishDate <= today;
}

export function getPublishedArchiveTopics(today = getTodayUtcDate()) {
  return archiveTopics
    .filter((topic) => isArchiveTopicPublished(topic, today))
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export function getLatestPublishedArchiveTopic(today = getTodayUtcDate()) {
  return getPublishedArchiveTopics(today)[0] ?? null;
}

export function getArchiveTopicBySlug(slug: string) {
  return archiveTopics.find((topic) => topic.slug === slug) ?? null;
}

export function getPublishedArchiveTopicBySlug(slug: string, today = getTodayUtcDate()) {
  const topic = getArchiveTopicBySlug(slug);
  return topic && isArchiveTopicPublished(topic, today) ? topic : null;
}
