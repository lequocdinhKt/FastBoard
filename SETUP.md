# Hướng dẫn cài đặt và khởi chạy FASTBOARD từ A đến Z

Tài liệu này là quy trình chuẩn để dựng FASTBOARD trên máy mới, cấu hình Supabase, deploy AI Edge Functions và kiểm tra hệ thống.

## 1. Kiến trúc cần chuẩn bị

FASTBOARD gồm hai phần:

1. **React SPA** chạy bằng Vite.
2. **Supabase Cloud** cung cấp Auth, PostgreSQL, RLS, Realtime và Edge Functions.

AI không gọi Groq trực tiếp từ trình duyệt:

```text
React → Supabase Edge Function → Groq API
```

`GROQ_API_KEY` chỉ được lưu trong Supabase Edge Secrets.

## 2. Yêu cầu môi trường

- Node.js 18 trở lên.
- npm.
- Một Supabase project.
- Supabase CLI để deploy Edge Functions.
- Groq API key nếu cần chạy hai chức năng AI.

Kiểm tra:

```bash
node --version
npm --version
supabase --version
```

Nếu chưa có Supabase CLI, cài theo tài liệu chính thức:

```text
https://supabase.com/docs/guides/cli
```

## 3. Cài dependencies

Tại thư mục dự án:

```bash
npm install
```

Các lệnh npm chính:

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test:run
npm run seed:auth
```

## 4. Tạo Supabase project

1. Đăng nhập `https://supabase.com`.
2. Tạo project mới.
3. Mở **Project Settings → API**.
4. Lấy:
   - Project URL.
   - Anon/public key.
   - Service role key, chỉ dùng cho script seed Auth.
5. Lấy project ref từ URL Dashboard hoặc Project Settings.

Không đưa service role key hoặc Groq key vào frontend.

## 5. Cấu hình `.env`

Copy `.env.example` thành `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Ý nghĩa:

| Biến | Nơi sử dụng | Có nằm trong frontend build? |
|---|---|---|
| `SUPABASE_URL` | React app và seed script | Có |
| `SUPABASE_ANON_KEY` | React app | Có; RLS bảo vệ dữ liệu |
| `SUPABASE_SERVICE_ROLE_KEY` | `npm run seed:auth` | Không |
| `GROQ_API_KEY` | Supabase Edge Secrets | Không được đặt trong frontend |

`vite.config.ts` chỉ inject URL và anon key. Nếu `.env` cũ có `GROQ_API_KEY`, hãy xóa dòng đó.

## 6. Tạo database, Auth, RLS và dữ liệu demo

### Cách khuyến nghị

1. Mở Supabase Dashboard.
2. Chọn **SQL Editor → New query**.
3. Copy toàn bộ nội dung `src/supabase_schema.sql`.
4. Bấm **Run**.

Script sẽ:

- Tạo các enum `task_status`, `priority`, `user_role`.
- Tạo bảng `users`, `projects`, `project_members`, `tasks`, `subtasks`, `comments`, `notifications`.
- Tạo helper `is_admin()` và `is_project_member()`.
- Bật RLS và tạo policies.
- Tạo trigger sinh notification khi giao việc, đổi trạng thái hoặc bình luận.
- Tạo năm tài khoản Auth demo và dữ liệu nghiệp vụ mẫu.
- Xóa bảng cũ của tính năng đã loại: `channels`, `messages`, `time_entries`.

### Cảnh báo

Chạy lại toàn bộ schema sẽ xóa dữ liệu public hiện tại và seed lại dữ liệu demo.

### Seed lại Auth bằng Node

Chỉ dùng khi cần đồng bộ lại năm tài khoản/password Auth:

```bash
npm run seed:auth
```

Lệnh này cần `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY`.
Script nhận diện tài khoản theo UUID hoặc email, cập nhật email miền `@fastboard.com` trong Supabase Auth và đồng bộ `public.users` nếu bảng đã tồn tại.

### Tài khoản demo

| Vai trò | Email | Password |
|---|---|---|
| Admin | `admin@fastboard.com` | `admin123` |
| Member | `sarah@fastboard.com` | `user123` |
| Member | `mike@fastboard.com` | `user123` |
| Member | `emily@fastboard.com` | `user123` |
| Member | `lan@fastboard.com` | `user123` |

UUID cố định nằm trong `src/constants/demoUsers.ts` và `scripts/seed-auth-users.mjs`.

## 7. Bật Realtime cho notifications

1. Mở Supabase Dashboard.
2. Vào **Database → Publications / Realtime**.
3. Thêm bảng `notifications` vào publication.

Nếu bỏ qua bước này:

- Notification vẫn được lưu bởi PostgreSQL trigger.
- Danh sách vẫn tải khi fetch lại.
- UI không nhận bản ghi mới theo thời gian thực.

## 8. Deploy AI Edge Functions

### 8.1. Login và link project

```bash
supabase login
supabase link --project-ref your_project_ref
```

### 8.2. Lưu Groq key an toàn

```bash
supabase secrets set GROQ_API_KEY=your_groq_api_key
```

Secret này chỉ tồn tại trên Edge Runtime.

### 8.3. Deploy functions

```bash
supabase functions deploy generate-subtasks
supabase functions deploy suggest-priority
```

Các file liên quan:

```text
supabase/functions/_shared/groq.ts
supabase/functions/generate-subtasks/index.ts
supabase/functions/suggest-priority/index.ts
```

Supabase mặc định xác thực JWT của người gọi. Frontend gọi functions qua session hiện tại bằng `supabase.functions.invoke`.

## 9. Chạy ứng dụng

```bash
npm run dev
```

Mở URL Vite in ra terminal, thường là:

```text
http://localhost:5173
```

Đăng nhập bằng một tài khoản demo ở mục 6.

## 10. Kiểm tra chức năng chính

### Auth và dữ liệu

1. Login.
2. Refresh trình duyệt để kiểm tra restore session.
3. Mở Projects, Kanban, List, Team và Dashboard.

### CRUD

1. Tạo project.
2. Tạo task, chọn assignee và due date.
3. Thêm subtask/comment.
4. Bấm Save.
5. Kéo task qua các cột Kanban.

### AI co-pilot

1. Mở Task Modal.
2. Nhập title và description.
3. Bấm **Gợi ý mức ưu tiên**.
4. Bấm **Sinh việc con**.
5. Kiểm tra kết quả chỉ xuất hiện trong form.
6. Đóng modal mà không Save để chứng minh AI không tự ghi DB.
7. Thực hiện lại và bấm Save để persist.

### Notifications

1. Gán task cho user khác hoặc đổi status.
2. Đăng nhập user nhận.
3. Kiểm tra bell notification.

## 11. Build và kiểm thử

```bash
npm run test:run
npm run build
npm run preview
```

`dist/` là build artifact cục bộ, không chứng minh ứng dụng đã deploy production.

## 12. Troubleshooting

### `Missing Supabase environment variables`

- Kiểm tra `.env`.
- Restart `npm run dev` sau khi sửa env.

### Login thất bại

- Chạy lại `src/supabase_schema.sql`, hoặc:

```bash
npm run seed:auth
```

### Lỗi `42501 permission denied for schema public`

Chạy `src/fix_grants.sql` trong SQL Editor.

### Không thấy project/task

- Kiểm tra user có trong `project_members`.
- Admin nhìn thấy mọi project; member chỉ thấy project được tham gia.

### Notification không realtime

- Kiểm tra bảng `notifications` đã được thêm vào Realtime publication.
- Kiểm tra user chỉ đọc notification thuộc chính mình theo RLS.

### AI trả lỗi

- Kiểm tra đã deploy đủ hai functions.
- Kiểm tra Edge Secret:

```bash
supabase secrets list
```

- Xem function logs trên Supabase Dashboard.
- Kiểm tra user đã login vì functions yêu cầu Authorization header.

### Cursor báo `Cannot find name 'Deno'`

Dự án có `supabase/functions/deno.d.ts` và reference types trong các function. Nếu IDE còn cache lỗi:

1. Save tất cả file.
2. Chạy **TypeScript: Restart TS Server** trong Command Palette.
3. Reload Cursor window.

## 13. Những thứ chưa có trong repo

- Dockerfile.
- CI/CD workflow.
- Supabase Storage.
- Self-service sign-up/password reset.
- Invite-member Edge Function.
- E2E tests.

Không mô tả các mục này là chức năng đã hoàn thành khi bảo vệ.
