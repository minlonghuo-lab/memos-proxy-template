<div align="center">

# memos-proxy-template

一个面向 **Cloudflare Workers** 的 **Memos API 代理模板**。

适合为自托管 Memos 提供一个更安全、对前端更友好的公开代理层，
用于博客“说说 / 动态 / 微博客”页面等场景，
同时避免把后端 Token 直接暴露到浏览器端。

</div>

---

## 项目简介

如果你的前端页面需要读取自托管 Memos 的内容，直接从浏览器请求上游接口通常会遇到几个问题：

- Token 可能泄露到前端
- CORS 限制导致请求失败
- 你只想公开 `PUBLIC` 内容，而不是全部内容

这个模板的作用，就是在 **Memos 与前端之间增加一层轻量代理**：

- 由 Worker 代为携带 `MEMOS_TOKEN`
- 对外提供统一接口
- 自动过滤掉不应公开的内容

一句话来说：

> 这是一个把 **自托管 Memos → 前端安全公开接口** 的最小可用模板。

---

## 功能特性

- 基于 **Cloudflare Workers**，部署简单
- 服务端保护 `MEMOS_TOKEN`
- 支持代理常见的 **Memos API 请求**
- 直接透传以下静态资源路径：
  - `/file/`
  - `/assets/`
  - `/uploads/`
- 对 `/api/v1/memos` 列表结果做过滤，仅保留 **`PUBLIC`** 可见性内容
- 提供 `/test` 端点用于检查环境变量是否配置成功
- 适合作为博客动态流、公开说说页、状态页的数据来源

---

## 工作方式说明

### 1. 静态资源透传
以下路径会直接代理到你的 Memos 上游地址：

- `/file/`
- `/assets/`
- `/uploads/`

这对于加载 memo 中引用的图片、附件和静态资源很有用。

### 2. API 请求代理
对于其他请求路径，Worker 会把请求转发到上游 Memos，并自动附带：

```http
Authorization: Bearer <MEMOS_TOKEN>
```

### 3. PUBLIC 内容过滤
当请求路径以 `/api/v1/memos` 开头，并且返回结果中包含 `memos` 列表时，Worker 会自动过滤，只保留：

```text
visibility === "PUBLIC"
```

这样前端拿到的数据默认就是适合公开展示的内容。

---

## 环境变量

| 变量名 | 必填 | 说明 |
| --- | --- | --- |
| `MEMOS_BASE_URL` | 是 | Memos 源站地址，例如 `https://memos.example.com` |
| `MEMOS_TOKEN` | 是 | Worker 代理请求时使用的 Memos API Token |

---

## 快速开始

### 1. 安装 Wrangler

```bash
npm install -g wrangler
```

### 2. 配置上游地址

编辑 `wrangler.toml`：

```toml
[vars]
MEMOS_BASE_URL = "https://your-memos.example.com"
```

### 3. 设置密钥

```bash
wrangler secret put MEMOS_TOKEN
```

### 4. 本地开发

```bash
wrangler dev
```

### 5. 部署到 Cloudflare Workers

```bash
wrangler deploy
```

---

## 示例请求

### 检查配置是否生效

```bash
curl 'https://your-worker.example.com/test'
```

### 获取公开 memos 列表

```bash
curl 'https://your-worker.example.com/api/v1/memos?pageSize=10'
```

### 通过代理访问上传文件

```bash
curl 'https://your-worker.example.com/file/xxx'
```

---

## 项目结构

```text
.
├── worker.js        # Cloudflare Worker 实现
├── wrangler.toml    # Worker 配置文件
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
└── LICENSE
```

---

## 典型使用场景

- 博客中的 **说说 / 动态 / 微博客** 页面
- 个人主页中展示最近公开 memo
- 前端应用只想读取 **PUBLIC** 可见内容
- 在更复杂网关出现之前，先用一个简单代理层完成公开访问

---

## 注意事项与限制

- 当前过滤逻辑主要针对 `/api/v1/memos` 列表接口。
- 如果你需要更严格的鉴权、签名、限流、路由级权限控制，建议在此模板基础上继续扩展。
- 当前 CORS 配置偏宽松，正式上线时建议收紧允许来源。

---

## 安全说明

- 不要把 `MEMOS_TOKEN` 放进前端代码。
- 敏感信息请通过 Cloudflare Workers Secrets 管理。
- 建议使用权限尽可能小的专用 Token。
- 在公开服务前，先确认你的上游 Memos 实例中没有不应该被代理出去的路径。

---

## 适合哪些人使用

这个模板适合你，如果你希望：

- 快速搭一个 **Memos 公开代理**
- 为网站提供一个可公开访问的 memo 数据源
- 以最小成本 fork 一个可以继续二次开发的 Worker 模板

如果你需要完整的生产级 API 网关、鉴权体系、监控与审计，那么更适合把这个仓库当作基础骨架，而不是最终成品。

---

## License

本项目遵循仓库中的开源许可证。