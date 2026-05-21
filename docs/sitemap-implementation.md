# Sitemap 实现说明

## 当前逻辑

当前站点的 sitemap 由 `src/app/sitemap.ts` 直接生成，返回 `MetadataRoute.Sitemap`。

它使用 ISR 生成：

* `revalidate = 86400`

这意味着 sitemap 会缓存 24 小时。缓存过期后，下一次访问 `/sitemap.xml` 会触发重新生成。

这个策略适合当前发布模型：MDX 内容可以提前进入仓库，但只有到发布时间后才展示。使用 ISR 可以让已到发布时间的内容在不重新部署的情况下进入 sitemap。

## 生成内容

当前 sitemap 包含三类 URL：

1. 首页 `/`
2. `src/mdx/archive` 下的归档页
3. `src/mdx/legal` 下的法律页

所有 URL 都会按项目的 locale 规则展开，再转换成绝对地址。

## 首页

首页是固定写入的公开路由：

* `route: "/"`
* `lastModified`: 最新已发布 archive topic 的 `publishDate`
* `changeFrequency: "weekly"`
* `priority: 1`

这里的 `changeFrequency` 只是给搜索引擎的提示，不代表实际调度。

首页会展示最新已发布的双周专题，所以它的 `lastModified` 使用最新已发布专题的发布时间，而不是 sitemap 生成时的当前时间。

## MDX 路由

`sitemap.ts` 会直接读取两个目录下的 `.mdx` 文件：

* `src/mdx/archive`
* `src/mdx/legal`

映射规则是：

* `index.mdx` -> 目录页，比如 `/archive`、`/legal`
* `foo.mdx` -> 子页，比如 `/archive/foo`、`/legal/foo`

### 日期处理

每个 MDX 文件都会读取 frontmatter 里的 `date` 字段，例如：

```md
---
title: Example
date: 2026-05-21
---
```

这个日期会作为 `lastModified` 写入 sitemap。

日期必须是合法的 `YYYY-MM-DD`，否则会被忽略。

## archive 页面筛选

`archive` 目录不是把所有 MDX 文件都写进 sitemap。

它会再经过一层公开状态过滤，只保留：

* `index.mdx`
* 能在 `src/lib/archive-topics.ts` 中找到且状态已发布的 slug

也就是说，未发布的归档文章不会进 sitemap。

## locale 展开

生成 URL 时会复用站点现有的 locale 拼接规则：

* `getAsNeededLocalizedUrl(...)`

这保证 sitemap 中的链接和页面实际路由保持一致。

## 关键实现点

* `src/app/sitemap.ts` 负责生成所有条目
* `src/lib/mdx-source.ts` 只负责定位 `src/mdx/<sourceKey>`
* `src/lib/archive-topics.ts` 负责判断归档文章是否已发布
* `appConfig.baseUrl` 用来把相对路径转成绝对 URL

## 维护建议

1. 新增公开页时，记得把它加入 `src/app/sitemap.ts`
2. 新增 MDX 页面时，确保 frontmatter 里有合法的 `date`
3. 如果归档页发布规则变化，优先继续沿用 `archive-topics.ts` 的发布判断
