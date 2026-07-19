# Frontend (Next.js)

Website + admin CMS cho DKS English Center.

Hướng dẫn setup đầy đủ: xem [README gốc](../README.md).

```bash
# từ root monorepo
npm run dev:frontend
```

Env: copy `frontend/.env.example` → `frontend/.env.local`.

API browser đi qua same-origin `/api` (rewrite → Nest qua `BACKEND_URL`).
