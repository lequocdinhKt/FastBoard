# FASTBOARD

Kanban board cho quản lý dự án, công việc và nhóm. Frontend là React + Vite; backend dùng Supabase (Auth, PostgreSQL, RLS, Realtime, Edge Functions).

## Tính năng

- Đăng nhập email/password, phân quyền `ADMIN` / `MEMBER`
- Dự án, thành viên, Kanban, danh sách công việc, bộ lọc
- Dashboard thống kê
- Thông báo realtime khi giao việc, đổi trạng thái hoặc bình luận
- Gợi ý subtask và độ ưu tiên qua Groq (Supabase Edge Functions)

## Yêu cầu

- Node.js 18+
- Một project [Supabase](https://supabase.com)
- (Tuỳ chọn) Supabase CLI và Groq API key nếu chạy AI

## Cài đặt

```bash
npm install
```

Tạo file `.env` ở thư mục gốc:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

Chỉ hai biến này được inject vào frontend. Không đưa `service_role` hay `GROQ_API_KEY` vào Vite.

### Database

1. Mở Supabase Dashboard → **SQL Editor**
2. Chạy toàn bộ `src/supabase_schema.sql`

Schema tạo bảng, RLS, trigger thông báo và dữ liệu demo.

### Realtime

Trong Supabase, thêm bảng `notifications` vào publication Realtime.

### AI (tuỳ chọn)

```bash
supabase login
supabase link --project-ref your_project_ref
supabase secrets set GROQ_API_KEY=your_groq_api_key
supabase functions deploy generate-subtasks
supabase functions deploy suggest-priority
```

## Chạy

```bash
npm run dev
```

Mở `http://localhost:5173`.

```bash
npm run build
npm run preview
npm run lint
npm run test:run
```

## Tài khoản demo

| Vai trò | Email | Password |
|---|---|---|
| Admin | `admin@fastboard.com` | `admin123` |
| Member | `sarah@fastboard.com` | `user123` |
| Member | `mike@fastboard.com` | `user123` |
| Member | `emily@fastboard.com` | `user123` |
| Member | `lan@fastboard.com` | `user123` |

Chạy lại `src/supabase_schema.sql` sẽ xóa dữ liệu public hiện tại và seed lại bộ demo.

## Cấu trúc

```text
src/
  App.tsx                 Auth gate và layout
  hooks/useAppLogic.ts    Điều phối auth, fetch, CRUD
  hooks/modules/          Đọc/ghi dữ liệu, lọc, UI state
  services/               Supabase client và AI client
  supabase_schema.sql     Schema + RLS + seed
docs/
  LOGIC-GUIDE.md          Bản đồ hàm xử lý
  modules/                Ghi chú theo chức năng
supabase/functions/       Edge Functions AI
```

Luồng chính: `LoginScreen` → `useAppLogic.handleLogin` → `public.users` → `useDataFetching` → views. Ghi dữ liệu đi qua `useEntityOperations` rồi RLS trên Postgres.
