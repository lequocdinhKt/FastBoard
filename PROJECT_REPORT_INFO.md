# FASTBOARD — Tổng quan kỹ thuật và thông tin bảo vệ đồ án

Đây là tài liệu kỹ thuật trung tâm của dự án. Nội dung bám theo source code hiện tại; không mô tả các tính năng đã xóa hoặc chưa triển khai như thể chúng đang hoạt động.

## 1. Tổng quan

- **Tên dự án:** FASTBOARD.
- **Loại ứng dụng:** Web SPA quản lý dự án và công việc theo quy trình Agile.
- **Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS 4.
- **BaaS:** Supabase Auth, PostgreSQL, RLS, Realtime và Edge Functions.
- **AI provider:** Groq, model `openai/gpt-oss-20b`.
- **Ngôn ngữ UI:** English và Tiếng Việt.

Mục tiêu chính là quản lý project, task, subtask, comment, thành viên, Kanban, danh sách lọc, dashboard và notifications. AI đóng vai trò co-pilot: đưa gợi ý vào form, không tự ra quyết định và không tự ghi database.

## 2. Phạm vi chức năng

### Đã triển khai

- Supabase Auth email/password, restore session và logout.
- Phân quyền `ADMIN`/`MEMBER` bằng RLS và project membership.
- CRUD project và đồng bộ thành viên project.
- CRUD task, subtask, comment.
- Kanban kéo thả và Task List.
- Filter task theo từ khóa, priority và assignee.
- Dashboard, biểu đồ trạng thái, trend và thời gian xử lý trung bình.
- Quản lý team, member detail và profile.
- Notification từ PostgreSQL triggers; client nhận qua Supabase Realtime.
- Dark/light mode và i18n EN/VI.
- AI Generate Subtasks và Suggest Priority qua Supabase Edge Functions.

### Đã loại khỏi phạm vi

- Calendar view.
- Team Hub, chat và voice.
- Stopwatch/time tracking và bảng `time_entries`.
- Global Header Search.

### Chưa triển khai

- Self-service sign-up/password reset.
- Invite-member Edge Function.
- Supabase Storage.
- Docker/CI/CD.
- E2E tests.
- Màn hình “View all activity”.

## 3. Kiến trúc tổng thể

### Luồng CRUD

```text
React Component
  → AppContext / useAppLogic
  → useEntityOperations
  → supabaseClient
  → Supabase PostgREST
  → PostgreSQL + RLS
```

Sau thao tác ghi phức hợp, `useDataFetching` refetch dữ liệu và map `snake_case` từ database sang model `camelCase` của frontend.

### Luồng AI

```text
TaskModal
  → useTaskForm
  → aiService
  → supabase.functions.invoke + user JWT
  → Supabase Edge Function
  → Groq API
  → validate output
  → React form state
```

AI không gọi `useEntityOperations`, không upsert task và không ghi subtask trực tiếp. Chỉ khi người dùng bấm **Save**, dữ liệu form mới được persist.

### Luồng notification

```text
Task/comment thay đổi
  → PostgreSQL trigger
  → insert notifications
  → Supabase Realtime
  → useAppLogic subscription
  → NotificationsPanel
```

## 4. Cấu trúc source quan trọng

```text
src/
├── components/                 UI, views, modal
├── context/AppContext.tsx      Cổng truy cập state/actions
├── hooks/useAppLogic.ts        Facade logic toàn ứng dụng
├── hooks/useTaskForm.ts        State form task + AI co-pilot
├── hooks/useDashboardData.ts   Dashboard aggregation
├── hooks/modules/
│   ├── useUIState.ts
│   ├── useDataFetching.ts
│   ├── useSearchSystem.ts
│   └── useEntityOperations.ts
├── services/
│   ├── supabaseClient.ts
│   └── aiService.ts
├── types/
├── translations.ts
└── supabase_schema.sql

supabase/functions/
├── deno.d.ts
├── _shared/groq.ts
├── generate-subtasks/index.ts
└── suggest-priority/index.ts
```

## 5. Database

| Bảng | Mục đích | Quan hệ chính |
|---|---|---|
| `users` | Profile nghiệp vụ | `id` tham chiếu `auth.users.id` |
| `projects` | Dự án | `created_by → users` |
| `project_members` | Quan hệ N-N project/user | PK `(project_id, user_id)` |
| `tasks` | Công việc | `project_id`, `assignee_id` |
| `subtasks` | Checklist của task | `task_id → tasks` |
| `comments` | Bình luận task | `task_id`, `user_id` |
| `notifications` | Thông báo theo user | `user_id`, `task_id` |

Enums:

- `task_status`: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`.
- `priority`: `LOW`, `MEDIUM`, `HIGH`.
- `user_role`: `ADMIN`, `MEMBER`.

`tasks.completed_at` được ghi khi task chuyển sang `DONE` và xóa khi task rời `DONE`.

## 6. Authentication và Authorization

### Authentication

1. `LoginScreen` nhận email/password.
2. `useAppLogic` gọi `supabase.auth.signInWithPassword`.
3. Session được Supabase client persist và restore.
4. Profile được đọc từ `public.users`.

### Authorization

Lớp bảo mật chính là RLS:

- `is_admin()` xác định admin.
- `is_project_member(project_id)` xác định quyền trong project.
- User chỉ đọc/cập nhật notification của chính mình.
- Member không thể tự nâng role.
- Comments chỉ được tạo với `user_id = auth.uid()`.

`src/utils/roles.ts` chỉ bổ sung UX guard phía client; không thay thế RLS.

## 7. Các thuật toán/xử lý do dự án triển khai

### Filter đa điều kiện

`useSearchSystem` lọc task bằng:

1. Substring không phân biệt hoa thường trên title, description hoặc tags.
2. So khớp chính xác priority nếu khác `ALL`.
3. So khớp assignee nếu khác `ALL`.

Đây là filter in-memory, không phải fuzzy search và không gọi database mỗi lần gõ.

### Tiến độ project

```text
progress = số task DONE / tổng task của project × 100
```

Nếu project không có task thì progress bằng 0.

### Thời gian xử lý trung bình

Với các task `DONE` có đủ `createdAt` và `completedAt`:

```text
averageDays = mean(completedAt - createdAt)
```

Đây không phải thời gian stopwatch và không phải thời gian task nằm riêng trong trạng thái `IN_PROGRESS`.

### Optimistic status update

UI cập nhật status ngay, sau đó ghi xuống Supabase. Nếu database lỗi, hệ thống refetch để khôi phục state đúng.

## 8. AI co-pilot

### Generate Subtasks

- **Input:** title, description.
- **Xử lý:** Edge Function yêu cầu Groq trả raw JSON array 3–5 chuỗi.
- **Output:** danh sách title subtask.
- **Frontend:** append vào `subtasks` form state.

### Suggest Priority

- **Input:** title, description.
- **Xử lý:** Groq trả `LOW`, `MEDIUM` hoặc `HIGH`; Edge Function validate output.
- **Fallback parse:** `MEDIUM`.
- **Frontend:** cập nhật `priority` form state.

### Bảo mật AI

- Không có `groq-sdk` trong frontend.
- Không có `dangerouslyAllowBrowser`.
- `vite.config.ts` không inject `GROQ_API_KEY`.
- Secret được cấu hình bằng `supabase secrets set`.
- Edge Functions yêu cầu Authorization header và được Supabase gateway verify JWT mặc định.

### Trạng thái

Mã nguồn đã hoàn thành. Để chạy thực tế phải deploy hai functions và cấu hình `GROQ_API_KEY` trên Supabase.

## 9. Dashboard

- Status donut: đếm task theo bốn trạng thái.
- Trend: đếm task tạo mới và đến hạn theo 7/30 ngày.
- Productivity: tỷ lệ task đến hạn trong tuần hiện tại đã `DONE`.
- Average completion time: trung bình `completedAt - createdAt`.
- Recent activity: lấy các task đầu trong mảng đã tải.

Lưu ý: Dashboard hiện nhận `state.tasks`, tức danh sách có thể đã chịu FilterBar.

## 10. Trạng thái và giới hạn kỹ thuật

- Frontend dùng anon key; RLS là lớp bảo vệ bắt buộc.
- Realtime notification cần bật publication thủ công.
- AI phụ thuộc deploy Edge Functions và quota Groq.
- Avatar có thể lưu Data URL trong cột text; chưa dùng Storage.
- Thêm member mới yêu cầu Auth user tồn tại trước.
- Xóa profile `public.users` không đồng nghĩa xóa `auth.users`.
- Một số chuỗi UI/toast chưa đi qua i18n.
- Chưa đủ thông tin để kết luận hiệu năng, SLA hoặc số user đồng thời.

## 11. Câu trả lời ngắn khi bảo vệ

### “Dự án có backend không?”

Không có application server Express/Nest. CRUD dùng Supabase BaaS. Riêng AI có backend serverless là Supabase Edge Functions để bảo vệ API key.

### “Tại sao anon key ở frontend không phải secret?”

Anon key nhận diện Supabase project, còn quyền dữ liệu do JWT và RLS quyết định. Service role key mới là secret và không được đưa vào frontend.

### “AI có tự ghi database không?”

Không. AI chỉ cập nhật state của form. Người dùng xem, sửa và bấm Save; lúc đó luồng CRUD thông thường mới ghi database.

### “API key Groq nằm ở đâu?”

Trong Supabase Edge Secrets. React chỉ gọi Edge Function bằng JWT của phiên đăng nhập.

### “Phân quyền thực hiện ở đâu?”

RLS PostgreSQL là lớp chính; client role checks chỉ để ẩn/hiện thao tác và cải thiện UX.

### “Notification được tạo ở đâu?”

PostgreSQL triggers tạo bản ghi. Supabase Realtime đẩy thay đổi đến client.

### “Tiến độ và thời gian trung bình tính thế nào?”

Tiến độ là tỷ lệ task DONE. Thời gian trung bình là trung bình số ngày từ `created_at` đến `completed_at` của task DONE.

## 12. Tài liệu chi tiết theo module

- [Kiến trúc và luồng dữ liệu](docs/modules/00-ARCHITECTURE.md)
- [Authentication và Authorization](docs/modules/01-AUTHORIZATION.md)
- [Project Management](docs/modules/02-PROJECTS.md)
- [Task, Subtask và Comment](docs/modules/03-TASKS.md)
- [Kanban, List và Filter](docs/modules/04-KANBAN-LIST-FILTER.md)
- [Dashboard và thuật toán thống kê](docs/modules/05-DASHBOARD.md)
- [Team và Profile](docs/modules/06-TEAM-PROFILE.md)
- [Notifications và Realtime](docs/modules/07-NOTIFICATIONS.md)
- [AI Edge Functions](docs/modules/08-AI-EDGE-FUNCTIONS.md)
- [Theme và đa ngôn ngữ](docs/modules/09-THEME-I18N.md)
- [Kịch bản demo và câu hỏi bảo vệ](docs/modules/10-DEFENSE-GUIDE.md)

## 13. File cần đọc trước khi bảo vệ

1. `src/hooks/useAppLogic.ts`.
2. `src/hooks/modules/useDataFetching.ts`.
3. `src/hooks/modules/useEntityOperations.ts`.
4. `src/hooks/useTaskForm.ts`.
5. `src/services/supabaseClient.ts`.
6. `src/services/aiService.ts`.
7. `src/supabase_schema.sql`.
8. `supabase/functions/_shared/groq.ts`.
9. Các tài liệu trong `docs/modules/`.

## 14. Nguồn sự thật

Thứ tự ưu tiên khi tài liệu mâu thuẫn:

```text
Source code
→ Database schema
→ package/config
→ SETUP.md
→ PROJECT_REPORT_INFO.md
→ module docs
```

Không ghi giá trị thật của API key, service role key, password ngoài các tài khoản demo hoặc credentials production vào báo cáo.
