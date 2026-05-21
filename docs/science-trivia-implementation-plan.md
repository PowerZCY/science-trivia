# Science Trivia 迁移与实施方案

## 文档目的

这份文档沉淀 Daily Trivia 项目迁移为 Science Trivia 的确认方案与开发计划。

当前目标不是简单替换站点名称，而是把产品拆成两条稳定能力：

- 双周一期 Science 主题文章，用 archive 页面沉淀长期内容价值
- 随机生成 5 道 Science Trivia 题，用缓存为每个用户维持短期内不重复的答题体验

本文只描述已确认方案。未确认或后续可优化的方向会明确标记。

## 已确认产品规则

### 路由规则

对外不再保留 `blog` 路由。

- 删除 `src/app/[locale]/(content)/blog`
- 新建或迁移为 `src/app/[locale]/(content)/archive`
- 不提供 `/blog -> /archive` redirect
- 导航、sitemap、metadata、Next output tracing 只保留 `/archive`

内部 MDX 数据源继续使用现有 `blog` sourceKey 与目录，不重命名：

- `sourceKey = "blog"`
- `src/mdx/blog`

这样可以降低改动范围，避免同时重构 `site-docs-base.ts`、`.source` 生成配置。后续也不计划把内部 sourceKey 和目录重命名为 archive，除非项目整体文档系统另行重构。

### MDX 内容规则

现有 MDX schema 不支持自定义 frontmatter 字段，因此 MDX 文件只使用现有字段：

```yaml
---
title: ...
description: ...
date: 2026-05-04
---
```

发布时间、是否精选、关联题目、主题分组等额外信息放在 TypeScript 配置中维护，例如：

```ts
// src/lib/archive-topics.ts
export const archiveTopics = [
  {
    slug: "everyday-science-trivia",
    publishDate: "2026-05-04",
    issueStartDate: "2026-05-04",
    issueNumber: 1,
    status: "published",
    primaryQuestionId: "10017",
    supportingQuestionIds: ["10155", "10221", "10395", "10662"],
  },
];
```

首页和 archive 聚合页都从该配置读取发布状态。

### 双周发布规则

第 1 期从 `2026-05-04T00:00:00Z` 开始。

采用每两周一次、周一 UTC+0 发布：

- 第 1 期：2026-05-04 00:00 UTC
- 第 2 期：2026-05-18 00:00 UTC
- 第 3 期：2026-06-01 00:00 UTC

说明：

- 美国常见日历习惯是周日作为一周第一天
- 英国与 ISO 8601 更常见周一作为一周第一天
- 本项目采用 UTC+0 + 隔周周一发布，便于全球用户与服务端计算保持一致
- `issueNumber` 表示第几期文章，不表示日历周编号
- `issueStartDate` 表示该期开始日期，通常与 `publishDate` 一致

展示规则：

- 首页 Featured Issue 只展示 `publishDate <= now(UTC)` 的最新一期
- `/archive` 聚合页只展示已发布文章
- 未到发布时间的文章可以提前存在于仓库，但不在首页、聚合页和 sitemap 中展示

关于“未发布 MDX 文件是否需要从静态生成中彻底排除”的说明：

- 含义是：如果一篇 MDX 文件已经写好但 `publishDate` 还没到，是否允许它通过直接访问 URL 被打开，或出现在 Next/Fuma 的静态生成参数里
- 已确认策略：页面展示层必须过滤未发布内容；sitemap 不收录未发布内容
- 实现时优先让未发布内容也不能通过直接 URL 访问；如果 Fuma 默认静态参数生成机制不方便过滤，则至少要在页面层按 `archiveTopics` 判断并返回 `notFound()`
- 这项属于实现阶段重点验证项

## 双周主题内容策略

### 文章定位

每篇 issue article 不是单题长答案，而是一篇由多道题共同支撑的 Science 主题文章。

写作目标：

- 以 1 道题作为主要入口
- 关联 3 到 6 道题作为横向支撑
- 围绕一个真实成立的科学主线展开
- 保持深度与广度，而不是把不相关事实堆在一起

题目允许重复出现在不同主题文章下。

规则：

- 同一道题可以在不同文章中服务不同角度
- 同一篇文章内部不重复使用同一道题
- `primaryQuestionId` 尽量不要跨文章重复，保证每期主入口新鲜
- `supportingQuestionIds` 可以跨主题重复

### 主题抽象流程

标签只用于发现候选主题，不能直接决定文章主题。

推荐流程：

1. 从 `usb_rows.csv` 中初筛候选题
2. 给候选题标注领域、机制、体验类型、主题适配方向
3. 提出一句共同主线假设
4. 为每道题写一句“它如何支持主线”
5. 删除无法支持主线的题
6. 再确定标题、大纲和 MDX 正文

每篇文章进入写作前需要形成这张校验表：

```txt
题目 ID | 事实点 | 科学机制 | 它为什么属于本主题 | 是否保留
```

### 事实一致性校验

主题文章必须通过以下检查：

- 是否处于同一解释层级
- 是否共享同一核心机制，或存在清晰的对照机制
- 是否把类比误写成因果
- 每个支撑题是否能回到题目事实
- 标题是否过度承诺

允许的表达：

```txt
这些现象都说明感觉不是温度计。
```

不允许的表达：

```txt
这些现象都由同一种热学原理导致。
```

### 第一批两个主题与最终题目 ID

第一批先从 200 道题中精选两个主题，完成大纲与文章，再继续扩展后续主题。

#### 主题 1：Everyday Science Is Stranger Than It Looks

定位：日常生活里的反直觉科学。

最终题目 ID：

```txt
primaryQuestionId: 10054
supportingQuestionIds:
- 10017
- 10155
- 10221
- 10395
- 10662
```

题目对应关系：

- `10054`：Why do some people say cilantro tastes like soap?
- `10017`：Why does bread go stale faster in the refrigerator?
- `10155`：Why does metal feel colder than wood at the same temperature?
- `10221`：Why does orange juice taste especially awful right after you brush your teeth?
- `10395`：Why does a wet towel feel colder than a dry one at the same room temperature?
- `10662`：Why is soap so effective at destroying viruses with an outer envelope, like influenza and coronaviruses?

共同主线：

```txt
人的直觉经常把感觉误认为事实，但日常现象背后通常有具体的物理、化学或生物机制。
```

#### 主题 2：The Body Is Not as Simple as It Feels

定位：人体感知、反射和隐藏机制。

最终题目 ID：

```txt
primaryQuestionId: 10308
supportingQuestionIds:
- 10031
- 10073
- 10246
- 10279
- 10636
- 10400
```

题目对应关系：

- `10308`：Which sense is most directly linked to memory and emotion?
- `10031`：Why do you see stars when you rub your eyes?
- `10073`：What causes the 'brain freeze' headache when eating cold food too fast?
- `10246`：What causes the 'pins and needles' sensation when a limb 'falls asleep'?
- `10279`：What is the best-supported explanation for why your fingers wrinkle after soaking in water?
- `10636`：Why is balancing harder when you close your eyes?
- `10400`：Why does a tiny paper cut on your fingertip often hurt more than a much larger scrape elsewhere?

共同主线：

```txt
身体不是被动接收世界，而是在持续解释神经、血流、压力、温度和环境信号。
```

### Archive 页面体验

`/archive` 聚合页承载 biweekly issue articles 列表。

保留 Fuma `index.mdx` 作为 archive 正文入口：

- `src/mdx/blog/index.mdx` 继续作为 `/archive` 首页内容源
- 页面外层可以使用自定义服务端组件渲染 archive 列表
- MDX 正文用于标题、说明、内容导语和必要的静态文案
- 聚合列表的数据来源以 `src/lib/archive-topics.ts` 为准

设计方向参考现有 `DailyQuizArchive`，但需要重新设计为 Science 主题文章列表：

- 移动端单列
- 桌面端保持纵向列表或清晰分组，不做松散卡片墙
- 每张卡片展示发布日期、期数、标题、摘要和主题标签
- 卡片点击进入对应 MDX 文章
- 首页只展示最新一期精选卡片，并提供 archive 按钮进入 `/archive`

## 随机 5 题设计

### 数据库题池表

新增 `science_question_pool` 表。

业务字段只需要题目 id 与启用状态：

```sql
CREATE TABLE IF NOT EXISTS dailyt.science_question_pool (
  id BIGSERIAL PRIMARY KEY,
  question_id BIGINT NOT NULL UNIQUE,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

Prisma model 建议命名为 `ScienceQuestionPool`。

业务查询只读取：

```ts
where: { enabled: 1 }
select: { questionId: true }
```

CSV 只用于初始化导入题目 id，不作为运行时热路径数据源。

### 缓存分组规则

使用 Upstash Redis，参考 `docs/upstash-skills.md`。

每个用户 uuid 独立维护一套随机题组缓存。

规则：

- 从数据库读取所有 `enabled = 1` 的 `question_id`
- 随机洗牌
- 每 5 个 id 切一组
- 不足 5 个的尾组丢弃
- 每次请求取下一组
- 组用完后重新生成
- TTL 设为 30 天

推荐缓存 key：

```txt
science-trivia:user-groups:{uuid}
```

缓存结构：

```ts
type ScienceQuizGroupCache = {
  version: 1;
  cursor: number;
  groups: string[][];
};
```

写入 TTL：

```ts
await setJson(key, cache, 60 * 60 * 24 * 30);
```

### 并发控制

用户连续点击生成题目时，可能出现两个请求同时读取同一个 cursor 的问题。

建议使用 Upstash `withLock`：

```txt
science-trivia:user-groups-lock:{uuid}
```

取组、cursor 递增、缓存写回都放在锁内完成。

如果获取锁失败：

- 返回 409
- 前端展示正在生成中的轻提示
- 或短暂重试一次

### Redis 不可用时的降级

Upstash 封装在 Redis 未配置或不可用时，读取类函数可能返回 `null`。

业务上不需要在 Redis 不可用时继续保证不重复。

最终规则：

- Redis 正常：同 uuid 在 30 天 TTL 内按缓存分组取题，尽量保证不重复
- Redis 不可用：从数据库临时随机取 5 道题，仍可答题，但不保证和之前不重复

### FAQ SDK 获取题目详情

随机分组只生成题目 id。

拿到 5 个 id 后，通过 FAQ SDK 获取完整题目详情：

```ts
const result = await faqClient.v1.questionsBase.getByIds(ids);
```

SDK 调用必须在服务端执行，不放到浏览器端。

推荐新增 API：

```txt
POST /api/science-quiz/generate
```

请求：

```ts
{
  uuid: string;
}
```

返回：

```ts
{
  quizId: string;
  questionIds: string[];
  questions: DailyQuizQuestion[];
  remainingGroups: number;
  cacheAvailable: boolean;
}
```

## 首页调整

首页保留每日 5 题样式，但改为用户点击生成题目。

首页结构：

1. 标题区
2. Featured Issue 最新一期精选内容卡片
3. 随机 5 题生成与答题模块

首页不再展示题目列表模块。

旧 `DailyQuizArchive` 不再放在首页，列表职责移到 `/archive` 聚合页。

### SSR 与 SEO 要求

首页 hero 模块中的核心文案必须服务端渲染，便于 SEO：

- H1
- 首页说明文案
- Featured Issue 标题、摘要、精华点
- archive 按钮文案
- 随机答题模块的静态标题与说明文案

可以保留客户端交互的部分：

- 点击生成题目
- 加载状态
- 答题过程
- 答题报告
- 本地完成状态

`/archive` 首页也必须服务端渲染核心内容：

- archive 页面标题与说明
- 已发布文章列表
- 每篇文章的标题、摘要、发布日期、期数、主题标签
- 指向文章详情的链接

客户端组件只用于必要的交互增强，不承担主要 SEO 文案输出。

## Analytics 埋点规则

当前 Science Trivia 只保留和随机答题、archive 点击直接相关的 GA 事件。

事件命名规则：

- 使用现在时，不使用过去时
- 不沿用旧的 `daily_quiz_*` 事件名
- 不传通用参数，如 `quiz_mode`、`quiz_id`、`question_count`、`locale`、`source`
- `source` 只用于生成失败事件，用来区分失败入口

已确认事件：

```ts
science_quiz_generate_start: {}

science_quiz_generate_fail: {
  source: "home_start" | "report_new";
  reason: "http_error" | "empty_quiz" | "network_error" | "unknown";
}

science_quiz_new_click: {}

science_quiz_complete: {
  score: number;
}

science_quiz_retry_click: {
  score: number;
}

science_archivepage_card_click: {
  issue_number: number;
}

science_readmore_click: {
  issue_number: number;
}

science_readarchive_click: {}
```

触发规则：

- `science_quiz_generate_start`：首页初始状态点击生成题目按钮时触发
- `science_quiz_generate_fail`：生成题目请求失败或返回无效题目时触发
- `science_quiz_new_click`：报告页点击生成新 quiz 时触发
- `science_quiz_complete`：最后一题答完并完成本轮 quiz 时触发
- `science_quiz_retry_click`：报告页点击 retry 当前 quiz 时触发
- `science_archivepage_card_click`：`/archive` 聚合页点击文章卡片时触发
- `science_readmore_click`：首页 Featured Issue 卡片点击 read more 时触发
- `science_readarchive_click`：首页 Featured Issue 卡片点击 archive 时触发

生成失败原因分类：

- `http_error`：`POST /api/science-quiz/generate` 返回非 2xx
- `empty_quiz`：接口返回成功，但没有有效的 `quiz.questions`
- `network_error`：浏览器 `fetch` 抛出网络类错误
- `unknown`：其他未归类错误

## 开发计划

### 阶段 1：内容与路由迁移

- 删除 `src/app/[locale]/(content)/blog`
- 新建 `src/app/[locale]/(content)/archive`
- 让 archive 路由继续读取 `sourceKey = "blog"`
- 修改导航：`Blog` 改为 `Archive`
- 修改 sitemap：输出 `/archive`，不输出 `/blog`
- 修改 `next.config.ts` output tracing，补充 archive 路由
- 确认 `/blog` 不再可访问

### 阶段 2：双周内容配置与页面展示

- 新增 `src/lib/archive-topics.ts`
- 设计 published topic 过滤函数
- 首页新增 Featured Issue 卡片
- `/archive` 聚合页保留 Fuma `index.mdx` 作为正文入口，并按 `archiveTopics` 服务端展示已发布文章
- 保留 MDX 正文由 Fuma page 渲染
- 移除首页旧题目列表模块
- 确保首页 hero 与 `/archive` 聚合页核心文案服务端渲染

### 阶段 3：首批两篇主题文章

- 使用已确认的两组题目 ID
- 为每篇文章建立事实一致性校验表
- 完成两篇 MDX 大纲
- 按 `docs/fuma-mdx.mdx` 规则写完整文章
- 更新 `src/mdx/blog/index.mdx` 聚合入口内容
- 更新 `archiveTopics` 配置

### 阶段 4：题池表与数据导入

- 在 Prisma schema 中新增 `ScienceQuestionPool`
- 在数据库 SQL 中新增 `science_question_pool`
- 准备一次性导入脚本或 SQL，将 `usb_rows.csv` 中的题目 id 写入新表
- 运行 Prisma generate
- 校验表中题目数量与 CSV 数量一致

### 阶段 5：随机题组服务

- 新增服务端模块读取 enabled question ids
- 实现洗牌与 5 个一组切分
- 丢弃不足 5 个尾组
- 实现 Upstash Redis get/set 缓存
- 实现 `withLock` 并发控制
- 实现 Redis 不可用时的临时随机降级

### 阶段 6：生成题目 API

- 新增 `POST /api/science-quiz/generate`
- 接收 uuid
- 获取下一组题目 id
- 用 FAQ SDK `getByIds` 获取题目详情
- 返回前端答题 payload
- 处理 SDK 失败、题目不足、锁冲突等错误状态

### 阶段 7：答题客户端改造

- 保留现有 5 题答题 UI
- 增加点击生成题目的初始状态
- 将 localStorage key 从 `daily-trivia` 迁移到 `science-trivia`
- 用 `quizId` 存储单轮完成记录
- 分享文案、埋点事件和标题文案改为 Science Trivia
- 验证移动端布局

### 阶段 8：验证与收尾

- 运行 lint/build
- 验证 `/archive`、文章详情、首页 Featured Issue 卡片
- 验证随机生成题目 API
- 验证 Redis 正常与 Redis 降级路径
- 验证 sitemap 不再包含 `/blog`
- 检查移动端首页、archive 列表和答题报告

## 待后续确认

- 未发布 MDX 文件在 Fuma/Next 静态生成阶段的最佳过滤方式
- `/archive` 聚合页自定义服务端列表与 Fuma 页面生成器的具体集成方式
