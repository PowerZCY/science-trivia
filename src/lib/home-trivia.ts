import "server-only";

import {
  getLatestPublishedArchiveTopic,
  type ArchiveTopic,
} from "@/lib/archive-topics";

export type HomeTriviaData = {
  featuredTopic: ArchiveTopic | null;
};

export async function getHomeTriviaData(): Promise<HomeTriviaData> {
  return {
    featuredTopic: getLatestPublishedArchiveTopic(),
  };
}
