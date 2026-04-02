# Memos Proxy Template

一个部署在 **Cloudflare Workers** 的 Memos API 代理模板。

这个模板用于：
- 将自托管 Memos 暴露给前端项目
- 通过环境变量保护 `MEMOS_TOKEN`
- 为前端提供基础 CORS 与公共内容过滤能力

## 特性

- 代理 Memos API 请求
- 透传静态资源路径（`/file/`、`/assets/`、`/uploads/`）
- 对 `/api/v1/memos` 列表结果过滤，只保留 `PUBLIC` 可见性内容
- 提供 `/test` 配置检查端点
- 适合博客“说说 / 动态”页面接入

## 环境变量

| 变量名 | 说明 |
|---|---|
| `MEMOS_BASE_URL` | Memos 源站地址，例如 `https://your-memos.example.com` |
| `MEMOS_TOKEN` | Memos API Token |

## 部署

### 本地开发
```bash
wrangler dev
```

### Cloudflare Workers
```bash
wrangler login
wrangler secret put MEMOS_TOKEN
wrangler deploy
```

## 示例请求
```bash
curl 'https://your-worker.workers.dev/api/v1/memos?pageSize=10'
```

## 说明

这个仓库是模板版，不包含任何真实 token 或私有实例地址。
