# DKS English Center

Monorepo gồm frontend Next.js và backend NestJS.

## Cấu trúc

```
dks_english_center/
├── frontend/   # Next.js 16 + React 19 + Tailwind CSS 4
├── backend/    # NestJS 11 + TypeScript
└── package.json
```

## Yêu cầu

- Node.js 20+
- npm 10+

## Cài đặt

```bash
npm install
```

## Chạy development

Chạy cả frontend và backend:

```bash
npm run dev
```

Hoặc chạy riêng:

```bash
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:3001/api
```

## API

| Endpoint        | Mô tả              |
|-----------------|--------------------|
| `GET /api`      | Thông tin service  |
| `GET /api/health` | Health check     |

## Biến môi trường

**Backend** (`backend/.env`):

```
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Copy từ file `.env.example` tương ứng nếu chưa có.
