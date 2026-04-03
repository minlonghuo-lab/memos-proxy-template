<div align="center">

# memos-proxy-template

A minimal but practical **Cloudflare Workers** template for exposing a safer, frontend-consumable **Memos API proxy**.

Designed for personal sites, public status feeds, and "shuoshuo / updates / microblog" pages that need to read content from a self-hosted **Memos** instance without leaking backend credentials.

</div>

---

## Features

- **Cloudflare Workers ready** proxy template
- protects `MEMOS_TOKEN` on the server side
- proxies common **Memos API** requests
- directly passes through static file paths such as:
  - `/file/`
  - `/assets/`
  - `/uploads/`
- filters `/api/v1/memos` list responses to keep only **`PUBLIC`** memos
- includes a lightweight `/test` endpoint for environment verification
- suitable as a starting point for blogs, personal dashboards, and public memo feeds

---

## Why This Exists

If your frontend needs to read data from a self-hosted Memos instance, directly calling the upstream API from the browser usually means one of these problems:

- your token may be exposed
- your origin/CORS policy may block requests
- you may want to filter out non-public content before it reaches the client

This template solves that by placing a simple Worker in front of Memos.

---

## Behavior Overview

### Static assets passthrough
The Worker directly proxies these paths to your Memos upstream:

- `/file/`
- `/assets/`
- `/uploads/`

This is useful when memo content references uploaded media or generated assets.

### API proxy
For other request paths, the Worker forwards the request to your Memos instance and adds:

```http
Authorization: Bearer <MEMOS_TOKEN>
```

### Public memo filtering
When the request path starts with `/api/v1/memos` and the upstream response contains a memo list, the Worker filters the result so that only memos with:

```text
visibility === "PUBLIC"
```

are returned to the client.

---

## Environment Variables

| Name | Required | Description |
| --- | --- | --- |
| `MEMOS_BASE_URL` | Yes | Your Memos base URL, e.g. `https://memos.example.com` |
| `MEMOS_TOKEN` | Yes | Memos API token used by the Worker |

---

## Quick Start

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Configure the upstream URL

Edit `wrangler.toml`:

```toml
[vars]
MEMOS_BASE_URL = "https://your-memos.example.com"
```

### 3. Set the secret token

```bash
wrangler secret put MEMOS_TOKEN
```

### 4. Run locally

```bash
wrangler dev
```

### 5. Deploy

```bash
wrangler deploy
```

---

## Example Requests

### Health-like config check

```bash
curl 'https://your-worker.example.com/test'
```

### Get public memos

```bash
curl 'https://your-worker.example.com/api/v1/memos?pageSize=10'
```

### Load uploaded files through the proxy

```bash
curl 'https://your-worker.example.com/file/xxx'
```

---

## Project Structure

```text
.
├── worker.js        # Cloudflare Worker implementation
├── wrangler.toml    # Worker configuration
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
└── LICENSE
```

---

## Common Use Cases

- a public **microblog / shuoshuo** page backed by Memos
- a personal website that shows recent public notes
- a frontend app that should only receive **public** memo data
- a lightweight proxy layer before adding more custom business logic

---

## Notes and Limitations

- The current filtering logic mainly targets memo list responses under `/api/v1/memos`.
- If you need stricter access control, request signing, rate limiting, or route-specific policies, extend the Worker before production use.
- CORS is currently configured broadly for convenience; tighten it for real deployments.

---

## Security Notes

- Never place `MEMOS_TOKEN` in frontend code.
- Store secrets with Cloudflare Workers secrets.
- Use a dedicated token with the minimum permissions your use case requires.
- Review whether your upstream Memos instance exposes any routes you do not want to proxy publicly.

---

## Who This Template Is For

This template is a good fit if you want:

- a fast **starter proxy** for self-hosted Memos
- a public content feed for your website
- a simple Worker that you can fork and customize

If you need a complete production gateway with authentication, observability, and route-level authorization, treat this repository as a foundation rather than a finished platform.

---

## License

Released under the repository license.
