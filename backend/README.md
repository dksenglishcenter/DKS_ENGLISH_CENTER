# Backend (NestJS)

API NestJS + Prisma cho DKS English Center.

Hướng dẫn setup đầy đủ: xem [README gốc](../README.md).

```bash
# từ root monorepo
npm run dev:backend
npm run db:migrate -w backend
npm run db:seed -w backend
```

Env: copy `backend/.env.example` → `backend/.env`.
