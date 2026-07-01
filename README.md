# DKS English Center

Monorepo gồm frontend Next.js và backend NestJS.

## Cấu trúc

```
dks_english_center/
├── frontend/   # Next.js 16 + React 19 + Tailwind CSS 4
├── backend/    # NestJS 11 + Prisma + Supabase PostgreSQL
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
| `GET /api/health` | Health check |

## Database (Supabase + Prisma)

### Bước 1 — Tạo Supabase project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **Create organization**
2. **New project** → đặt tên, chọn region (Singapore)
3. Lưu **Database password**

### Bước 2 — Lấy connection string

**Project Settings → Database → Connection string**:

| Biến | Port | Dùng cho |
|------|------|----------|
| `DATABASE_URL` | 6543 (pooler) | App runtime |
| `DIRECT_URL` | 5432 (direct) | `prisma migrate` |

Paste vào `backend/.env`:

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### Bước 3 — Generate client

```bash
npm run db:generate -w backend
```

Khi có schema, chạy migrate:

```bash
npm run db:migrate -w backend
```

## Storage (Cloudflare R2)

R2 lưu **ảnh, audio, file video (.mp4)** dạng file tĩnh. Không phải dịch vụ video streaming (transcode/HLS/player) — cái đó là **Cloudflare Stream** (setup sau nếu cần).

### Tạo R2 bucket

1. Cloudflare Dashboard → **Storage & Databases → R2**
2. **Create bucket** → đặt tên (vd: `dks-media`)
3. **Manage R2 API Tokens → Create API token** → quyền Object Read & Write cho bucket đó
4. Copy `Account ID`, `Access Key ID`, `Secret Access Key` vào `backend/.env`

```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=dks-media
R2_PUBLIC_URL=https://pub-xxx.r2.dev   # Settings > Public access > r2.dev subdomain
```

## Biến môi trường

**Backend** (`backend/.env`):

```
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL=...
DIRECT_URL=...
```

**Frontend** (`frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Copy từ file `.env.example` tương ứng nếu chưa có.
