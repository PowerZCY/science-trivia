# Upstash 快速使用指南

这份文档面向外部项目使用，目标是通过已发布的 npm 包快速接入 Upstash Redis 与 QStash 能力。底层设计细节见同目录的 `Upstash.md`。

## 1. 安装依赖

```bash
pnpm install @windrun-huaiin/backend-core
```

Upstash 官方依赖由 `@windrun-huaiin/backend-core` 包维护，通常不需要在业务项目里单独安装 `@upstash/redis`、`@upstash/qstash` 或 `@upstash/lock`。

在业务代码中从服务端入口导入：

```ts
import { getJson, setJson, withRedis } from '@windrun-huaiin/backend-core/upstash/server';
```

## 2. 配置环境变量

Redis 最小配置：

```env
NEXT_PUBLIC_APP_NAME=ddaas
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-rest-token
```

QStash 最小配置：

```env
QSTASH_TOKEN=your-qstash-token
QSTASH_CURRENT_SIGNING_KEY=your-current-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key
```

开发环境如需临时跳过 QStash 签名校验：

```env
NODE_ENV=development
SKIP_UPSTASH_QSTASH_VERIFY=1
```

可选健康检查配置：

```env
UPSTASH_REDIS_HEALTHCHECK_INTERVAL_MINUTES=10
UPSTASH_QSTASH_HEALTHCHECK_INTERVAL_MINUTES=10
UPSTASH_QSTASH_HEALTHCHECK_URL=https://qstash.upstash.io/v2/messages
```

注意：

- `NEXT_PUBLIC_APP_NAME` 用于 Redis key 与 QStash 队列名前缀，不能为空。
- Redis key 会自动变成 `{app}_{env}:{key}`，例如 `ddaas_test:user:1`。
- QStash FIFO 队列名会自动变成 `{app}_{env}_queue_{queueName}`。
- `NODE_ENV=production` 时环境后缀为 `live`，其他环境为 `test`。
- Redis 和 QStash 都是服务端能力，只能在 Server Action、Route Handler、Server Component 或后端模块中使用，不要在浏览器端代码中直接导入。

## 3. Redis 基础读写

JSON 缓存：

```ts
'use server';

import { getJson, setJson } from '@windrun-huaiin/backend-core/upstash/server';

type UserProfile = {
  id: string;
  name: string;
};

export async function cacheUserProfile(profile: UserProfile) {
  await setJson(`user:profile:${profile.id}`, profile, 60 * 10);
}

export async function getCachedUserProfile(userId: string) {
  return getJson<UserProfile>(`user:profile:${userId}`);
}
```

字符串缓存：

```ts
import { getString, setString } from '@windrun-huaiin/backend-core/upstash/server';

await setString('site:notice', 'maintenance tonight', 300);
const notice = await getString('site:notice');
```

Hash：

```ts
import { getHashAll, setHashField, setHashJson } from '@windrun-huaiin/backend-core/upstash/server';

await setHashField('user:settings:1', 'theme', 'dark');
await setHashJson('user:settings:1', 'layout', { sidebar: true });

const settings = await getHashAll('user:settings:1');
```

List：

```ts
import { popList, pushList, rangeList } from '@windrun-huaiin/backend-core/upstash/server';

await pushList('jobs:pending', ['job-1', 'job-2']);
const jobs = await rangeList('jobs:pending', 0, 9);
const nextJob = await popList('jobs:pending', 'left');
```

Set：

```ts
import { sadd, scard, sismember } from '@windrun-huaiin/backend-core/upstash/server';

await sadd('post:readers:post-1', ['user-1']);
const hasRead = await sismember('post:readers:post-1', 'user-1');
const readerCount = await scard('post:readers:post-1');
```

## 4. Redis 业务工具

点赞：

```ts
import { getTargetLikeCount, isTargetLiked, likeTarget, unlikeTarget } from '@windrun-huaiin/backend-core/upstash/server';

await likeTarget('post-1', 'user-1');
const liked = await isTargetLiked('post-1', 'user-1');
const count = await getTargetLikeCount('post-1');
await unlikeTarget('post-1', 'user-1');
```

收藏：

```ts
import { addFavorite, getFavoriteCount, getUserFavorites, removeFavorite } from '@windrun-huaiin/backend-core/upstash/server';

await addFavorite('post-1', 'user-1');
const count = await getFavoriteCount('post-1');
const targets = await getUserFavorites('user-1');
await removeFavorite('post-1', 'user-1');
```

计数器：

```ts
import { getCounter, getUniqueCounter, incrCounter, incrUniqueCounter } from '@windrun-huaiin/backend-core/upstash/server';

await incrCounter('post:views:post-1');
const views = await getCounter('post:views:post-1');

await incrUniqueCounter('post:uv:post-1', 'visitor-1');
const uv = await getUniqueCounter('post:uv:post-1');
```

分布式锁：

```ts
import { withLock } from '@windrun-huaiin/backend-core/upstash/server';

export async function runOnce(orderId: string) {
  const result = await withLock(`order:pay:${orderId}`, 30_000, async () => {
    // 执行需要互斥的业务逻辑
    return { ok: true };
  });

  if (!result) {
    return { ok: false, reason: 'locked_or_redis_unavailable' };
  }

  return result;
}
```

## 5. 直接使用 Redis 客户端

大多数场景优先使用上面的封装函数。确实需要调用 Upstash Redis 原生命令时，使用 `withRedis`：

```ts
import { withRedis } from '@windrun-huaiin/backend-core/upstash/server';

export async function readRawValue(key: string) {
  return withRedis(async (redis) => {
    return redis.get(key);
  });
}
```

`withRedis` 在 Redis 未配置或不可用时返回 `null`，业务代码需要显式处理降级。

## 6. QStash 发布消息

发布单播消息：

```ts
import { publishMessage } from '@windrun-huaiin/backend-core/upstash/server';

await publishMessage({
  url: 'https://example.com/api/jobs/revalidate-cache',
  body: {
    target: 'post-1',
  },
});
```

延时消息：

```ts
import { publishDelayedMessage } from '@windrun-huaiin/backend-core/upstash/server';

await publishDelayedMessage({
  url: 'https://example.com/api/jobs/send-email',
  delaySec: 60,
  body: {
    userId: 'user-1',
  },
});
```

FIFO 队列消息：

```ts
import { publishFIFOQueueMessage } from '@windrun-huaiin/backend-core/upstash/server';

await publishFIFOQueueMessage({
  queueName: 'order-events',
  url: 'https://example.com/api/jobs/order-events',
  body: {
    orderId: 'order-1',
  },
});
```

广播到 URL Group：

```ts
import { publishBroadcastMessage } from '@windrun-huaiin/backend-core/upstash/server';

await publishBroadcastMessage({
  urlGroup: 'cache-workers',
  body: {
    action: 'refresh',
  },
});
```

定时任务：

```ts
import { cancelSchedule, scheduleMessage } from '@windrun-huaiin/backend-core/upstash/server';

const result = await scheduleMessage({
  url: 'https://example.com/api/jobs/daily-report',
  cron: '0 0 * * *',
  body: {
    type: 'daily-report',
  },
});

if (result?.scheduleId) {
  await cancelSchedule(result.scheduleId);
}
```

## 7. QStash 消费与签名校验

Next.js Route Handler 示例：

```ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyQstashSignature } from '@windrun-huaiin/backend-core/upstash/server';

type Payload = {
  target: string;
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('upstash-signature') ?? '';

  await verifyQstashSignature({
    signature,
    body,
    url: request.url,
  });

  const message = JSON.parse(body) as {
    source_msg_id: string;
    payload: Payload;
  };

  // 使用 message.payload 执行业务逻辑

  return NextResponse.json({ ok: true });
}
```

所有通过项目封装发布的 QStash 消息都会包一层 envelope：

```ts
{
  source_msg_id: 'generated-message-id',
  payload: {
    // 你的业务 body
  }
}
```

消费端应从 `payload` 读取业务数据。

## 8. 返回值约定

Redis 与 QStash 配置缺失或暂时不可用时，封装层不会阻塞应用启动：

- 查询类函数通常返回 `null`。
- 写入类函数常见返回 `false` 或 `null`。
- `withRedis` / `withQstash` 返回 `null`。
- `verifyQstashSignature` 在非开发环境校验失败会抛错。

业务侧建议按能力可用性做降级：

```ts
const cached = await getJson<{ value: string }>('demo:key');

if (!cached) {
  // fallback: 读数据库或直接重新计算
}
```

## 9. 常见排查

1. Redis 始终返回 `null`
   - 检查 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 是否存在。
   - 检查 `UPSTASH_REDIS_REST_URL` 是否是 `http` 或 `https` URL。
   - 检查 `NEXT_PUBLIC_APP_NAME` 是否存在且非空。

2. 本地消费 QStash 校验失败
   - 开发环境可设置 `SKIP_UPSTASH_QSTASH_VERIFY=1`。
   - 生产环境必须配置 `QSTASH_CURRENT_SIGNING_KEY` 与 `QSTASH_NEXT_SIGNING_KEY`。
   - 确认传给 `verifyQstashSignature` 的 `body` 是原始文本，不是解析后的 JSON。

3. Dashboard 里找不到预期 key
   - 项目会自动加前缀，实际 Redis key 形如 `ddaas_test:your:key`。

4. FIFO 队列名不符合预期
   - 业务传入 `order-events` 后，实际队列名形如 `ddaas_test_queue_order-events`。

5. 热路径 Redis 慢
   - 优先减少串行 Redis 调用次数。
   - Redis region 尽量和应用部署 region 对齐。
   - 多 key 读取优先用 `mget` / `mgetJson` 或 `pipeline`。
