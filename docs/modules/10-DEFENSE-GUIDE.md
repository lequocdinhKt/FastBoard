# Module 10 — Kịch bản demo và câu hỏi bảo vệ

## Bài giới thiệu 30 giây

FASTBOARD là React SPA quản lý project và task theo Agile. Sau khi đăng nhập bằng Supabase Auth, ứng dụng tải dữ liệu từ PostgreSQL dưới sự bảo vệ của RLS. `useAppLogic` làm facade cho state, fetch, filter, CRUD và Realtime. Notification được tạo bằng database triggers. Hai tính năng AI chạy qua Supabase Edge Functions để Groq key không xuất hiện trong browser; AI chỉ gợi ý trên form và user bấm Save mới ghi database.

## Kịch bản demo 7 phút

### 1. Authentication — 45 giây

1. Login bằng member.
2. Refresh để chứng minh session restore.
3. Nói: password thuộc Supabase Auth, không lưu trong `public.users`.

### 2. Project và Task — 90 giây

1. Mở Projects.
2. Tạo/sửa project.
3. Tạo task, chọn project, assignee, status, priority.
4. Thêm subtask/comment.
5. Save.

### 3. Kanban và Filter — 60 giây

1. Kéo task qua trạng thái khác.
2. Dùng FilterBar theo keyword/priority/assignee.
3. Giải thích optimistic update.

### 4. AI co-pilot — 90 giây

1. Mở Task Modal.
2. Nhập title/description.
3. Gợi ý priority.
4. Sinh subtasks.
5. Nhấn mạnh kết quả chỉ ở form state.
6. Save để user xác nhận.

### 5. Dashboard — 60 giây

1. Mở biểu đồ status/trend.
2. Giải thích productivity tuần.
3. Giải thích average completion time.

### 6. Notification và bảo mật — 75 giây

1. Đổi assignment/status hoặc tạo comment.
2. Mở notification panel.
3. Mở nhanh SQL RLS/triggers.
4. Nói rõ RLS là lớp bảo mật chính.

## Mười câu hỏi dễ bị hỏi

### 1. Tại sao dùng Supabase?

Supabase cung cấp Auth, Postgres, RLS, Realtime và Edge Functions trong một nền tảng, phù hợp đồ án cần tập trung nghiệp vụ.

### 2. Có backend không?

Không có Node application server. Supabase là BaaS; AI dùng backend serverless Edge Functions.

### 3. Anon key có bị lộ không?

Anon key được phép ở client. JWT + RLS quyết định quyền; service role và Groq key tuyệt đối không ở client.

### 4. Vì sao AI an toàn?

React chỉ invoke Edge Function. Edge Runtime đọc Groq key từ secret và gọi provider.

### 5. AI có thể làm hỏng dữ liệu không?

Không tự ghi DB. AI chỉ set form state; human-in-the-loop bấm Save.

### 6. Project progress tính ở đâu?

Frontend tính DONE/total từ tasks của project.

### 7. Average time có phải giờ làm việc không?

Không. Đó là duration từ created_at đến completed_at.

### 8. Notification sinh ở đâu?

PostgreSQL triggers, sau đó Realtime đẩy row mới tới client.

### 9. Member có thể xem project khác không?

RLS kiểm tra `is_project_member(project_id)`.

### 10. Khi database update lỗi sau optimistic UI?

Catch lỗi, hiển thị toast và refetch source of truth.

## Những câu không nên trả lời sai

- Không nói app có Express backend.
- Không nói AI key nằm trong `.env` frontend.
- Không gọi FilterBar là fuzzy/global search.
- Không nói Dashboard productivity là số giờ làm.
- Không nói online dot là presence realtime.
- Không nói Calendar/Team Hub/Time Tracking còn hoạt động.
- Không nói Docker/CI/E2E đã có.

## File nên chuẩn bị mở sẵn

1. `src/hooks/useAppLogic.ts`
2. `src/hooks/modules/useEntityOperations.ts`
3. `src/supabase_schema.sql`
4. `src/services/aiService.ts`
5. `supabase/functions/_shared/groq.ts`
6. `src/hooks/useDashboardData.ts`

## Checklist trước buổi bảo vệ

- Build thành công.
- Login demo hoạt động.
- RLS/schema đã deploy.
- Notifications publication đã bật.
- Edge Functions đã deploy.
- `GROQ_API_KEY` đã đặt trong Edge Secrets.
- Không mở `.env` hoặc service role key khi trình chiếu.
- Chuẩn bị trường hợp mất mạng: giải thích kiến trúc bằng tài liệu và source.
