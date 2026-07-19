# DKS English Center

Monorepo website + CMS cho trung tâm Anh ngữ DKS.

| App | Stack |
|-----|--------|
| `frontend/` | Next.js 16, React 19, Tailwind CSS 4 |
| `backend/` | NestJS 11, Prisma, Supabase PostgreSQL |

## Yêu cầu

- Node.js 20+
- npm 10+

## Cài đặt

```bash
npm install
```

Copy env:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Điền Supabase, Cloudinary, JWT, SMTP (xem bên dưới).

## Chạy development

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |

Chạy riêng: `npm run dev:frontend` / `npm run dev:backend`.

Browser gọi API qua **same-origin** `/api` (Next rewrite → Nest). Biến chính FE là `BACKEND_URL`, không cần `NEXT_PUBLIC_API_URL` khi local.

## Database (Supabase + Prisma)

1. Tạo project tại [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Project Settings → Database → Connection string**

| Biến | Port | Dùng cho |
|------|------|----------|
| `DATABASE_URL` | 6543 (pooler) | App runtime |
| `DIRECT_URL` | 5432 | `prisma migrate` |

3. Paste vào `backend/.env`, rồi:

```bash
npm run db:generate -w backend
npm run db:migrate -w backend
npm run db:seed -w backend
```

## Storage (Cloudinary)

Ảnh upload qua admin → Nest → Cloudinary (không dùng Cloudflare R2).

1. [Cloudinary Console](https://console.cloudinary.com) → **Product environment credentials**
2. Lấy `CLOUDINARY_URL` dạng:

```env
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

3. Frontend (Next/Image):

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Folder gốc: `dks-english-center/...` (courses, blog, gallery, about, …).

## Email (Gmail SMTP + Nodemailer)

Local: App Password Gmail qua `SMTP_*`.

```env
MAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.gmail@gmail.com
SMTP_PASS=your-16-char-app-password
MAIL_FROM="DKS English Center <your.gmail@gmail.com>"
NOTIFY_EMAIL=admin-inbox@gmail.com
```

- `SMTP_USER` / `MAIL_FROM` = tài khoản **gửi**
- `NOTIFY_EMAIL` = hộp thư **nhận** khi có form liên hệ / tuyển dụng

**Lưu ý:** Render Free chặn outbound SMTP (587/465). Cần plan paid hoặc host khác cho phép SMTP.

## Biến môi trường

**Backend** (`backend/.env`) — xem đầy đủ `backend/.env.example`:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL=...
DIRECT_URL=...
CLOUDINARY_URL=...
JWT_SECRET=...
# + SMTP / NOTIFY_EMAIL / ZALO_*
```

Production (Vercel FE + Render BE): set `FRONTEND_URL` = URL Vercel, `COOKIE_SAME_SITE=none`.

**Frontend** (`frontend/.env.local`) — xem `frontend/.env.example`:

```env
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ZALO_CONTACT_URL=https://zalo.me/0834513456
# Optional:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
# NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

## Deploy (tóm tắt)

| Phần | Nơi |
|------|-----|
| Frontend | Vercel |
| Backend | Render |
| DB | Supabase |
| Media | Cloudinary |
