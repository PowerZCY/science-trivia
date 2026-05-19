# Topic Article Generation Guide

This is the **single authoritative document** for generating weekly science trivia topic articles. It covers throughline differentiation, SEO keyword strategy, article structure, and the full production process.

Source files:

- `usb_rows.csv` — the 200-question source pool
- `src/lib/archive-topics.ts` — article registry (slug, metadata, question IDs)
- `src/mdx/archive/*.mdx` — published article files

## Core Principle: Throughline Differentiation

The most important decision in each article is the **throughline** — the single scientific insight that unifies every question in the article.

A throughline is not a topic label like "biology" or "physics." It is a mechanistic claim about how something works:

```
Good: "Plants solve real problems without brains, using chemical signals, genetic timers, and structural engineering."
Bad:  "These are interesting plant facts."

Good: "Human intuition about size and quantity breaks down because the brain is calibrated for medium-scale experience."
Bad:  "These are surprising numbers."
```

Every article's throughline must be **mechanistically distinct** from all other articles. Two articles can share a broad domain (e.g., human body) but not the same core insight.

## Throughline Differentiation Map

| Week | Slug | Throughline | Core Mechanism |
|------|------|-------------|----------------|
| 1 | everyday-science | Daily sensations hide real chemistry and physics | Receptor/molecule interaction mismatch |
| 2 | human-body | Body turns physical input into interpreted sensation | Nerve signal → perception pipeline |
| 3 | sleep-science | Sleep is a timed chemical process, not passive collapse | Circadian chemistry and adenosine signaling |
| 4 | plant-science | Plants decide without brains using precise mechanisms | Chemical/genetic/structural strategies |
| 5 | scale-science | Size, speed, and quantity break human intuition | Exponential growth and magnitude calibration failure |
| 6 | light-color | Light and color are constructed, not received | Wavelength–matter–observer interaction |
| 7 | body-design | The body is full of evolutionary design compromises | Structural trade-offs and inherited architecture |
| 8 | extreme-materials | Extreme conditions reorganize ordinary materials | Phase transitions and threshold physics |
| 9 | brain-tricks | The brain actively edits reality before you notice | Prediction, gap-filling, deletion, mislabeling |

Before starting a new article, check this table. If the proposed throughline could be summarized by an existing row's core mechanism, the article needs a different angle.

### Differentiation pitfall: overlapping body/perception articles

Week 2 (human-body) and Week 9 (brain-tricks) both involve perception, but they answer different questions:

- Week 2 asks: "How does the body generate a sensation from physical input?" (smell → memory, cold → brain freeze, pressure → phosphenes)
- Week 9 asks: "How does the brain edit, predict, and fill gaps in what you perceive?" (blind spot filling, dopamine prediction, bone-conduction voice merging)

Similarly, Week 2 (human-body) and Week 7 (body-design) share the domain "human body" but differ completely:

- Week 2 is about sensation and signal interpretation
- Week 7 is about structural architecture and evolutionary trade-offs (bones, organs, regeneration)

When two articles share a domain, the throughline distinction must be sharper.

## SEO Keyword Strategy

### Homepage vs Article Keyword Division

The homepage and topic articles target **different search intents**. They must not compete with each other.

**Homepage** targets broad quiz intent:

```
science trivia
science trivia questions
science quiz
science questions and answers
science trivia questions and answers
free science trivia
free online science quiz
```

**Topic articles** target long-tail explanation intent:

```
[topic] trivia
[topic] science questions
[topic] science facts
why does [phenomenon] happen
how does [phenomenon] work
science behind [everyday thing]
```

Rule: topic articles should never try to rank for `science trivia` or `science quiz` as their primary keyword. Those belong to the homepage. Articles rank for `[specific topic] trivia` and `why does [specific thing] happen`.

### Keyword Brief Template

Every article must have a keyword brief defined before writing. Use this template:

```
Topic:                          e.g., Plant Science
Primary keyword:                e.g., plant science trivia
Secondary keywords:             e.g., plant science questions, plant science facts, plant biology trivia
Long-tail question keywords:    e.g., why does a Venus flytrap count, why do bamboo bloom in sync,
                                why does cut grass smell, what causes autumn leaves to change color
Homepage anchor:                e.g., plant science trivia
Archive card anchor:            e.g., How Plants Decide Without a Brain
Article-to-homepage CTA anchor: e.g., Start Science Trivia (standard)
Avoid competing with:           e.g., Week 1 everyday-science (both have "chemistry" angle)
```

The "Avoid competing with" field is critical. If two articles target similar long-tail keywords, they cannibalize each other. Check the existing keyword map below before choosing keywords.

### Existing Article Keyword Map

| Week | Slug | Primary Keyword | Key Long-tail Targets |
|------|------|-----------------|----------------------|
| 1 | everyday-science | everyday science trivia | why does cilantro taste like soap, why does metal feel colder than wood, how does soap work |
| 2 | human-body | human body trivia | why does smell trigger memory, why do we get brain freeze, why do we see stars rubbing eyes |
| 3 | sleep-science | sleep science trivia | why does phone screen delay sleep, what does caffeine do to brain, how does coffee nap work |
| 4 | plant-science | plant science trivia | how does Venus flytrap count, why do bamboo bloom in sync, why does cut grass smell |
| 5 | scale-science | scale science trivia | fold paper 42 times moon, how heavy is a cloud, teaspoon of neutron star |
| 6 | light-color | light and color trivia | what color is the sun actually, why is Mars sunset blue, why is the sky blue |
| 7 | body-design | body design trivia | do identical twins have same fingerprints, smallest bone human body, largest organ human body |
| 8 | extreme-materials | extreme materials trivia | lightning glass fulgurite, Leidenfrost effect, why does Roman concrete last |
| 9 | brain-tricks | brain tricks trivia | why do you have a blind spot, why does voice sound different recording, why food bland stuffy nose |

When adding a new article, add its row to this table.

### Where to Place Keywords

Keywords must appear naturally. Never stuff. The placement priority:

1. **Title** (`title` in MDX frontmatter and `archive-topics.ts`): must contain the primary keyword. Format: `"[Primary Keyword]: [Throughline Hook]"`

   ```
   Good: "Plant Science Trivia: How Plants Decide Without a Brain"
   Bad:  "Amazing Plant Facts You Need to Know"
   Bad:  "Week 4: Plants"
   ```

2. **Description** (`description` in MDX frontmatter and `archive-topics.ts`): must name specific phenomena covered in the article. Include the primary keyword and 1–2 secondary keywords naturally.

   ```
   Good: "Plant science trivia about Venus flytraps counting, bamboo timing blooms across
         continents, grass sending chemical alarms, autumn color changes, climbing strategies,
         fire-triggered seeds, and waxy pine needles."
   Bad:  "A collection of interesting plant facts and science trivia questions about plants
         and biology and nature."
   ```

   The description test: does it tell a search user exactly what specific questions this article answers? If it could apply to any article on the same broad topic, it is too vague.

3. **Intro paragraph** (first ~100 words of article body): include the primary keyword once, naturally. This is the text Google often shows as a snippet.

   ```
   Good: "Plant science trivia is compelling because it starts with organisms
         that seem passive but turn out to have precise strategies."
   Bad:  "Welcome to this week's plant science trivia article about plant science
         trivia questions and plant science facts."
   ```

4. **H2 headings**: each H2 should be a real long-tail question keyword that someone would search. This is the most impactful SEO placement in the article.

   ```
   Good: "Why Does a Venus Flytrap Count Without a Brain?"  → ranks for "why does venus flytrap count"
   Good: "What Causes Leaves to Change Color in Autumn?"    → ranks for "what causes leaves change color autumn"
   Bad:  "The Bigger Idea"                                  → ranks for nothing
   ```

5. **Body text**: use secondary keywords and related terms naturally throughout. Do not repeat the exact primary keyword more than 2–3 times in the full article body. Use variations:

   ```
   Instead of repeating "plant science trivia" → use "plant biology," "botanical facts,"
   "how plants work," "plant mechanisms," "science behind plants"
   ```

6. **Tags** (in `archive-topics.ts`): 3 specific tags per article. Tags should be category-level terms useful for filtering, not keyword-stuffed phrases.

   ```
   Good: ["Plants", "Biology", "Evolution"]
   Bad:  ["Plant Science Trivia", "Plant Trivia Questions", "Plant Science Facts"]
   ```

7. **Highlights** (in `archive-topics.ts`): 3 lines for the homepage card. These function as micro-CTAs and should contain long-tail keywords naturally.

   ```
   Good: "How a Venus flytrap counts touches to decide whether prey is worth digesting"
   Bad:  "Learn about plant science trivia facts"
   ```

### Keyword Patterns for New Topics

When planning a new article, generate its keyword set from these templates:

**Primary keyword**: `[topic] science trivia` or `[topic] trivia`

**Secondary keywords**:
```
[topic] science questions
[topic] science facts
[topic] quiz questions
science behind [topic area]
```

**Long-tail question keywords** (one per H2):
```
why does [phenomenon] happen
how does [phenomenon] work
what causes [phenomenon]
why do [things] [behavior]
what is the [superlative] [thing] in [domain]
```

**Avoid these patterns**:
```
"interesting [topic] facts"          → too generic, no search intent
"amazing things about [topic]"       → clickbait, low trust
"[topic] trivia questions and answers" → competes with homepage
"fun [topic] quiz"                   → competes with homepage
```

## Generation Process

### Step 1: Identify Unused Questions

```bash
# Get all question IDs already used in archive-topics.ts
grep -oP '"[0-9]+"' src/lib/archive-topics.ts | sort -u > /tmp/used.txt

# Count remaining
python3 -c "
import csv
used = set(open('/tmp/used.txt').read().replace('\"','').split())
with open('usb_rows.csv') as f:
    reader = csv.DictReader(f)
    remaining = [r for r in reader if r['id'] not in used]
print(f'Remaining: {len(remaining)} total')
print(f'Primary-eligible (as_first=1): {sum(1 for r in remaining if r[\"as_first\"]==\"1\")}')
"
```

### Step 2: Cluster by Mechanism, Not by Label

Search remaining questions with keyword groups, but then look for **shared mechanisms** within each cluster:

```bash
python3 -c "
import csv
used = {...}  # IDs from step 1
keywords = ['space','planet','moon','star','sun','earth','orbit']
with open('usb_rows.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['id'] not in used and any(k in row['question'].lower() for k in keywords):
            print(f\"{row['id']} (af={row['as_first']}) {row['question'][:90]}\")
"
```

A keyword cluster of 15 "space" questions is not automatically one article. Ask: what mechanistic claim can unify 6–8 of these questions? If the answer is "they're all about space," the cluster needs splitting.

### Step 3: Select Primary + Supporting Questions

For each proposed article:

1. **Primary question** must be `as_first=1`, easy to understand, and represent the article's throughline
2. **Supporting questions** (3–8) must each strengthen or complicate the throughline
3. Fill out the validation table from `weekly-topic-article-workflow.md`:

```
Question ID | Fact Point | Scientific Mechanism | Why It Belongs in This Topic | Keep?
```

Remove any question that only shares a broad label but does not serve the throughline.

### Step 4: Build the Keyword Brief

Before writing, fill out the keyword brief template from the SEO Keyword Strategy section above. This step catches two problems early:

1. **Keyword collision**: if the primary keyword or long-tail targets overlap with an existing article, adjust the angle or merge the topics.
2. **Missing search intent**: if you cannot write 4+ natural long-tail question keywords for the H2s, the topic may not have enough searchable questions to justify an article.

Add the completed brief to the Existing Article Keyword Map table.

### Step 5: Write the Article

Structure:

```
Frontmatter (title, description, date)
Intro: pose primary question, answer it, state throughline, include primary keyword once
H2: primary question deep-dive (or first supporting, if primary is fully covered in intro)
H2: supporting question 2
H2: supporting question 3
...
H2: synthesis question ("Why does X work this way?")
Callout CTA (link to homepage)
## Final Takeaway
```

#### H2 Rules

Every H2 must be a **real searchable question**. This is the single most impactful SEO placement in the article — each H2 is a long-tail keyword target.

```
Good: "Why Does a Venus Flytrap Count Without a Brain?"
Good: "What Causes Leaves to Change Color in Autumn?"
Bad:  "The Bigger Idea"
Bad:  "What Human Body Facts Are Easy to Misread?"
Bad:  "How Do Nerve Signals, Blood Vessels, and Brain Interpretation Build What You Feel?"
```

The test: would a person type this H2 into Google? If not, rewrite it. Keep H2s under ~12 words — longer headings are usually keyword-stuffed.

The closing synthesis H2 is the one exception — it should still be a question, but it synthesizes the throughline rather than answering a single trivia fact:

```
"Why Do Plants Without Brains Seem to Make Good Decisions?"
"Why Does Scale Break Human Intuition?"
"Why Does the Brain Edit Reality Instead of Showing It Raw?"
```

#### Keyword Placement in the Article Body

- **Title**: must contain the primary keyword. Format: `"[Primary Keyword]: [Throughline Hook]"`
- **Description**: name specific phenomena; include primary keyword and 1–2 secondary keywords naturally
- **Intro paragraph**: include the primary keyword once in the first ~100 words
- **H2s**: each is a long-tail question keyword (see above)
- **Body text**: use secondary keywords and related terms; do not repeat the exact primary keyword more than 2–3 times total; use variations instead

Do not stuff. If a keyword placement feels forced, remove it.

#### Word Count

Minimum 1,000 words. In practice, articles with 6+ supporting questions naturally land at 2,000–3,000 words. Do not pad to hit a target; do not cut useful explanations to stay short.

#### CTA Format

Every article ends with:

```mdx
<Callout type="success">
  **Want another Science Trivia set?** Head back to the homepage to generate five fresh science questions and answers, or keep exploring the archive for more weekly science trivia themes.
  <GradientButton
    title="Start Science Trivia"
    href="/"
    align="center"
  />
</Callout>

## Final Takeaway

[One-paragraph synthesis that connects all facts back to the throughline.]
```

### Step 6: Register in archive-topics.ts

Add an entry to the `archiveTopics` array:

```typescript
{
  slug: "topic-name-trivia",           // kebab-case, matches MDX filename
  title: "...",                         // matches MDX frontmatter title
  description: "...",                   // matches MDX frontmatter description
  publishDate: "YYYY-MM-DD",           // Sunday of the publish week
  weekStart: "YYYY-MM-DD",             // same as publishDate
  weekNumber: N,                        // sequential
  status: "published",
  primaryQuestionId: "XXXXX",
  supportingQuestionIds: ["...", "..."],
  tags: ["Tag1", "Tag2", "Tag3"],       // 3 tags, specific not generic
  highlights: [                         // 3 highlights for homepage card
    "Why [specific surprising claim]",
    "How [specific mechanism]",
    "Why [specific counterintuitive fact]",
  ],
},
```

Highlights must be specific and clickable. They appear on the homepage card and function as micro-CTAs — they should contain long-tail keywords naturally and make someone want to read the article.

```
Good: "Why identical twins have different fingerprints despite sharing the same DNA"
Bad:  "Learn about the human body"
```

### Step 7: Verify

```bash
# TypeScript compile check
npx tsc --noEmit --pretty

# Word count
wc -w src/mdx/archive/new-article.mdx

# H2 structure
grep '^##' src/mdx/archive/new-article.mdx

# No question ID reuse across articles
python3 -c "
import csv
# ... check that no question ID appears in multiple articles' primary+supporting
"
```

## Current State

As of 2026-05-19:

- **9 articles** published (Week 1–9)
- **63 questions** used out of 200
- **137 questions** remaining (32 primary-eligible)
- **Total word count**: ~23,400 words across all articles

## Remaining Question Pool Analysis

The remaining 137 questions can support approximately 4–6 more articles with strong throughlines. The richest remaining clusters are:

### Space and Astronomy (~20 unused questions)

Potential throughlines:
- "Space makes familiar physics behave in unfamiliar ways" (astronaut height, no sound, different sunsets — but Mars sunset is already used in Week 6)
- "The solar system is full of extremes that Earth normalizes" (temperature variations, tidal locking, rogue planets)

Caution: many "space trivia" facts are isolated fun facts without a shared mechanism. This cluster needs careful throughline work to avoid becoming a listicle.

### Earth Systems (~15 unused questions)

Potential throughlines:
- "Earth's surface is constantly reshaped by processes too slow to see" (tides, seasons, mountain rebound, ice formation, volcanic islands)
- "Weather involves more hidden mechanics than the daily forecast suggests" (hail in summer, dirty thunderstorms, ice disks, sea smoke)

### Food and Kitchen Science (~10 unused questions)

Some overlap with Week 1 (everyday science). A new food article would need a different angle:
- "Food preservation and cooking are chemistry, not intuition" (ice cream sweetness, popsicle physics, egg chemistry, garlic — but garlic is used in Week 9)

### Parasites, Fungi, and Biological Manipulation (~8 unused questions)

Potential throughline:
- "Some organisms survive by manipulating other organisms' behavior" (zombie ants, toxoplasma in rodents, fairy rings, fungi closer to animals)

This is a strong cluster with a clear, distinct throughline.

### Unusual Natural Phenomena (~12 unused questions)

Potential throughline:
- "Nature regularly produces things that look impossible" (pink lakes, moonbows, fire behind waterfalls, blood falls, morning glory clouds, brinicles)

Risk: could become a spectacle listicle without a unifying mechanism. Would need a throughline about how each phenomenon involves a specific physical or chemical process that only triggers under rare conditions.

## Common Mistakes to Avoid

1. **Throughline too broad**: "These are interesting science facts" is not a throughline. Ask: what claim about how the world works would be weakened if I removed any of these questions?

2. **H2 as summary label**: "The Bigger Idea" or "What We Can Learn" are not searchable. Rewrite as a question someone would type into Google.

3. **H2 too long**: "How Do Nerve Signals, Blood Vessels, and Brain Interpretation Build What You Feel?" — this is keyword-stuffed. Keep H2s under ~12 words when possible.

4. **Domain overlap without mechanism differentiation**: Two "human body" articles are fine. Two articles whose throughline is "perception is brain-constructed" are not.

5. **Primary question reuse**: Supporting questions can appear in multiple articles from different angles, but primary questions should not repeat.

6. **Generic highlights**: "Learn about sleep science" will not get clicks. "Why your biological clock is not exactly 24 hours and what resets it" will.

7. **Forgetting to check question ID collisions**: Before finalizing, verify that no question ID appears in both the new article and any existing article's `primaryQuestionId` or `supportingQuestionIds`.

8. **Keyword collision with existing articles**: Before writing, check the Existing Article Keyword Map. If the new article's primary keyword or key long-tail targets overlap with an existing article, either adjust the angle or the keyword targeting. Two articles competing for the same query split authority and both rank worse.

9. **Title not searchable**: "Week 4: Plants" or "The Hidden World of Vegetation" will not rank. The title must contain the primary keyword and a specific hook. Format: `"[Primary Keyword]: [Throughline Hook]"`.

10. **Description too vague**: "A collection of interesting plant science facts" could describe any plant article. The description must name the specific phenomena covered — it is both a keyword placement and a click-through signal.
