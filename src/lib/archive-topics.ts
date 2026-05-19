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
    slug: "everyday-science-trivia",
    title: "Everyday Science Trivia: Why Ordinary Things Work Differently Than They Feel",
    description:
      "Explore cilantro, stale bread, cold metal, awful orange juice, wet towels, and soap: familiar moments explained by hidden chemistry, heat transfer, and sensory biology.",
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
      "How receptors, starch structure, heat flow, evaporation, and soap chemistry shape daily experience",
    ],
  },
  {
    slug: "sleep-science-trivia",
    title: "Sleep Science Trivia: Why Your Body Fights You at Bedtime",
    description:
      "Sleep science trivia about blue light, circadian rhythms, adenosine, caffeine naps, hypnagogic hallucinations, and REM muscle paralysis — the biology behind why sleep is harder than it should be.",
    publishDate: "2026-05-18",
    weekStart: "2026-05-18",
    weekNumber: 3,
    status: "published",
    primaryQuestionId: "10242",
    supportingQuestionIds: ["10573", "10503", "10180", "10618", "10732"],
    tags: ["Sleep", "Neuroscience", "Circadian Rhythm"],
    highlights: [
      "Why phone screens at night can shift your entire sleep schedule, not just delay it",
      "Why your biological clock is not exactly 24 hours and what resets it",
      "How a coffee nap works by exploiting the 20-minute gap before caffeine kicks in",
    ],
  },
  {
    slug: "human-body-trivia",
    title: "Human Body Trivia: Smell, Memory, Pain, Balance, and Brain Freeze",
    description:
      "Follow smell, memory, pain, balance, brain freeze, phosphenes, pins and needles, and wrinkled fingers through the hidden systems behind familiar sensations.",
    publishDate: "2026-05-11",
    weekStart: "2026-05-11",
    weekNumber: 2,
    status: "published",
    primaryQuestionId: "10308",
    supportingQuestionIds: ["10031", "10073", "10246", "10279", "10636", "10400"],
    tags: ["Human Body", "Neuroscience", "Perception"],
    highlights: [
      "Why smell can unlock memory and emotion so directly",
      "Why brain freeze starts in your mouth but feels like pain in your head",
      "How nerves, blood vessels, balance systems, and body position turn signals into sensation",
    ],
  },
  {
    slug: "plant-science-trivia",
    title: "Plant Science Trivia: How Plants Decide Without a Brain",
    description:
      "Plant science trivia about Venus flytraps counting, bamboo timing blooms across continents, grass sending chemical alarms, autumn color changes, climbing strategies, fire-triggered seeds, and waxy pine needles.",
    publishDate: "2026-05-25",
    weekStart: "2026-05-25",
    weekNumber: 4,
    status: "published",
    primaryQuestionId: "10210",
    supportingQuestionIds: ["10283", "10059", "10407", "10665", "10392", "10626"],
    tags: ["Plants", "Biology", "Evolution"],
    highlights: [
      "How a Venus flytrap counts touches to decide whether prey is worth digesting",
      "Why bamboo species bloom in sync across continents after decades of silence",
      "Why the smell of cut grass is actually a chemical distress signal",
    ],
  },
  {
    slug: "scale-science-trivia",
    title: "Scale Science Trivia: Why Size, Speed, and Quantity Break Human Intuition",
    description:
      "Explore scale science trivia about paper folding to the Moon, floating Saturn, cloud weight, lightning temperature, neutron stars, and why exponential growth defeats the human brain.",
    publishDate: "2026-06-01",
    weekStart: "2026-06-01",
    weekNumber: 5,
    status: "published",
    primaryQuestionId: "10265",
    supportingQuestionIds: ["10056", "10160", "10382", "10184", "10425", "10396"],
    tags: ["Scale", "Physics", "Astronomy"],
    highlights: [
      "Why folding paper 42 times would reach the Moon through exponential doubling",
      "How a cloud can weigh hundreds of tons and still float",
      "Why a teaspoon of neutron star material would weigh as much as a mountain",
    ],
  },
  {
    slug: "light-color-science-trivia",
    title: "Light and Color Science Trivia: Why Nothing Looks the Way You Think",
    description:
      "A light and color science trivia guide about the sun's true color, Martian blue sunsets, Rayleigh scattering, human bioluminescence, circular rainbows, sonoluminescence, and Lichtenberg figures.",
    publishDate: "2026-06-08",
    weekStart: "2026-06-08",
    weekNumber: 6,
    status: "published",
    primaryQuestionId: "10222",
    supportingQuestionIds: ["10138", "10014", "10459", "10572", "10708", "10540"],
    tags: ["Light", "Color", "Physics"],
    highlights: [
      "Why the sun is actually white and our atmosphere makes it look yellow",
      "Why sunsets on Mars are blue instead of red",
      "How sound waves can make a bubble produce a flash of light",
    ],
  },
  {
    slug: "body-design-science-trivia",
    title: "Body Design Science Trivia: The Strange Architecture of Being Human",
    description:
      "Body design science trivia about twin fingerprints, baby bones fusing, foot architecture, the smallest bone, corneal oxygen, liver regeneration, spleen removal, and why skin is your largest organ.",
    publishDate: "2026-06-15",
    weekStart: "2026-06-15",
    weekNumber: 7,
    status: "published",
    primaryQuestionId: "10302",
    supportingQuestionIds: ["10426", "10280", "10291", "10398", "10269", "10327", "10158"],
    tags: ["Human Body", "Anatomy", "Evolution"],
    highlights: [
      "Why identical twins have different fingerprints despite sharing the same DNA",
      "Why a quarter of your bones are packed into your feet",
      "How your cornea breathes directly from the air instead of using blood vessels",
    ],
  },
  {
    slug: "extreme-materials-science-trivia",
    title: "Extreme Materials Science Trivia: What Happens When Ordinary Stuff Meets Extraordinary Conditions",
    description:
      "Extreme materials science trivia about lightning glass, the Leidenfrost effect, floating pumice, Roman concrete that strengthens in seawater, pottery glaze as glass, and why lightning zigzags.",
    publishDate: "2026-06-22",
    weekStart: "2026-06-22",
    weekNumber: 8,
    status: "published",
    primaryQuestionId: "10060",
    supportingQuestionIds: ["10681", "10170", "10343", "10671", "10390"],
    tags: ["Materials", "Physics", "Chemistry"],
    highlights: [
      "How lightning melts sand into glass tubes that trace the bolt's path underground",
      "Why a water drop dances on a scorching pan instead of evaporating instantly",
      "Why ancient Roman concrete gets stronger in seawater while modern concrete crumbles",
    ],
  },
  {
    slug: "brain-tricks-science-trivia",
    title: "Brain Tricks Science Trivia: How Your Brain Edits Reality Before You Notice",
    description:
      "Brain tricks science trivia about blind spots, bland food, spicy nose, fizzy burn, voice recordings, dopamine prediction, childhood amnesia, dizziness, and garlic breath from your lungs.",
    publishDate: "2026-06-29",
    weekStart: "2026-06-29",
    weekNumber: 9,
    status: "published",
    primaryQuestionId: "10329",
    supportingQuestionIds: ["10046", "10190", "10323", "10397", "10427", "10386", "10716", "10553"],
    tags: ["Brain", "Perception", "Neuroscience"],
    highlights: [
      "Why your brain fills in a blind spot you never notice instead of showing you a gap",
      "Why dopamine rises before a musical peak arrives, not after",
      "Why garlic breath comes from your lungs, not your mouth",
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
