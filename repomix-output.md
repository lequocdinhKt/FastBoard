This file is a merged representation of the entire codebase, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
docs/
  modules/
    00-ARCHITECTURE.md
    01-AUTHORIZATION.md
    02-PROJECTS.md
    03-TASKS.md
    04-KANBAN-LIST-FILTER.md
    05-DASHBOARD.md
    06-TEAM-PROFILE.md
    07-NOTIFICATIONS.md
    08-AI-EDGE-FUNCTIONS.md
    09-THEME-I18N.md
    10-DEFENSE-GUIDE.md
public/
  assets/
    f.svg
scripts/
  seed-auth-users.mjs
src/
  assets/
    s.svg
  components/
    auth/
      LoginScreen.tsx
    dashboard/
      DashboardStats.tsx
      ProductivityCard.tsx
      RecentActivity.tsx
      StatusDonutChart.tsx
      TaskTrendChart.tsx
    layout/
      header/
        HeaderClock.tsx
        HeaderControls.tsx
        HeaderLanguage.tsx
      Header.tsx
      Sidebar.tsx
    member-modal/
      MemberForm.tsx
    modals/
      ModalManager.tsx
    notifications/
      NotificationsFooter.tsx
      NotificationsHeader.tsx
      NotificationsList.tsx
    project-detail/
      ProjectHeader.tsx
      ProjectStats.tsx
    project-modal/
      ProjectForm.tsx
    projects-view/
      ProjectCardFooter.tsx
      ProjectCardHeader.tsx
      ProjectCardProgress.tsx
    task-modal/
      TaskComments.tsx
      TaskDetails.tsx
      TaskModalFooter.tsx
      TaskModalHeader.tsx
      TaskModalTabs.tsx
      TaskSubtasks.tsx
    ui/
      Badge.tsx
      Button.tsx
      Card.tsx
      ErrorBoundary.tsx
      FilterBar.tsx
      ModalHeader.tsx
      Skeleton.tsx
      Toast.tsx
    views/
      ViewManager.tsx
    Dashboard.tsx
    KanbanBoard.tsx
    MemberDetailView.tsx
    MemberModal.tsx
    NotificationsPanel.tsx
    ProfileModal.tsx
    ProjectDetailView.tsx
    ProjectModal.tsx
    ProjectsView.tsx
    TaskListView.tsx
    TaskModal.tsx
    TeamView.tsx
  constants/
    demoUsers.ts
  context/
    AppContext.tsx
  hooks/
    modules/
      useDataFetching.ts
      useEntityOperations.ts
      useSearchSystem.ts
      useUIState.ts
    useAppLogic.ts
    useDashboardData.ts
    useTaskForm.ts
  services/
    aiService.ts
    supabaseClient.ts
  types/
    enums.ts
    index.ts
    models.ts
    props.ts
    ui.ts
  utils/
    commentMapping.test.ts
    roles.test.ts
    roles.ts
  App.tsx
  constants.ts
  index.css
  main.tsx
  supabase_schema.sql
  translations.ts
supabase/
  .temp/
    cli-latest
    gotrue-version
    linked-project.json
    pooler-url
    postgres-version
    project-ref
    rest-version
    storage-migration
    storage-version
  functions/
    _shared/
      groq.ts
    generate-subtasks/
      index.ts
    suggest-priority/
      index.ts
    deno.d.ts
.env.example
.gitignore
eslint.config.js
index.html
package.json
PROJECT_REPORT_INFO.md
SETUP.md
tailwind.config.js
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="docs/modules/00-ARCHITECTURE.md">
# Module 00 — Kiến trúc và luồng dữ liệu

## Mục tiêu

Hiểu component nào gọi hook nào, dữ liệu đi tới Supabase ra sao và vì sao dự án không cần một Node backend riêng cho CRUD.

## Thành phần chính

| Thành phần | Trách nhiệm |
|---|---|
| `App.tsx` | Auth gate và layout |
| `AppContext.tsx` | Cấp state/actions cho cây React |
| `useAppLogic.ts` | Facade ghép Auth, UI, fetch, filter, CRUD, Realtime |
| `useUIState.ts` | Tab, modal, theme, language, toast |
| `useDataFetching.ts` | Đọc DB và map dữ liệu |
| `useSearchSystem.ts` | Filter task trong bộ nhớ |
| `useEntityOperations.ts` | Ghi project/task/member/profile |
| `supabaseClient.ts` | Singleton Supabase SDK |

## Luồng khởi động

```text
index.html
→ src/main.tsx
→ AppProvider
→ useAppLogic
→ AppLayout
→ Sidebar + Header + ViewManager + ModalManager
```

`App.tsx` hiển thị:

1. Loading nếu chưa restore session.
2. LoginScreen nếu chưa Auth.
3. App shell nếu đã Auth.

## Luồng đọc dữ liệu

```text
Supabase Auth session
→ load public.users profile
→ useDataFetching
→ users/projects/project_members/tasks/subtasks/comments/notifications
→ map snake_case thành model frontend
→ AppContext state
→ ViewManager
```

`state.rawTasks` là task gốc. `state.tasks` là task đã qua FilterBar.

## Luồng ghi dữ liệu

```text
UI event
→ action trong useAppLogic
→ useEntityOperations
→ supabase.from(...)
→ PostgreSQL + RLS
→ optimistic update hoặc refetch
```

## Điều hướng

Dự án không dùng React Router. `ViewMode` và `activeTab` chọn một trong:

- `dashboard`
- `projects`
- `kanban`
- `list`
- `team`

`ViewManager.tsx` switch theo `activeTab`. Project/member detail dùng `selectedProject` hoặc `selectedMember`.

## Điểm cần nhớ khi bảo vệ

- Supabase là BaaS, không phải “không có backend”.
- PostgreSQL, Auth, RLS, triggers, Realtime và Edge Functions đều chạy phía server của Supabase.
- `useAppLogic` là facade, giúp UI không phụ thuộc trực tiếp vào nhiều hook.
- RLS là lớp bảo mật; Context chỉ quản lý trạng thái frontend.

## File nên mở khi demo

- `src/main.tsx`
- `src/App.tsx`
- `src/context/AppContext.tsx`
- `src/hooks/useAppLogic.ts`
- `src/components/views/ViewManager.tsx`
</file>

<file path="docs/modules/01-AUTHORIZATION.md">
# Module 01 — Authentication và Authorization

## Mục tiêu

Đăng nhập bằng Supabase Auth và bảo vệ dữ liệu bằng PostgreSQL Row Level Security.

## Luồng đăng nhập

```text
LoginScreen
→ handleLogin
→ supabase.auth.signInWithPassword
→ loadProfile từ public.users
→ isAuth = true
→ useDataFetching
```

Session được persist bởi `supabaseClient.ts` và restore bằng:

- `supabase.auth.getSession()`
- `supabase.auth.onAuthStateChange()`

## Profile và Auth user

- `auth.users`: danh tính, email, password hash và session.
- `public.users`: name, avatar, role, job role và email hiển thị.
- `public.users.id = auth.users.id`.

Không lưu password trong bảng `public.users`.

## Role

```text
ADMIN
MEMBER
```

Admin có quyền quản lý member và xóa project. Member chỉ thao tác trong project mình tham gia.

## RLS quan trọng

| Đối tượng | Quy tắc |
|---|---|
| Projects | Admin hoặc member của project |
| Tasks | Member của project |
| Comments | User hiện tại và thuộc project |
| Notifications | Chỉ owner |
| Users | Self-update, role bị khóa; admin quản lý |

Database helpers:

- `is_admin()`
- `is_project_member(project_id)`

## Client guards

`src/utils/roles.ts` có:

- `isAdmin`
- `canManageMembers`
- `resolveRoleForProfileUpdate`

Các guard này phục vụ UX. Nếu bỏ qua frontend, RLS vẫn phải từ chối request trái phép.

## Hạn chế

- Không có self-sign-up.
- Không có reset password UI.
- Member mới phải tồn tại trong Supabase Auth trước.
- Xóa `public.users` không xóa `auth.users`.

## Câu hỏi bảo vệ

### Vì sao anon key xuất hiện ở frontend?

Anon key không phải service secret. Quyền thực tế được quyết định bởi JWT và RLS.

### Member có thể sửa request để tự thành Admin không?

RLS khóa role khi self-update; client guard chỉ là lớp bổ sung.

### Session được giữ sau refresh thế nào?

Supabase client dùng `persistSession: true`, sau đó `useAppLogic` gọi `getSession`.

## File liên quan

- `src/components/auth/LoginScreen.tsx`
- `src/hooks/useAppLogic.ts`
- `src/services/supabaseClient.ts`
- `src/utils/roles.ts`
- `src/supabase_schema.sql`
</file>

<file path="docs/modules/02-PROJECTS.md">
# Module 02 — Quản lý Project

## Mục tiêu

Tạo, sửa, xóa, xem chi tiết project và quản lý danh sách thành viên tham gia.

## Thành phần UI

- `ProjectsView.tsx`: danh sách project.
- `ProjectDetailView.tsx`: chi tiết project.
- `ProjectModal.tsx`: modal tạo/sửa.
- `project-modal/ProjectForm.tsx`: form.
- `project-detail/*`: header và thống kê.

## Luồng đọc

`useDataFetching` đọc:

1. `projects`.
2. `project_members`.
3. Gom `user_id` theo `project_id`.
4. Map thành `Project.members: string[]`.

## Luồng tạo/sửa

```text
ProjectForm
→ handleProjectSaveWrapper
→ useEntityOperations.handleProjectSave
→ upsert projects
→ syncProjectMembers
→ update local state
```

`syncProjectMembers` dùng replace-all:

1. Xóa membership cũ.
2. Insert danh sách mới.
3. Luôn thêm người tạo vào project.

## Luồng xóa

```text
Confirm
→ delete projects
→ DB cascade task liên quan
→ loại project/task khỏi local state
```

RLS chỉ cho Admin xóa project.

## Tiến độ project

UI tính từ task:

```text
progress = completed tasks / total tasks × 100
```

Project không có task trả về 0%.

## Database

### `projects`

- `id`
- `name`
- `description`
- `status`
- `progress`
- `created_by`
- `created_at`

### `project_members`

- `project_id`
- `user_id`
- `role`
- `joined_at`

## Hạn chế

- DB có cột `progress`, nhưng UI chủ yếu tính lại từ tasks.
- Đồng bộ membership theo replace-all, chưa tối ưu diff.
- Member có thể thấy nút nào đó ở UI nhưng RLS vẫn là quyết định cuối.

## Câu hỏi bảo vệ

### Quan hệ project–user là gì?

N-N qua `project_members`.

### Tại sao không lưu `members[]` trong một cột?

Bảng nối hỗ trợ khóa ngoại, truy vấn membership và RLS rõ ràng hơn.

### Xóa project ảnh hưởng task thế nào?

Foreign key `tasks.project_id` dùng `ON DELETE CASCADE`.

## File liên quan

- `src/components/ProjectsView.tsx`
- `src/components/ProjectDetailView.tsx`
- `src/components/ProjectModal.tsx`
- `src/hooks/modules/useEntityOperations.ts`
- `src/hooks/modules/useDataFetching.ts`
</file>

<file path="docs/modules/03-TASKS.md">
# Module 03 — Task, Subtask và Comment

## Mục tiêu

Quản lý vòng đời task cùng checklist subtask và trao đổi bằng comment.

## Model Task

Các trường chính:

- Project.
- Title và description.
- Status.
- Priority.
- Assignee.
- Due date.
- Tags.
- Subtasks.
- Comments.
- `createdAt`, `completedAt`.

## Trạng thái

| Enum | Nhãn VI |
|---|---|
| `TODO` | Mới tạo |
| `IN_PROGRESS` | Đang xử lý |
| `REVIEW` | Chờ kiểm tra |
| `DONE` | Đã hoàn thành |

## Luồng form

```text
TaskModal
→ useTaskForm
→ TaskDetails / TaskSubtasks / TaskComments
→ user bấm Save
→ useEntityOperations.handleTaskSave
```

Form state là dữ liệu tạm. Chỉnh sửa subtask, comment hoặc nhận gợi ý AI chưa ghi DB cho đến khi Save.

## Persist Task

`handleTaskSave`:

1. Upsert row `tasks`.
2. Nếu `DONE`, bảo đảm có `completed_at`.
3. Nếu rời `DONE`, đặt `completed_at = null`.
4. Xóa toàn bộ subtasks cũ.
5. Insert lại subtasks hiện tại.
6. Upsert comments.
7. Refetch dữ liệu.

## Cập nhật status nhanh

Kanban/List gọi:

```text
useAppLogic.handleUpdateTaskStatus
→ optimistic local state
→ useEntityOperations.handleUpdateTaskStatus
→ update tasks.status + completed_at
```

Nếu lỗi, hệ thống refetch.

## Database

- `tasks`
- `subtasks`
- `comments`

Triggers database tạo notification cho:

- Assignment.
- Status change.
- New comment.

## Hạn chế

- Task form hiện đặt `tags: []`, chưa có UI chỉnh tags hoàn chỉnh.
- Subtasks dùng replace-all khi Save.
- Comments hiện upsert; chưa có luồng đồng bộ xóa comment đầy đủ.
- Một số ID client dùng chuỗi tự sinh.

## Câu hỏi bảo vệ

### Tại sao AI không tự lưu subtask?

AI chỉ đưa gợi ý vào form. Human-in-the-loop quyết định bằng nút Save.

### `completed_at` được quản lý thế nào?

Ghi khi status thành `DONE`, xóa khi rời `DONE`.

### Comment được bảo vệ ra sao?

RLS yêu cầu `user_id = auth.uid()` và user thuộc project.

## File liên quan

- `src/components/TaskModal.tsx`
- `src/components/task-modal/*`
- `src/hooks/useTaskForm.ts`
- `src/hooks/modules/useEntityOperations.ts`
- `src/types/models.ts`
</file>

<file path="docs/modules/04-KANBAN-LIST-FILTER.md">
# Module 04 — Kanban, Task List và FilterBar

## Mục tiêu

Cung cấp hai cách xem task và một bộ lọc dùng chung.

## Kanban

`KanbanBoard.tsx` nhóm task theo:

- TODO.
- IN_PROGRESS.
- REVIEW.
- DONE.

Kéo thả dùng HTML5 Drag and Drop. Khi drop:

1. Lấy task ID.
2. Xác định status của cột đích.
3. Gọi `onUpdateTaskStatus`.
4. UI optimistic update.
5. Ghi Supabase.

## Task List

`TaskListView.tsx` hiển thị task dạng bảng với:

- Title.
- Project.
- Assignee.
- Priority.
- Status.
- Due date.
- Hành động edit/update.

## FilterBar

`useSearchSystem` giữ:

```text
search
priority
assigneeId
```

Điều kiện:

1. Search substring trên title, description hoặc tags.
2. Priority phải khớp nếu không phải `ALL`.
3. Assignee phải khớp nếu không phải `ALL`.

Tất cả điều kiện được kết hợp bằng AND.

## State quan trọng

- `state.rawTasks`: chưa lọc.
- `state.tasks`: kết quả `filteredTasks`.
- `state.filters`: điều kiện hiện tại.
- `actions.setFilters`: cập nhật FilterBar.

Kanban và List dùng `state.tasks`. Team dùng `rawTasks`.

## Không phải global search

Module này:

- Không tìm project/member/comment.
- Không scoring/ranking.
- Không fuzzy search.
- Không gọi database theo từng ký tự.

## Hạn chế

- Filter chạy client-side, phù hợp dataset đồ án nhỏ.
- Filter state mất khi reload.
- Project detail dùng filter state riêng và logic hơi khác global view.
- Dashboard hiện nhận danh sách đã lọc nên FilterBar có thể ảnh hưởng thống kê.

## Câu hỏi bảo vệ

### Độ phức tạp filter?

Xấp xỉ O(n) cho mỗi lần thay đổi filter, với n là số task đã tải.

### Vì sao filter phía client?

Dataset demo nhỏ, phản hồi tức thời và giảm request. Với dữ liệu lớn nên chuyển sang query/index phía server.

## File liên quan

- `src/components/KanbanBoard.tsx`
- `src/components/TaskListView.tsx`
- `src/components/ui/FilterBar.tsx`
- `src/hooks/modules/useSearchSystem.ts`
- `src/constants.ts`
</file>

<file path="docs/modules/05-DASHBOARD.md">
# Module 05 — Dashboard và thuật toán thống kê

## Mục tiêu

Tổng hợp task/project đã tải thành KPI và biểu đồ mà không cần endpoint analytics riêng.

## Component

- `Dashboard.tsx`
- `DashboardStats.tsx`
- `ProductivityCard.tsx`
- `TaskTrendChart.tsx`
- `StatusDonutChart.tsx`
- `RecentActivity.tsx`

Logic nằm trong `useDashboardData.ts`.

## Status distribution

Đếm task theo:

- TODO.
- IN_PROGRESS.
- REVIEW.
- DONE.

Kết quả dùng cho donut chart.

## Trend 7/30 ngày

Với từng ngày trong khoảng:

- `created`: số task có `createdAt` trong ngày.
- `due`: số task có `dueDate` trong ngày.

Weekly hiển thị 7 ngày, monthly hiển thị 30 ngày.

## Productivity

1. Xác định tuần hiện tại từ thứ Hai đến Chủ nhật.
2. Lọc task có due date trong tuần.
3. Đếm task DONE.
4. Tính:

```text
percentage = completed / total × 100
```

Nếu không có task đến hạn thì kết quả là 0.

## Thời gian xử lý trung bình

Chỉ dùng task:

- Status DONE.
- Có `createdAt`.
- Có `completedAt`.
- Hiệu thời gian không âm.

```text
durationDays = (completedAt - createdAt) / 86,400,000
average = tổng durationDays / số task hợp lệ
```

Đây là thời gian từ lúc tạo đến lúc hoàn thành, không phải stopwatch.

## Member average

`MemberDetailView.tsx` áp dụng công thức tương tự nhưng chỉ trên task của member đang xem.

## Nguồn dữ liệu

Dashboard không query Supabase riêng. Nó nhận `tasks` và `projects` từ Context.

Lưu ý hiện tại: `ViewManager` truyền `state.tasks`, tức dữ liệu đã qua FilterBar.

## Hạn chế

- Tính toán phía client.
- Recent activity lấy các task đầu mảng, chưa phải audit log.
- Một số label động còn hard-code English.
- Không có benchmark hiệu năng.

## Câu hỏi bảo vệ

### “Năng suất” có nghĩa gì?

Tỷ lệ task đến hạn trong tuần hiện tại đã DONE, không phải số giờ làm việc.

### Vì sao cần `completed_at`?

`created_at` chỉ cho biết lúc tạo. Muốn đo duration cần mốc hoàn thành riêng.

## File liên quan

- `src/components/Dashboard.tsx`
- `src/components/dashboard/*`
- `src/hooks/useDashboardData.ts`
- `src/components/MemberDetailView.tsx`
- `src/hooks/modules/useEntityOperations.ts`
</file>

<file path="docs/modules/06-TEAM-PROFILE.md">
# Module 06 — Team, Member và Profile

## Mục tiêu

Hiển thị danh sách thành viên, workload, chi tiết member và cho phép cập nhật profile theo quyền.

## Thành phần UI

- `TeamView.tsx`
- `MemberDetailView.tsx`
- `MemberModal.tsx`
- `member-modal/MemberForm.tsx`
- `ProfileModal.tsx`

## Dữ liệu

Model `User` gồm:

- ID.
- Name.
- Avatar.
- Role.
- Job role.
- Email.

Team views dùng `rawTasks` để workload không bị ảnh hưởng bởi FilterBar global.

## Thêm/sửa member

```text
MemberForm
→ handleMemberSave
→ canManageMembers
→ lookup existing Auth profile by email
→ upsert public.users
→ update local users state
```

Khi thêm mới, Auth user phải tồn tại trước. Ứng dụng không dùng service role ở browser để tạo Auth user.

## Profile update

`handleProfileUpdate`:

1. `resolveRoleForProfileUpdate` bảo vệ role.
2. Member chỉ sửa chính mình.
3. Admin có thể quản lý member.
4. Upsert `public.users`.
5. Đồng bộ current user và users state.

## Avatar

UI có thể đọc ảnh bằng FileReader và lưu Data URL vào cột text. Dự án chưa dùng Supabase Storage.

## Member detail

Hiển thị:

- Tổng task được giao.
- Task DONE.
- Task IN_PROGRESS.
- Completion rate.
- Active projects.
- Average completion time.
- Danh sách task của member.

## Hạn chế

- Online dot chỉ là giao diện, không phải realtime presence.
- Xóa profile không xóa Auth identity.
- Avatar Data URL làm row database lớn.
- Không có invite-member Edge Function.

## Câu hỏi bảo vệ

### Vì sao không tạo Auth user trực tiếp từ React?

Tạo user Admin API cần service role secret; không được đưa secret đó vào browser.

### Member có thể tự đổi role không?

Không. Client guard và RLS đều bảo vệ.

## File liên quan

- `src/components/TeamView.tsx`
- `src/components/MemberDetailView.tsx`
- `src/components/ProfileModal.tsx`
- `src/components/MemberModal.tsx`
- `src/hooks/modules/useEntityOperations.ts`
- `src/utils/roles.ts`
</file>

<file path="docs/modules/07-NOTIFICATIONS.md">
# Module 07 — Notifications và Realtime

## Mục tiêu

Tạo thông báo ở database và cập nhật panel của đúng người dùng theo thời gian thực.

## Loại notification

- `ASSIGNMENT`
- `STATUS_CHANGE`
- `COMMENT`
- `DUE_DATE`

## Nơi tạo notification

Frontend không tự insert notification cho các sự kiện nghiệp vụ chính. PostgreSQL triggers xử lý:

- `notify_task_assignment()`
- `notify_task_status_change()`
- `notify_new_comment()`

Điều này giúp notification vẫn được tạo nếu dữ liệu thay đổi từ client khác.

## Luồng tải ban đầu

```text
Login
→ useDataFetching
→ select notifications
→ eq user_id current user
→ order created_at descending
```

## Luồng Realtime

```text
DB trigger inserts notification
→ Supabase Realtime publication
→ postgres_changes subscription
→ useAppLogic
→ setNotifications
→ NotificationsPanel
```

Channel được filter theo `user_id`.

## Mark as read

- Một notification: optimistic update rồi update row.
- Tất cả: optimistic map toàn bộ rồi update rows theo user.

RLS chỉ cho user thao tác notification của chính mình.

## Điều kiện vận hành

Phải thêm bảng `notifications` vào Supabase Realtime publication trong Dashboard.

Nếu chưa bật publication:

- Notification vẫn được lưu.
- Fetch/reload vẫn thấy.
- UI không nhận tức thời.

## Hạn chế

- Không có push notification hệ điều hành.
- Không gửi email.
- “View all activity” chưa điều hướng.
- Một số empty-state text chưa i18n đầy đủ.

## Câu hỏi bảo vệ

### Vì sao dùng trigger thay vì React?

Trigger giữ nghiệp vụ notification nhất quán dù thay đổi đến từ bất kỳ client nào.

### Realtime có thay thế database không?

Không. Database lưu source of truth; Realtime chỉ truyền sự kiện thay đổi.

## File liên quan

- `src/hooks/useAppLogic.ts`
- `src/hooks/modules/useDataFetching.ts`
- `src/components/NotificationsPanel.tsx`
- `src/components/notifications/*`
- `src/supabase_schema.sql`
</file>

<file path="docs/modules/08-AI-EDGE-FUNCTIONS.md">
# Module 08 — AI qua Supabase Edge Functions

## Mục tiêu

Giữ AI hữu ích cho workflow nhưng không để Groq API key trong browser.

Hai chức năng:

1. Generate Subtasks.
2. Suggest Priority.

## Kiến trúc

```text
TaskDetails buttons
→ useTaskForm handlers
→ aiService
→ supabase.functions.invoke
→ Supabase gateway kiểm tra JWT
→ Edge Function
→ Groq API
→ validate response
→ form state
```

## Client

`src/services/aiService.ts` chỉ:

- Gọi `generate-subtasks`.
- Gọi `suggest-priority`.
- Kiểm tra response shape.
- Ném error để UI hiển thị toast.

Client không import Groq SDK và không biết API key.

## Shared Edge gateway

`supabase/functions/_shared/groq.ts`:

- Đọc `Deno.env.get('GROQ_API_KEY')`.
- Gọi Groq REST endpoint.
- Dùng model `openai/gpt-oss-20b`.
- Thiết lập CORS.
- Yêu cầu Authorization header.
- Chuẩn hóa JSON response/error.

Supabase gateway verify JWT mặc định khi deploy không dùng `--no-verify-jwt`.

## Generate Subtasks

Input:

```json
{
  "title": "Implement login",
  "description": "Use Supabase Auth"
}
```

Output:

```json
{
  "subtasks": [
    "Create login form",
    "Connect Supabase Auth",
    "Handle session restore"
  ]
}
```

Function:

- Giới hạn input length.
- Yêu cầu raw JSON array.
- Loại markdown fence.
- Chỉ nhận string hợp lệ.
- Giới hạn tối đa 5 subtask.

## Suggest Priority

Input gồm title và description.

Output:

```json
{
  "priority": "HIGH"
}
```

Edge Function chỉ trả `LOW`, `MEDIUM`, `HIGH`; nếu text không rõ thì dùng `MEDIUM`.

## Human-in-the-loop

Handlers trong `useTaskForm` chỉ gọi:

- `setSubtasks`
- `setPriority`

Không gọi `onSave`, `useEntityOperations` hoặc `supabase.from('tasks')`.

Người dùng có thể:

- Sửa gợi ý.
- Xóa gợi ý.
- Đóng modal để bỏ toàn bộ.
- Bấm Save để chấp nhận.

## Bảo mật

- `GROQ_API_KEY` là Edge Secret.
- Không inject key trong `vite.config.ts`.
- Không để key trong `.env` frontend.
- Không dùng `dangerouslyAllowBrowser`.
- Không cài `groq-sdk` trong package frontend.

## Deploy

```bash
supabase login
supabase link --project-ref your_project_ref
supabase secrets set GROQ_API_KEY=your_groq_api_key
supabase functions deploy generate-subtasks
supabase functions deploy suggest-priority
```

## Lỗi `Cannot find name 'Deno'`

`Deno` là global của Edge Runtime, không phải browser API. Workspace dùng:

```text
supabase/functions/deno.d.ts
```

và triple-slash reference để TypeScript server nhận diện type. File declaration chỉ phục vụ editor; runtime vẫn dùng Deno thật của Supabase.

## Hạn chế

- Phụ thuộc Groq quota/network.
- Chưa có retry, cache hoặc rate limit riêng.
- Không có fallback model.
- Chưa có automated integration test cho Edge Functions.

## Câu hỏi bảo vệ

### Tại sao không gọi Groq trực tiếp từ React?

Browser bundle có thể bị đọc. Đặt key ở frontend sẽ lộ secret.

### Tại sao dùng Edge Function?

Giữ secret server-side, xác thực user bằng JWT và chuẩn hóa input/output trước khi trả về client.

## File liên quan

- `src/services/aiService.ts`
- `src/hooks/useTaskForm.ts`
- `src/components/task-modal/TaskDetails.tsx`
- `supabase/functions/_shared/groq.ts`
- `supabase/functions/generate-subtasks/index.ts`
- `supabase/functions/suggest-priority/index.ts`
</file>

<file path="docs/modules/09-THEME-I18N.md">
# Module 09 — Theme và đa ngôn ngữ

## Mục tiêu

Cho phép chuyển dark/light mode và English/Tiếng Việt mà không cần thư viện i18n ngoài.

## State

`useUIState.ts` quản lý:

- `darkMode`
- `language`
- Hàm `t(key)`

## Persist

LocalStorage keys:

```text
FASTBOARD-theme
FASTBOARD-lang
```

Khi theme thay đổi, hook thêm/xóa class `dark` trên `document.documentElement`.

## Translation

`src/translations.ts` chứa dictionary:

```text
en
vi
```

Component gọi:

```ts
t('newTask')
```

Nếu key không tồn tại, helper trả chính key để UI không crash.

## UI entry

- `HeaderLanguage.tsx`: đổi ngôn ngữ.
- `HeaderControls.tsx`: đổi theme.
- LoginScreen nhận language prop và có bộ text riêng.

## Không liên quan database

Theme/language là preference local, không lưu Supabase.

## Hạn chế

- Một số toast và label động còn hard-code English.
- Không dùng react-i18next.
- Dictionary phẳng, chưa namespace.
- Không đồng bộ preference giữa thiết bị.

## Câu hỏi bảo vệ

### Vì sao không lưu theme trong database?

Đây là preference UI nhẹ; localStorage đủ cho phạm vi MVP và hoạt động trước khi login.

### Dark mode hoạt động thế nào?

Tailwind dark variants dựa trên class `dark` ở root HTML.

## File liên quan

- `src/hooks/modules/useUIState.ts`
- `src/translations.ts`
- `src/components/layout/header/HeaderLanguage.tsx`
- `src/components/layout/header/HeaderControls.tsx`
</file>

<file path="docs/modules/10-DEFENSE-GUIDE.md">
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
</file>

<file path="public/assets/f.svg">
<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="512" height="512">
<path d="M0 0 C4.24903979 1.85037009 8.1228607 4.19441075 12.0625 6.625 C13.21040121 7.3131823 14.35951435 7.99934667 15.50976562 8.68359375 C17.86910147 10.09012325 20.22222363 11.50624598 22.57080078 12.93066406 C27.67485503 16.02041706 32.84017358 19.00469344 38 22 C39.97934757 23.15594029 41.95851286 24.31219276 43.9375 25.46875 C50.27895672 29.16793309 56.63840485 32.83558896 63 36.5 C76.35015665 44.19117469 89.65733128 51.9548296 102.95898438 59.72949219 C105.93065505 61.46606836 108.90269374 63.20201192 111.875 64.9375 C112.86218018 65.51395264 113.84936035 66.09040527 114.86645508 66.68432617 C122.16611392 70.9420168 129.48704158 75.16189825 136.8125 79.375 C146.87364481 85.16388211 156.87525306 91.04711499 166.84326172 96.99487305 C172.64216924 100.44740914 178.46369962 103.84920234 184.33984375 107.16796875 C185.54168779 107.84957213 186.743511 108.53121225 187.9453125 109.21289062 C190.21667295 110.5005192 192.49425664 111.77396904 194.77734375 113.04101562 C195.79828125 113.61916016 196.81921875 114.19730469 197.87109375 114.79296875 C198.76755615 115.2933667 199.66401855 115.79376465 200.58764648 116.30932617 C203.44058024 118.30877626 205.07179982 120.08586282 207 123 C207.50793457 126.33898926 207.50793457 126.33898926 207.51757812 130.18945312 C207.52809204 131.24651711 207.52809204 131.24651711 207.53881836 132.32493591 C207.55636004 134.64411339 207.54479048 136.96206108 207.53125 139.28125 C207.53394605 140.89880608 207.53782941 142.51636058 207.54284668 144.13391113 C207.5487365 147.51993273 207.54019582 150.90553155 207.52148438 154.29150391 C207.49869466 158.62612817 207.51182058 162.95976173 207.53577423 167.29434967 C207.55024645 170.63331532 207.54561979 173.9720471 207.53526306 177.3110199 C207.53259969 178.90897235 207.53585185 180.50694622 207.54518127 182.10487366 C207.55537097 184.34066801 207.53981492 186.57487072 207.51757812 188.81054688 C207.51439575 190.08119995 207.51121338 191.35185303 207.50793457 192.66101074 C206.90912172 196.59740294 205.77507997 198.19821089 203 201 C199.984375 203.01953125 199.984375 203.01953125 196.75 204.8125 C195.67234375 205.41707031 194.5946875 206.02164063 193.484375 206.64453125 C192.66453125 207.09183594 191.8446875 207.53914062 191 208 C194.13171944 210.56080422 197.29403279 212.92414351 200.6875 215.125 C203.05209763 216.65900787 205.00269892 218.00269892 207 220 C207.26171303 221.92528248 207.26171303 221.92528248 207.2784729 224.32563782 C207.29521812 225.69155563 207.29521812 225.69155563 207.31230164 227.08506775 C207.31446182 228.08864822 207.31662201 229.0922287 207.31884766 230.1262207 C207.32889328 231.182547 207.3389389 232.23887329 207.34928894 233.32720947 C207.38041954 236.86006126 207.39728942 240.39283427 207.4140625 243.92578125 C207.43281815 246.41912953 207.45239466 248.91247175 207.4727478 251.4058075 C207.51382376 256.67961672 207.54878521 261.95341138 207.578125 267.22729492 C207.62194452 275.1014882 207.68143663 282.97552869 207.7421875 290.84960938 C207.82925201 302.41026478 207.89360217 313.97089593 207.94313431 325.53177071 C207.97739201 333.24675944 208.03015758 340.96135124 208.09687996 348.67612553 C208.13701063 353.62528948 208.16471907 358.57447058 208.18943405 363.52373314 C208.20365042 365.85037176 208.22305437 368.17698507 208.24791336 370.50353432 C208.28124166 373.69800778 208.29596326 376.89205105 208.30615234 380.08666992 C208.32758615 381.49290524 208.32758615 381.49290524 208.34945297 382.92754936 C208.3440231 387.78702994 208.18260359 391.06269814 205 395 C198.57373835 400.54857638 190.79057669 404.51095683 183.375 408.5625 C174.88076024 413.26107918 166.43618799 418.02710702 158.0625 422.9375 C149.76625069 427.79945629 141.456567 432.63626856 133.125 437.4375 C132.04484619 438.06003662 130.96469238 438.68257324 129.85180664 439.32397461 C127.66203666 440.58576826 125.47217645 441.84740534 123.28222656 443.10888672 C117.85340058 446.23680148 112.42680719 449.36858448 107 452.5 C104.83334417 453.75001879 102.6666775 455.00001878 100.5 456.25 C99.4275 456.86875 98.355 457.4875 97.25 458.125 C61.5 478.75 61.5 478.75 58.24658203 480.62695312 C56.09128689 481.8704051 53.93601327 483.11389436 51.78076172 484.35742188 C46.77662326 487.24462875 41.7722948 490.1315043 36.76715088 493.01696777 C35.01658759 494.02619104 33.26609589 495.03553836 31.515625 496.04492188 C29.33607835 497.3016766 27.15640168 498.55820586 24.9765625 499.81445312 C23.97625 500.39130859 22.9759375 500.96816406 21.9453125 501.5625 C20.96336914 502.12195313 19.98142578 502.68140625 18.96972656 503.2578125 C16.92780628 504.45570326 14.91483209 505.7038927 12.92871094 506.9921875 C7.53105337 510.42189527 3.07212584 513.15400741 -3.46679688 512.62646484 C-8.72109218 511.32706992 -13.15068727 508.58729198 -17.75 505.8125 C-18.84127197 505.17755615 -19.93254395 504.5426123 -21.05688477 503.88842773 C-24.38395393 501.94629119 -27.69282623 499.97577932 -31 498 C-32.86759196 496.89951692 -34.73603082 495.80046932 -36.60546875 494.703125 C-40.19233565 492.59351103 -43.77191149 490.47215425 -47.34765625 488.34375 C-53.4922826 484.69575043 -59.6812405 481.1262587 -65.875 477.5625 C-79.26882828 469.85380763 -92.61711337 462.0686773 -105.95898438 454.27050781 C-108.93065505 452.53393164 -111.90269374 450.79798808 -114.875 449.0625 C-115.86218018 448.48604736 -116.84936035 447.90959473 -117.86645508 447.31567383 C-125.16611349 443.05798345 -132.48700606 438.83803948 -139.8125 434.625 C-149.82979822 428.8623607 -159.7838574 423.00007826 -169.70483398 417.07324219 C-175.67839127 413.51681908 -181.68058429 410.03394093 -187.75 406.64453125 C-189.03727489 405.92244957 -190.32454705 405.20036303 -191.61181641 404.47827148 C-194.05995212 403.10602264 -196.51619682 401.75007655 -198.97802734 400.40258789 C-200.64019287 399.47240845 -200.64019287 399.47240845 -202.3359375 398.5234375 C-203.79845947 397.717854 -203.79845947 397.717854 -205.29052734 396.89599609 C-209.76502874 393.76489339 -212.63625985 390.95617198 -213.63491821 385.58544922 C-213.63889618 384.33779785 -213.64287415 383.09014648 -213.64697266 381.8046875 C-213.65573425 381.11119202 -213.66449585 380.41769653 -213.67352295 379.70318604 C-213.69540653 377.4264745 -213.68100642 375.15172887 -213.6640625 372.875 C-213.66743388 371.28368764 -213.67228918 369.6923778 -213.67855835 368.10107422 C-213.68591462 364.7722106 -213.67526533 361.44401956 -213.65185547 358.11523438 C-213.62336732 353.85788434 -213.63977815 349.60211038 -213.66971779 345.34481812 C-213.68782516 342.0606712 -213.68201723 338.77689518 -213.66907883 335.49273682 C-213.66575426 333.92352103 -213.66979844 332.35427107 -213.68147659 330.78509521 C-213.69424359 328.58759985 -213.67473338 326.39262134 -213.64697266 324.1953125 C-213.64299469 322.94766113 -213.63901672 321.70000977 -213.63491821 320.41455078 C-212.64216932 315.07560879 -209.77777259 312.29534854 -205.39453125 309.1015625 C-204.54246094 308.61429687 -203.69039062 308.12703125 -202.8125 307.625 C-201.52279297 306.87089844 -201.52279297 306.87089844 -200.20703125 306.1015625 C-198 305 -198 305 -196 305 C-196 304.34 -196 303.68 -196 303 C-197.07701172 302.59587891 -197.07701172 302.59587891 -198.17578125 302.18359375 C-201.00607908 300.99745233 -203.55116695 299.62994159 -206.1875 298.0625 C-207.04730469 297.55847656 -207.90710938 297.05445313 -208.79296875 296.53515625 C-211 295 -211 295 -213 292 C-213.26171303 289.97008038 -213.26171303 289.97008038 -213.2784729 287.59880066 C-213.28963638 286.69667343 -213.30079987 285.7945462 -213.31230164 284.86508179 C-213.31446182 283.87601837 -213.31662201 282.88695496 -213.31884766 281.86791992 C-213.32889328 280.82280746 -213.3389389 279.77769501 -213.34928894 278.70091248 C-213.38038092 275.21076999 -213.39728062 271.72070721 -213.4140625 268.23046875 C-213.43282321 265.76336556 -213.45240005 263.29626846 -213.4727478 260.82917786 C-213.51906844 254.94375713 -213.55628996 249.05833085 -213.58942068 243.1728223 C-213.63012535 236.05979529 -213.68666801 228.94690776 -213.7421875 221.83398438 C-213.82943537 210.37660165 -213.89377664 198.91924374 -213.94313431 187.4616375 C-213.97769263 179.70533277 -214.03072015 171.94941018 -214.09687996 164.19331264 C-214.13708669 159.1559804 -214.16476896 154.1186315 -214.18943405 149.08120155 C-214.20365554 146.70499304 -214.22306346 144.32880935 -214.24791336 141.95268822 C-214.2812599 138.68491866 -214.29596999 135.41757016 -214.30615234 132.1496582 C-214.32044155 131.18869799 -214.33473076 130.22773777 -214.34945297 129.23765755 C-214.34410282 124.32980303 -214.22846854 120.97194917 -211 117 C-204.8336837 111.75994034 -197.05597106 108.13513695 -190 104.25 C-182.81107379 100.25824176 -175.63363437 96.26001356 -168.5625 92.0625 C-161.59230165 87.92682031 -154.58498988 83.85878933 -147.5625 79.8125 C-146.45527588 79.17449463 -145.34805176 78.53648926 -144.20727539 77.87915039 C-141.93662932 76.57110523 -139.66587642 75.26324552 -137.39501953 73.95556641 C-131.9283002 70.80667946 -126.46425113 67.65316736 -121 64.5 C-118.83334689 63.2499765 -116.66668021 61.99997653 -114.5 60.75 C-113.4275 60.13125 -112.355 59.5125 -111.25 58.875 C-99.33333333 52 -87.41666667 45.125 -75.5 38.25 C-74.42709717 37.6310083 -73.35419434 37.0120166 -72.2487793 36.37426758 C-70.08621417 35.1266526 -67.92361661 33.87909384 -65.76098633 32.6315918 C-59.17006479 28.82953801 -52.58006228 25.02590263 -45.99194336 21.21899414 C-43.80808573 19.95902042 -41.62272525 18.70164755 -39.43579102 17.44702148 C-34.26378481 14.4782355 -29.11683661 11.47971078 -24.015625 8.390625 C-23.07243408 7.82819092 -22.12924316 7.26575684 -21.1574707 6.6862793 C-19.40681785 5.64116736 -17.66489622 4.58121449 -15.93432617 3.50317383 C-10.61233879 0.35460931 -6.18072384 -1.49542697 0 0 Z " fill="#010101" transform="translate(259,0)"/>
<path d="M0 0 C2.46098631 1.31369376 4.81481019 2.66752323 7.1875 4.125 C8.70098225 5.0352534 10.21536679 5.94400764 11.73046875 6.8515625 C12.98029541 7.60228027 12.98029541 7.60228027 14.25537109 8.36816406 C19.47057338 11.46889455 24.73935716 14.47724929 30 17.5 C37.89063161 22.04333016 45.76801923 26.6062401 53.60961914 31.23364258 C69.11229758 40.38065229 84.68583075 49.40549981 100.2824707 58.39111328 C110.54858681 64.30889386 120.78425592 70.27806313 131.01464844 76.25732422 C134.05207975 78.03040115 137.09207948 79.79899828 140.1328125 81.56640625 C145.12138295 84.46669181 150.10509519 87.3751178 155.08398438 90.29199219 C157.05306348 91.44534763 159.02314138 92.59699932 160.99414062 93.74707031 C163.83406536 95.40697352 166.66782992 97.07690853 169.5 98.75 C170.36141602 99.25160645 171.22283203 99.75321289 172.11035156 100.27001953 C172.88862305 100.73263184 173.66689453 101.19524414 174.46875 101.671875 C175.15388672 102.0750293 175.83902344 102.47818359 176.54492188 102.89355469 C177.02509766 103.25868164 177.50527344 103.62380859 178 104 C178 104.66 178 105.32 178 106 C177.27111572 106.40202637 176.54223145 106.80405273 175.79125977 107.21826172 C158.03313177 117.00064103 158.03313177 117.00064103 140.48876953 127.15869141 C134.17146343 130.91364807 127.80686138 134.58414373 121.4375 138.25 C112.98325042 143.11759824 104.54473374 148.01045387 96.125 152.9375 C86.85444994 158.35973762 77.54063142 163.70324102 68.20953369 169.02023315 C59.14761065 174.18501246 50.12425158 179.41248528 41.12426758 184.68457031 C31.78953487 190.14369762 22.39891053 195.50347648 12.99804688 200.84765625 C11.86818359 201.49089844 10.73832031 202.13414062 9.57421875 202.796875 C8.06734497 203.65297363 8.06734497 203.65297363 6.5300293 204.52636719 C4.6490112 205.621979 2.81123309 206.79251127 1 208 C-2.71979658 207.65535673 -5.46351958 206.39422827 -8.67578125 204.55078125 C-9.57353271 204.03974854 -10.47128418 203.52871582 -11.39624023 203.00219727 C-12.35860596 202.44459717 -13.32097168 201.88699707 -14.3125 201.3125 C-15.32578369 200.73234131 -16.33906738 200.15218262 -17.38305664 199.55444336 C-20.59392936 197.71185571 -23.79794947 195.85787163 -27 194 C-28.50288574 193.12891602 -28.50288574 193.12891602 -30.03613281 192.24023438 C-36.03003486 188.76168327 -42.01332953 185.26521928 -47.99267578 181.76171875 C-52.95069751 178.85726309 -57.91238105 175.95909225 -62.875 173.0625 C-63.85976318 172.48765869 -64.84452637 171.91281738 -65.85913086 171.32055664 C-73.2263907 167.02433377 -80.61025028 162.75740115 -88 158.5 C-101.35009178 150.80871162 -114.65733042 143.0451709 -127.95898438 135.27050781 C-130.93065504 133.53393165 -133.90270372 131.79800513 -136.875 130.0625 C-137.84840332 129.49402344 -138.82180664 128.92554688 -139.82470703 128.33984375 C-145.21034327 125.19829615 -150.60397799 122.07107373 -156.0078125 118.9609375 C-156.59319794 118.62390305 -157.17858337 118.28686859 -157.78170776 117.93962097 C-160.61085721 116.31112885 -163.44109507 114.6845761 -166.27294922 113.06079102 C-171.92170263 109.81318015 -177.50136405 106.49612791 -183 103 C-179.58501433 99.10973282 -175.74967408 97.01780162 -171.25 94.625 C-163.92538522 90.64295542 -156.69139093 86.53035742 -149.5 82.3125 C-141.05758857 77.36785184 -132.60196113 72.44771204 -124.125 67.5625 C-123.04541016 66.94028564 -121.96582031 66.31807129 -120.85351562 65.67700195 C-118.6631748 64.41488483 -116.47274498 63.15292215 -114.28222656 61.89111328 C-108.85340058 58.76319852 -103.42680719 55.63141552 -98 52.5 C-95.83334417 51.24998121 -93.6666775 49.99998122 -91.5 48.75 C-90.4275 48.13125 -89.355 47.5125 -88.25 46.875 C-76.33333333 40 -64.41666667 33.125 -52.5 26.25 C-51.42556641 25.63012207 -50.35113281 25.01024414 -49.24414062 24.37158203 C-47.09704864 23.13289998 -44.94991386 21.8942921 -42.80273438 20.65576172 C-37.70411191 17.7146665 -32.60594704 14.77278587 -27.50927734 11.82830811 C-25.08952335 10.43041399 -22.66952737 9.03293911 -20.24951172 7.63549805 C-18.53198948 6.64347676 -16.81481948 5.65084571 -15.09765625 4.65820312 C-13.54884766 3.76391602 -13.54884766 3.76391602 -11.96875 2.8515625 C-10.59879883 2.05999756 -10.59879883 2.05999756 -9.20117188 1.25244141 C-5.4584453 -0.87712684 -4.21575707 -1.22449375 0 0 Z " fill="#F6B42B" transform="translate(258,22)"/>
<path d="M0 0 C3.44551973 36.92006914 3.44551973 36.92006914 -1.74023438 46.07080078 C-6.5376371 50.67092128 -12.51513819 52.68304576 -18.72363281 54.77246094 C-24.46095218 56.92203186 -29.52537928 60.21158434 -34.75 63.375 C-36.94991482 64.64878953 -39.15307191 65.91699528 -41.359375 67.1796875 C-48.9827446 71.56435604 -56.60005215 75.95950024 -64.21606445 80.35693359 C-69.22692991 83.24943681 -74.23931125 86.13917161 -79.25863647 89.01696777 C-81.01728749 90.02548314 -82.77533209 91.0350477 -84.53320312 92.04492188 C-86.72472231 93.30350518 -88.91734504 94.56016987 -91.11132812 95.81445312 C-103.00262454 101.45248885 -103.00262454 101.45248885 -112 110 C-112.12355235 112.85836493 -112.188432 115.69137464 -112.203125 118.55078125 C-112.20882507 119.40173874 -112.21452515 120.25269623 -112.22039795 121.12944031 C-112.22985298 122.93255366 -112.23638392 124.73568433 -112.24023438 126.53881836 C-112.24992487 129.29116198 -112.28093675 132.04275408 -112.3125 134.79492188 C-112.31903163 136.54687057 -112.32428147 138.2988246 -112.328125 140.05078125 C-112.3466452 141.28227654 -112.3466452 141.28227654 -112.36553955 142.53865051 C-112.34753929 147.18087484 -112.01932262 150.23044095 -109 154 C-105.48847264 155.75576368 -101.74186706 154.79256688 -98 154 C-95.36710489 152.92561445 -93.06925568 151.48192687 -90.6875 149.9375 C-89.20476948 149.02207064 -87.72025757 148.10952293 -86.234375 147.19921875 C-85.41259766 146.69181152 -84.59082031 146.1844043 -83.74414062 145.66162109 C-78.9666776 142.76879072 -74.10065391 140.02981088 -69.24301147 137.2746582 C-59.75219319 131.88845881 -50.29466932 126.44731075 -40.875 120.9375 C-32.760203 116.19125149 -24.63659314 111.46093598 -16.49615479 106.75881958 C-14.78847502 105.77222847 -13.08148527 104.78444334 -11.37451172 103.79663086 C-10.3382666 103.19858643 -9.30202148 102.60054199 -8.234375 101.984375 C-6.86104004 101.19111816 -6.86104004 101.19111816 -5.45996094 100.38183594 C-3.3408619 99.19147264 -1.1739449 98.08697245 1 97 C1 143.86 1 190.72 1 239 C-12.86 246.92 -12.86 246.92 -27 255 C-36.01095762 260.2485178 -36.01095762 260.2485178 -45.015625 265.5078125 C-54.55822933 271.08429156 -64.14057793 276.59211491 -73.71777344 282.10888672 C-79.14659942 285.23680148 -84.57319281 288.36858448 -90 291.5 C-92.16665583 292.75001879 -94.3333225 294.00001878 -96.5 295.25 C-97.5725 295.86875 -98.645 296.4875 -99.75 297.125 C-109.5 302.75 -109.5 302.75 -112.75097656 304.62548828 C-114.91447476 305.87371034 -117.07788643 307.12208239 -119.24121094 308.37060547 C-124.70565017 311.52405256 -130.17163645 314.67476096 -135.640625 317.8203125 C-137.84383665 319.08839113 -140.04696237 320.35661906 -142.25 321.625 C-143.31541016 322.23802979 -144.38082031 322.85105957 -145.47851562 323.48266602 C-150.82399409 326.565307 -156.15179959 329.67398363 -161.453125 332.83203125 C-162.47245117 333.43901855 -163.49177734 334.04600586 -164.54199219 334.67138672 C-166.47219544 335.82383722 -168.40004851 336.98023579 -170.32519531 338.14111328 C-171.60281738 338.90464111 -171.60281738 338.90464111 -172.90625 339.68359375 C-173.65197266 340.13275146 -174.39769531 340.58190918 -175.16601562 341.04467773 C-177 342 -177 342 -179 342 C-179.42296323 336.06014171 -179.72972652 330.12914157 -179.93383789 324.17773438 C-180.01892348 322.15892941 -180.13466212 320.14116034 -180.2824707 318.12597656 C-181.4418257 301.90302985 -181.4418257 301.90302985 -177.46084595 297.1701355 C-173.43435678 293.9187274 -168.89824563 291.86817393 -164.1378479 289.9095459 C-161.26390037 288.68682693 -158.660932 287.12315757 -156.00390625 285.48828125 C-154.19040182 284.42917766 -152.37659703 283.37058822 -150.5625 282.3125 C-149.56009277 281.72782959 -148.55768555 281.14315918 -147.52490234 280.54077148 C-134.57490247 272.99512594 -121.58475295 265.51903577 -108.59619141 258.04003906 C-103.05844085 254.85099042 -97.52267177 251.65866681 -91.9921875 248.45703125 C-88.23916228 246.28539058 -84.47528719 244.1360674 -80.6953125 242.01171875 C-79.15102715 241.13283801 -77.60675523 240.25393367 -76.0625 239.375 C-75.37663818 238.99754639 -74.69077637 238.62009277 -73.98413086 238.23120117 C-70.01626499 235.95379919 -67.90906606 234.15172143 -66 230 C-65.68874056 227.05244545 -65.53200151 224.32151003 -65.53125 221.375 C-65.52363647 220.5504834 -65.51602295 219.7259668 -65.50817871 218.87646484 C-65.49740408 217.13837707 -65.49451387 215.40022469 -65.49902344 213.66210938 C-65.49999706 211.00801562 -65.45832325 208.35680265 -65.4140625 205.703125 C-65.40885591 204.01042267 -65.4061673 202.31771033 -65.40625 200.625 C-65.38985474 199.83528809 -65.37345947 199.04557617 -65.35656738 198.23193359 C-65.40898814 194.03918073 -65.66065996 192.43905116 -68.31396484 189.00610352 C-71.18463695 186.86210127 -73.06318517 186.17351317 -76.66113281 186.42138672 C-81.88282432 187.71318305 -86.3321512 190.77782105 -90.875 193.5625 C-92.02233513 194.24794234 -93.17079697 194.93150185 -94.3203125 195.61328125 C-96.70461527 197.02938635 -99.08389494 198.45342181 -101.45996094 199.88330078 C-106.92895829 203.16525973 -112.4679437 206.32595903 -118 209.5 C-120.16049018 210.74551468 -122.32064533 211.9916107 -124.48046875 213.23828125 C-125.55216309 213.85654785 -126.62385742 214.47481445 -127.72802734 215.11181641 C-131.044382 217.02561188 -134.36014721 218.94042512 -137.67578125 220.85546875 C-144.11498147 224.57414578 -150.55655968 228.28867509 -157 232 C-158.56524414 232.90202148 -158.56524414 232.90202148 -160.16210938 233.82226562 C-163.12748598 235.52982987 -166.09465299 237.23423393 -169.0625 238.9375 C-169.95557861 239.45207764 -170.84865723 239.96665527 -171.76879883 240.49682617 C-172.57857178 240.96064697 -173.38834473 241.42446777 -174.22265625 241.90234375 C-175.28625366 242.51323853 -175.28625366 242.51323853 -176.37133789 243.13647461 C-178 244 -178 244 -179 244 C-179 197.14 -179 150.28 -179 102 C-169.1 96.555 -169.1 96.555 -159 91 C-152.84378336 87.40437918 -152.84378336 87.40437918 -146.70703125 83.77734375 C-141.0191213 80.4091603 -135.29022431 77.11236952 -129.5625 73.8125 C-128.45712891 73.17546143 -127.35175781 72.53842285 -126.21289062 71.88208008 C-122.80889695 69.9208598 -119.40449228 67.96035461 -116 66 C-111.62449212 63.48004706 -107.24943866 60.95930859 -102.875 58.4375 C-101.79661865 57.81584961 -100.7182373 57.19419922 -99.60717773 56.55371094 C-92.43241148 52.41377966 -85.27501075 48.24500712 -78.125 44.0625 C-69.48718013 39.0116199 -60.81681248 34.01974096 -52.125 29.0625 C-42.69740794 23.68549484 -33.27781998 18.29523456 -23.875 12.875 C-22.82715332 12.27179932 -21.77930664 11.66859863 -20.69970703 11.04711914 C-15.07086374 7.79949953 -9.48802808 4.49641168 -3.96533203 1.07080078 C-2 0 -2 0 0 0 Z " fill="#FDFDFD" transform="translate(446,144)"/>
<path d="M0 0 C1.72389692 0.9384665 3.447566 1.87735154 5.17114258 2.81640625 C6.61098259 3.60059937 6.61098259 3.60059937 8.07991028 4.40063477 C12.63686437 6.89652861 17.16473862 9.44278813 21.6875 12 C23.16682007 12.83640015 23.16682007 12.83640015 24.67602539 13.68969727 C34.83149552 19.44753987 44.91168602 25.33196481 54.98388672 31.23388672 C59.98538616 34.1625614 64.99295476 37.08082046 70 40 C75.97782079 43.486131 81.95505999 46.97324228 87.9296875 50.46484375 C99.36219469 57.14383479 110.81535395 63.78547374 122.28857422 70.39428711 C130.51292381 75.13448084 138.71602799 79.91011083 146.91040039 84.7019043 C152.3456479 87.87739717 157.78984639 91.0365544 163.24609375 94.17578125 C163.84853912 94.52252899 164.4509845 94.86927673 165.07168579 95.22653198 C168.00938927 96.91696396 170.94825226 98.60530817 173.88867188 100.29101562 C175.4577832 101.19303711 175.4577832 101.19303711 177.05859375 102.11328125 C178.45549438 102.91439331 178.45549438 102.91439331 179.88061523 103.73168945 C182 105 182 105 183 106 C183.09643778 107.82227687 183.12187371 109.6483336 183.12025452 111.47315979 C183.12231651 113.25481537 183.12231651 113.25481537 183.12442017 115.07246399 C183.12082489 116.38732285 183.11722961 117.7021817 183.11352539 119.05688477 C183.11324352 120.44617714 183.11340125 121.83546967 183.1139679 123.22476196 C183.11425588 127.00765289 183.10835901 130.79051238 183.10139394 134.57339597 C183.09516055 138.52255677 183.09455661 142.47171822 183.09336853 146.42088318 C183.09025517 153.90425075 183.08204172 161.38760379 183.07201904 168.87096494 C183.06085805 177.38835733 183.05534749 185.9057504 183.05032361 194.42314827 C183.03985911 211.94877394 183.02225958 229.47438543 183 247 C181.11527121 246.06765245 179.23171293 245.13293856 177.34863281 244.19726562 C176.29959778 243.67700806 175.25056274 243.15675049 174.16973877 242.62072754 C169.24930903 240.10484956 164.50373639 237.31488185 159.75 234.5 C157.64068487 233.26031479 155.53130812 232.02073442 153.421875 230.78125 C152.35646484 230.15347656 151.29105469 229.52570313 150.19335938 228.87890625 C145.13766509 225.90424086 140.06848383 222.95280165 135 220 C132.99731305 218.8321732 130.99470902 217.6642042 128.9921875 216.49609375 C128.00186523 215.91843262 127.01154297 215.34077148 125.99121094 214.74560547 C123.01693706 213.0098841 120.04351578 211.27271075 117.0703125 209.53515625 C105.63780531 202.85616521 94.18464605 196.21452626 82.71142578 189.60571289 C74.47172552 184.85667163 66.25386578 180.07119041 58.04345703 175.27172852 C50.6702595 170.96514664 43.27570261 166.69660626 35.875 162.4375 C27.3718378 157.54040426 18.88930312 152.61027041 10.4375 147.625 C9.49696777 147.07126709 8.55643555 146.51753418 7.58740234 145.94702148 C6.73227051 145.44114502 5.87713867 144.93526855 4.99609375 144.4140625 C4.24513428 143.9701416 3.4941748 143.5262207 2.72045898 143.06884766 C1 142 1 142 0 141 C-0.09643778 139.17772313 -0.12187371 137.3516664 -0.12025452 135.52684021 C-0.12231651 133.74518463 -0.12231651 133.74518463 -0.12442017 131.92753601 C-0.12082489 130.61267715 -0.11722961 129.2978183 -0.11352539 127.94311523 C-0.11324352 126.55382286 -0.11340125 125.16453033 -0.1139679 123.77523804 C-0.11425588 119.99234711 -0.10835901 116.20948762 -0.10139394 112.42660403 C-0.09516055 108.47744323 -0.09455661 104.52828178 -0.09336853 100.57911682 C-0.09025517 93.09574925 -0.08204172 85.61239621 -0.07201904 78.12903506 C-0.06085805 69.61164267 -0.05534749 61.0942496 -0.05032361 52.57685173 C-0.03985911 35.05122606 -0.02225958 17.52561457 0 0 Z " fill="#2BC4DE" transform="translate(65,141)"/>
<path d="M0 0 C4.20818624 1.27429357 7.75039092 2.85759814 11.5078125 5.1328125 C12.56226562 5.76574219 13.61671875 6.39867187 14.703125 7.05078125 C15.5374707 7.55665771 15.5374707 7.55665771 16.38867188 8.07275391 C19.39972337 9.8975053 22.42279035 11.70214608 25.4453125 13.5078125 C26.07044739 13.88174133 26.69558228 14.25567017 27.33966064 14.64093018 C33.84085415 18.52017269 40.41532571 22.26445472 47 26 C56.22477683 31.23842534 65.38696139 36.56838758 74.5 42 C83.6775781 47.46894535 92.90249783 52.84149347 102.1875 58.125 C113.84865042 64.76101208 125.45530558 71.48526252 137.03369141 78.26464844 C141.13708688 80.66521922 145.24475419 83.05843546 149.35229492 85.4519043 C154.23649488 88.29847648 159.11853131 91.14874722 164 94 C165.32837891 94.77561279 165.32837891 94.77561279 166.68359375 95.56689453 C169.10262227 96.98029571 171.52032993 98.3959235 173.9375 99.8125 C174.64769287 100.22725586 175.35788574 100.64201172 176.08959961 101.06933594 C180.88458503 103.88458503 180.88458503 103.88458503 182 105 C182.09268999 106.35094982 182.11747326 107.70667091 182.11352539 109.06079102 C182.11344986 109.92160782 182.11337433 110.78242462 182.11329651 111.66932678 C182.10813522 112.60473801 182.10297394 113.54014923 182.09765625 114.50390625 C182.09553383 115.93342873 182.09553383 115.93342873 182.09336853 117.39183044 C182.08775152 120.44875165 182.07519616 123.50560077 182.0625 126.5625 C182.05748719 128.62955624 182.05292391 130.69661362 182.04882812 132.76367188 C182.03777656 137.84247588 182.02050055 142.9212257 182 148 C173.87255762 143.61197782 165.82735167 139.08991099 157.8125 134.5 C157.2070636 134.15373566 156.6016272 133.80747131 155.97784424 133.45071411 C146.60389458 128.08877329 137.26170868 122.67419485 127.94067383 117.22070312 C120.6432037 112.95231454 113.32601254 108.71919227 106 104.5 C92.6497785 96.80893898 79.34266785 89.04516989 66.04101562 81.27050781 C50.55631983 72.21798477 50.55631983 72.21798477 35.02441406 63.24682617 C32.80977812 61.96305674 30.60699809 60.65860115 28.41699219 59.33325195 C22.58643359 55.84014958 17.26600504 53.10985278 10.6315918 51.52124023 C6.25152954 49.50131426 2.91199504 46.86214512 0 43 C-1.11680834 39.56662911 -1.17918624 36.34563455 -1.16015625 32.75390625 C-1.18346512 31.7981218 -1.20677399 30.84233734 -1.23078918 29.85758972 C-1.39157763 19.88701989 -0.79395721 9.93442973 0 0 Z " fill="#2BC3DE" transform="translate(66,338)"/>
<path d="M0 0 C2.90203679 1.3399032 5.64438896 2.82850414 8.41552734 4.42211914 C9.52951904 5.06068848 10.64351074 5.69925781 11.79125977 6.35717773 C12.99549875 7.05190483 14.19968025 7.74673155 15.40380859 8.44165039 C16.65406891 9.16016724 17.90447806 9.87842516 19.1550293 10.59643555 C22.37969766 12.44902778 25.60201385 14.30567162 28.82373047 16.16339111 C31.7969891 17.87698454 34.77243748 19.58676143 37.74755859 21.29711914 C48.31245952 27.3760596 58.85547706 33.48937171 69.35302734 39.68383789 C83.09376341 47.78776021 96.89407551 55.79023096 110.71630859 63.75415039 C119.18384318 68.63423894 127.64492267 73.52503639 136.09130859 78.44165039 C137.07228516 79.01028809 138.05326172 79.57892578 139.06396484 80.16479492 C143.88451595 82.97007892 148.66064175 85.82492089 153.38037109 88.79711914 C154.73122803 89.63883667 154.73122803 89.63883667 156.109375 90.49755859 C157.79060909 91.5497863 159.46298841 92.61636238 161.12402344 93.70019531 C165.06328992 96.1558036 168.62715244 98.21269313 173.44726562 97.85913086 C178.94775895 96.39256937 183.77951419 93.23772753 188.65380859 90.37915039 C189.872318 89.68111948 191.09164632 88.98451627 192.31176758 88.28930664 C195.79277349 86.29916546 199.25571775 84.27957981 202.71630859 82.25415039 C203.53905273 81.77558594 204.36179687 81.29702148 205.20947266 80.80395508 C208.5474619 78.86149215 211.87427734 76.90141751 215.19287109 74.92602539 C222.2375515 70.74437116 229.35513882 66.68620374 236.45874023 62.60571289 C237.51182373 61.99985352 238.56490723 61.39399414 239.64990234 60.76977539 C240.67196777 60.18518555 241.6940332 59.6005957 242.74707031 58.99829102 C244.70444705 57.84852129 246.63969709 56.66010007 248.54882812 55.43188477 C249.42007324 54.87307617 250.29131836 54.31426758 251.18896484 53.73852539 C252.32410522 52.98394043 252.32410522 52.98394043 253.48217773 52.21411133 C256.33752165 50.98722768 257.78646765 51.34180731 260.71630859 52.25415039 C263.52880859 53.69165039 263.52880859 53.69165039 265.71630859 55.25415039 C265.71630859 55.91415039 265.71630859 56.57415039 265.71630859 57.25415039 C263.92578125 58.52832031 263.92578125 58.52832031 261.38037109 59.98461914 C259.95772949 60.80615479 259.95772949 60.80615479 258.50634766 61.64428711 C257.46188477 62.23741699 256.41742188 62.83054687 255.34130859 63.44165039 C254.26075195 64.06313965 253.18019531 64.68462891 252.06689453 65.32495117 C249.77298274 66.64373567 247.47778235 67.95991582 245.18017578 69.2722168 C241.88713019 71.15641077 238.60108573 73.05210691 235.31787109 74.95336914 C220.60052975 83.47405452 205.85843125 91.9558031 191.05810547 100.33178711 C188.66753612 101.70695829 186.30623838 103.10445337 183.95263672 104.53979492 C183.32605164 104.91523941 182.69946655 105.2906839 182.05389404 105.67750549 C180.29726559 106.73136396 178.549002 107.79912892 176.80126953 108.86767578 C173.33567834 110.42521712 172.22274346 110.5495392 168.71630859 109.25415039 C166.14282227 107.98583984 166.14282227 107.98583984 163.38427734 106.36743164 C162.35093262 105.76600342 161.31758789 105.1645752 160.25292969 104.54492188 C159.14771973 103.89209229 158.04250977 103.2392627 156.90380859 102.56665039 C155.73834136 101.88508233 154.57248216 101.20418414 153.40625 100.52392578 C151.00816902 99.12366884 148.6124686 97.71946867 146.21875 96.31176758 C142.98714642 94.41173774 139.74931239 92.52258702 136.50927734 90.63696289 C129.58699879 86.6080093 122.67218964 82.56631717 115.75732422 78.5246582 C104.42777968 71.90393228 93.08654257 65.30479812 81.71630859 58.75415039 C68.36621681 51.06286201 55.05897817 43.29932129 41.75732422 35.5246582 C38.78565363 33.78808208 35.81352499 32.05229214 32.84130859 30.31665039 C31.87008057 29.74889893 30.89885254 29.18114746 29.89819336 28.59619141 C24.48003944 25.43334128 19.04929904 22.29400864 13.60302734 19.17993164 C12.41077746 18.49695963 11.21855717 17.81393595 10.02636719 17.13085938 C7.74675606 15.82484778 5.46420393 14.52451889 3.1796875 13.22705078 C2.14634277 12.63529053 1.11299805 12.04353027 0.04833984 11.43383789 C-1.31713989 10.6562915 -1.31713989 10.6562915 -2.71020508 9.86303711 C-5.41252494 8.17360652 -7.83477804 6.28999071 -10.28369141 4.25415039 C-9.07053862 3.3570796 -7.83729234 2.48713884 -6.59619141 1.62915039 C-5.56945312 0.89825195 -5.56945312 0.89825195 -4.52197266 0.15258789 C-2.28369141 -0.74584961 -2.28369141 -0.74584961 0 0 Z " fill="#F0AF2A" transform="translate(85.28369140625,315.745849609375)"/>
<path d="M0 0 C2.70007929 1.06582077 5.01069786 2.24871276 7.375 3.9375 C7.375 4.5975 7.375 5.2575 7.375 5.9375 C6.2912207 6.55455811 6.2912207 6.55455811 5.18554688 7.18408203 C-7.44952113 14.38160103 -20.07664824 21.58946244 -32.625 28.9375 C-41.67989957 34.23774128 -50.7670015 39.47923109 -59.875 44.6875 C-60.79394043 45.2136792 -60.79394043 45.2136792 -61.73144531 45.75048828 C-63.47129173 46.74636471 -65.21218747 47.74040723 -66.953125 48.734375 C-67.9524707 49.30510742 -68.95181641 49.87583984 -69.98144531 50.46386719 C-72.17180573 51.68486972 -74.37022142 52.84155718 -76.625 53.9375 C-77.62507326 49.97424672 -77.80504129 46.87955932 -76.625 42.9375 C-72.92874099 39.57455904 -68.651535 37.53722977 -64.21435547 35.28808594 C-59.14597719 32.64446265 -54.24884277 29.69273877 -49.3125 26.8125 C-47.07127477 25.52046478 -44.82906846 24.23013006 -42.5859375 22.94140625 C-37.85978605 20.22383573 -33.13564358 17.50284669 -28.4140625 14.77734375 C-27.82613419 14.43797791 -27.23820587 14.09861206 -26.63246155 13.7489624 C-24.90078617 12.74934557 -23.16914281 11.74967325 -21.4375 10.75 C-18.36317512 8.97535428 -15.28881789 7.20084565 -12.2109375 5.43237305 C-10.6107699 4.50735169 -9.01584821 3.57310638 -7.4296875 2.62426758 C-2.89716313 -0.06898007 -2.89716313 -0.06898007 0 0 Z " fill="#F0B02A" transform="translate(428.625,220.0625)"/>
</svg>
</file>

<file path="src/services/aiService.ts">
import { supabase } from './supabaseClient';
import { Priority } from '../types';

interface GenerateSubtasksResponse {
  subtasks?: unknown;
  error?: string;
}

interface SuggestPriorityResponse {
  priority?: unknown;
  error?: string;
}

const functionError = (fallback: string, error?: string): Error =>
  new Error(error || fallback);

export const generateSubtasks = async (
  title: string,
  description: string,
): Promise<string[]> => {
  const { data, error } = await supabase.functions.invoke<GenerateSubtasksResponse>(
    'generate-subtasks',
    { body: { title, description } },
  );

  if (error) throw functionError('Unable to generate subtasks', error.message);
  if (data?.error) throw functionError('Unable to generate subtasks', data.error);
  if (!Array.isArray(data?.subtasks) || !data.subtasks.every((item) => typeof item === 'string')) {
    throw functionError('AI returned an invalid subtask list');
  }

  return data.subtasks;
};

export const suggestPriority = async (
  title: string,
  description: string,
): Promise<Priority> => {
  const { data, error } = await supabase.functions.invoke<SuggestPriorityResponse>(
    'suggest-priority',
    { body: { title, description } },
  );

  if (error) throw functionError('Unable to suggest priority', error.message);
  if (data?.error) throw functionError('Unable to suggest priority', data.error);
  if (!Object.values(Priority).includes(data?.priority as Priority)) {
    throw functionError('AI returned an invalid priority');
  }

  return data.priority as Priority;
};
</file>

<file path="supabase/.temp/cli-latest">
v2.121.0
</file>

<file path="supabase/.temp/gotrue-version">
v2.197.0
</file>

<file path="supabase/.temp/linked-project.json">
{"ref":"lagporbmyjbbfrykxxlz","name":"FastBoard","organization_id":"diwvivqajrhkhcczvhjt","organization_slug":"diwvivqajrhkhcczvhjt"}
</file>

<file path="supabase/.temp/pooler-url">
postgresql://postgres.lagporbmyjbbfrykxxlz@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
</file>

<file path="supabase/.temp/postgres-version">
17.11.0.003
</file>

<file path="supabase/.temp/project-ref">
lagporbmyjbbfrykxxlz
</file>

<file path="supabase/.temp/rest-version">
v14.18
</file>

<file path="supabase/.temp/storage-migration">
revoke-grants-to-unused-operations
</file>

<file path="supabase/.temp/storage-version">
v1.80.2
</file>

<file path="supabase/functions/_shared/groq.ts">
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-20b';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

export const assertAuthenticated = (request: Request): void => {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authentication required');
  }
};

export const readRequiredText = (
  value: unknown,
  fieldName: string,
  maxLength: number,
): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  return value.trim().slice(0, maxLength);
};

export const callGroq = async (prompt: string): Promise<string> => {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  if (!apiKey) {
    throw new HttpError(500, 'AI service is not configured');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    console.error('Groq request failed', response.status, await response.text());
    throw new HttpError(502, 'AI provider request failed');
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new HttpError(502, 'AI provider returned an empty response');
  }

  return content.trim();
};

export const handleFunctionError = (error: unknown): Response => {
  if (error instanceof HttpError) {
    return jsonResponse({ error: error.message }, error.status);
  }

  console.error('Unexpected AI function error', error);
  return jsonResponse({ error: 'Unexpected AI service error' }, 500);
};
</file>

<file path="supabase/functions/generate-subtasks/index.ts">
import {
  assertAuthenticated,
  callGroq,
  corsHeaders,
  handleFunctionError,
  HttpError,
  jsonResponse,
  readRequiredText,
} from '../_shared/groq.ts';

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (request.method !== 'POST') {
      throw new HttpError(405, 'Method not allowed');
    }

    assertAuthenticated(request);
    const body = await request.json();
    const title = readRequiredText(body?.title, 'title', 300);
    const description = typeof body?.description === 'string'
      ? body.description.trim().slice(0, 4_000)
      : '';

    const text = await callGroq(`
Break down this software task into 3 to 5 concise, actionable subtasks.
Return only a raw JSON array of strings. Do not use markdown.

Task title: ${title}
Task description: ${description || '(not provided)'}
`);

    const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new HttpError(502, 'AI provider returned an invalid subtask list');
    }

    const subtasks = parsed
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5);

    if (subtasks.length === 0) {
      throw new HttpError(502, 'AI provider returned no valid subtasks');
    }

    return jsonResponse({ subtasks });
  } catch (error) {
    return handleFunctionError(error);
  }
});
</file>

<file path="supabase/functions/suggest-priority/index.ts">
import {
  assertAuthenticated,
  callGroq,
  corsHeaders,
  handleFunctionError,
  HttpError,
  jsonResponse,
  readRequiredText,
} from '../_shared/groq.ts';

const priorities = ['LOW', 'MEDIUM', 'HIGH'] as const;

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (request.method !== 'POST') {
      throw new HttpError(405, 'Method not allowed');
    }

    assertAuthenticated(request);
    const body = await request.json();
    const title = readRequiredText(body?.title, 'title', 300);
    const description = typeof body?.description === 'string'
      ? body.description.trim().slice(0, 4_000)
      : '';

    const text = await callGroq(`
Analyze this software task and suggest its priority.
Return only one word: LOW, MEDIUM, or HIGH.
Use HIGH for urgent, blocking, security, or production-critical work.
Use LOW for cosmetic or non-urgent work. Otherwise use MEDIUM.

Task title: ${title}
Task description: ${description || '(not provided)'}
`);

    const candidate = text.trim().toUpperCase();
    const priority = priorities.find((value) => candidate.includes(value)) ?? 'MEDIUM';
    return jsonResponse({ priority });
  } catch (error) {
    return handleFunctionError(error);
  }
});
</file>

<file path="supabase/functions/deno.d.ts">
declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(
    handler: (request: Request) => Response | Promise<Response>,
  ): void;
};
</file>

<file path="PROJECT_REPORT_INFO.md">
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
</file>

<file path="SETUP.md">
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
</file>

<file path="scripts/seed-auth-users.mjs">
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    const value = trimmed.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing required env for seed:auth:');
  if (!url) console.error('  - SUPABASE_URL');
  if (!serviceKey) {
    console.error('  - SUPABASE_SERVICE_ROLE_KEY  (KHÔNG phải ANON_KEY)');
    console.error('    Lấy tại: Supabase Dashboard → Project Settings → API → service_role (secret)');
    console.error('    Thêm vào .env rồi chạy lại: npm run seed:auth');
  }
  console.error('');
  console.error('Gợi ý: nếu đã chạy thành công src/supabase_schema.sql (có seed auth.users),');
  console.error('bạn KHÔNG cần seed:auth — đăng nhập luôn bằng TAI_KHOAN.md.');
  process.exit(1);
}

const DEMO_USERS = [
  {
    id: 'a1111111-1111-4111-8111-111111111111',
    email: 'admin@fastboard.com',
    password: 'admin123',
    name: 'Nguyễn Văn Admin',
    role: 'ADMIN',
    job_role: 'Product Owner',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
  {
    id: 'a2222222-2222-4222-8222-222222222222',
    email: 'sarah@fastboard.com',
    password: 'user123',
    name: 'Sarah Miller',
    role: 'MEMBER',
    job_role: 'UI Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: 'a3333333-3333-4333-8333-333333333333',
    email: 'mike@fastboard.com',
    password: 'user123',
    name: 'Mike Ross',
    role: 'MEMBER',
    job_role: 'Backend Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
  },
  {
    id: 'a4444444-4444-4444-8444-444444444444',
    email: 'emily@fastboard.com',
    password: 'user123',
    name: 'Emily Wong',
    role: 'MEMBER',
    job_role: 'QA Engineer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  },
  {
    id: 'a5555555-5555-4555-8555-555555555555',
    email: 'lan@fastboard.com',
    password: 'user123',
    name: 'Trần Thị Lan',
    role: 'MEMBER',
    job_role: 'Frontend Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan',
  },
];

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsertUser(demo) {
  const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = listed?.users?.find(
    (u) => u.id === demo.id || u.email?.toLowerCase() === demo.email.toLowerCase()
  );

  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      email: demo.email,
      password: demo.password,
      email_confirm: true,
      user_metadata: {
        name: demo.name,
        role: demo.role,
        job_role: demo.job_role,
        avatar: demo.avatar,
      },
    });
    if (error) throw error;
    console.log(`Updated auth user ${demo.email} (id=${existing.id})`);
    if (existing.id !== demo.id) {
      console.warn(
        `  WARNING: existing id ${existing.id} != expected ${demo.id}. Re-create Auth users or remap seed.`
      );
    }
    return;
  }

  const { error } = await admin.auth.admin.createUser({
    id: demo.id,
    email: demo.email,
    password: demo.password,
    email_confirm: true,
    user_metadata: {
      name: demo.name,
      role: demo.role,
      job_role: demo.job_role,
      avatar: demo.avatar,
    },
  });
  if (error) throw error;
  console.log(`Created auth user ${demo.email} (${demo.id})`);
}

async function syncPublicProfileEmails() {
  for (const demo of DEMO_USERS) {
    const { error } = await admin
      .from('users')
      .update({ email: demo.email })
      .eq('id', demo.id);

    if (!error) continue;
    if (error.code === '42P01' || error.code === 'PGRST205') {
      console.log('Skipped public.users email sync because the schema has not been created yet.');
      return;
    }
    throw error;
  }
}

async function main() {
  for (const demo of DEMO_USERS) {
    await upsertUser(demo);
  }
  await syncPublicProfileEmails();
  console.log('Done. Next: run src/supabase_schema.sql in Supabase SQL Editor.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
</file>

<file path="src/assets/s.svg">
<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="512" height="512">
<path d="M0 0 C4.24903979 1.85037009 8.1228607 4.19441075 12.0625 6.625 C13.21040121 7.3131823 14.35951435 7.99934667 15.50976562 8.68359375 C17.86910147 10.09012325 20.22222363 11.50624598 22.57080078 12.93066406 C27.67485503 16.02041706 32.84017358 19.00469344 38 22 C39.97934757 23.15594029 41.95851286 24.31219276 43.9375 25.46875 C50.27895672 29.16793309 56.63840485 32.83558896 63 36.5 C76.35015665 44.19117469 89.65733128 51.9548296 102.95898438 59.72949219 C105.93065505 61.46606836 108.90269374 63.20201192 111.875 64.9375 C112.86218018 65.51395264 113.84936035 66.09040527 114.86645508 66.68432617 C122.16611392 70.9420168 129.48704158 75.16189825 136.8125 79.375 C146.87364481 85.16388211 156.87525306 91.04711499 166.84326172 96.99487305 C172.64216924 100.44740914 178.46369962 103.84920234 184.33984375 107.16796875 C185.54168779 107.84957213 186.743511 108.53121225 187.9453125 109.21289062 C190.21667295 110.5005192 192.49425664 111.77396904 194.77734375 113.04101562 C195.79828125 113.61916016 196.81921875 114.19730469 197.87109375 114.79296875 C198.76755615 115.2933667 199.66401855 115.79376465 200.58764648 116.30932617 C203.44058024 118.30877626 205.07179982 120.08586282 207 123 C207.50793457 126.33898926 207.50793457 126.33898926 207.51757812 130.18945312 C207.52809204 131.24651711 207.52809204 131.24651711 207.53881836 132.32493591 C207.55636004 134.64411339 207.54479048 136.96206108 207.53125 139.28125 C207.53394605 140.89880608 207.53782941 142.51636058 207.54284668 144.13391113 C207.5487365 147.51993273 207.54019582 150.90553155 207.52148438 154.29150391 C207.49869466 158.62612817 207.51182058 162.95976173 207.53577423 167.29434967 C207.55024645 170.63331532 207.54561979 173.9720471 207.53526306 177.3110199 C207.53259969 178.90897235 207.53585185 180.50694622 207.54518127 182.10487366 C207.55537097 184.34066801 207.53981492 186.57487072 207.51757812 188.81054688 C207.51439575 190.08119995 207.51121338 191.35185303 207.50793457 192.66101074 C206.90912172 196.59740294 205.77507997 198.19821089 203 201 C199.984375 203.01953125 199.984375 203.01953125 196.75 204.8125 C195.67234375 205.41707031 194.5946875 206.02164063 193.484375 206.64453125 C192.66453125 207.09183594 191.8446875 207.53914062 191 208 C194.13171944 210.56080422 197.29403279 212.92414351 200.6875 215.125 C203.05209763 216.65900787 205.00269892 218.00269892 207 220 C207.26171303 221.92528248 207.26171303 221.92528248 207.2784729 224.32563782 C207.29521812 225.69155563 207.29521812 225.69155563 207.31230164 227.08506775 C207.31446182 228.08864822 207.31662201 229.0922287 207.31884766 230.1262207 C207.32889328 231.182547 207.3389389 232.23887329 207.34928894 233.32720947 C207.38041954 236.86006126 207.39728942 240.39283427 207.4140625 243.92578125 C207.43281815 246.41912953 207.45239466 248.91247175 207.4727478 251.4058075 C207.51382376 256.67961672 207.54878521 261.95341138 207.578125 267.22729492 C207.62194452 275.1014882 207.68143663 282.97552869 207.7421875 290.84960938 C207.82925201 302.41026478 207.89360217 313.97089593 207.94313431 325.53177071 C207.97739201 333.24675944 208.03015758 340.96135124 208.09687996 348.67612553 C208.13701063 353.62528948 208.16471907 358.57447058 208.18943405 363.52373314 C208.20365042 365.85037176 208.22305437 368.17698507 208.24791336 370.50353432 C208.28124166 373.69800778 208.29596326 376.89205105 208.30615234 380.08666992 C208.32758615 381.49290524 208.32758615 381.49290524 208.34945297 382.92754936 C208.3440231 387.78702994 208.18260359 391.06269814 205 395 C198.57373835 400.54857638 190.79057669 404.51095683 183.375 408.5625 C174.88076024 413.26107918 166.43618799 418.02710702 158.0625 422.9375 C149.76625069 427.79945629 141.456567 432.63626856 133.125 437.4375 C132.04484619 438.06003662 130.96469238 438.68257324 129.85180664 439.32397461 C127.66203666 440.58576826 125.47217645 441.84740534 123.28222656 443.10888672 C117.85340058 446.23680148 112.42680719 449.36858448 107 452.5 C104.83334417 453.75001879 102.6666775 455.00001878 100.5 456.25 C99.4275 456.86875 98.355 457.4875 97.25 458.125 C61.5 478.75 61.5 478.75 58.24658203 480.62695312 C56.09128689 481.8704051 53.93601327 483.11389436 51.78076172 484.35742188 C46.77662326 487.24462875 41.7722948 490.1315043 36.76715088 493.01696777 C35.01658759 494.02619104 33.26609589 495.03553836 31.515625 496.04492188 C29.33607835 497.3016766 27.15640168 498.55820586 24.9765625 499.81445312 C23.97625 500.39130859 22.9759375 500.96816406 21.9453125 501.5625 C20.96336914 502.12195313 19.98142578 502.68140625 18.96972656 503.2578125 C16.92780628 504.45570326 14.91483209 505.7038927 12.92871094 506.9921875 C7.53105337 510.42189527 3.07212584 513.15400741 -3.46679688 512.62646484 C-8.72109218 511.32706992 -13.15068727 508.58729198 -17.75 505.8125 C-18.84127197 505.17755615 -19.93254395 504.5426123 -21.05688477 503.88842773 C-24.38395393 501.94629119 -27.69282623 499.97577932 -31 498 C-32.86759196 496.89951692 -34.73603082 495.80046932 -36.60546875 494.703125 C-40.19233565 492.59351103 -43.77191149 490.47215425 -47.34765625 488.34375 C-53.4922826 484.69575043 -59.6812405 481.1262587 -65.875 477.5625 C-79.26882828 469.85380763 -92.61711337 462.0686773 -105.95898438 454.27050781 C-108.93065505 452.53393164 -111.90269374 450.79798808 -114.875 449.0625 C-115.86218018 448.48604736 -116.84936035 447.90959473 -117.86645508 447.31567383 C-125.16611349 443.05798345 -132.48700606 438.83803948 -139.8125 434.625 C-149.82979822 428.8623607 -159.7838574 423.00007826 -169.70483398 417.07324219 C-175.67839127 413.51681908 -181.68058429 410.03394093 -187.75 406.64453125 C-189.03727489 405.92244957 -190.32454705 405.20036303 -191.61181641 404.47827148 C-194.05995212 403.10602264 -196.51619682 401.75007655 -198.97802734 400.40258789 C-200.64019287 399.47240845 -200.64019287 399.47240845 -202.3359375 398.5234375 C-203.79845947 397.717854 -203.79845947 397.717854 -205.29052734 396.89599609 C-209.76502874 393.76489339 -212.63625985 390.95617198 -213.63491821 385.58544922 C-213.63889618 384.33779785 -213.64287415 383.09014648 -213.64697266 381.8046875 C-213.65573425 381.11119202 -213.66449585 380.41769653 -213.67352295 379.70318604 C-213.69540653 377.4264745 -213.68100642 375.15172887 -213.6640625 372.875 C-213.66743388 371.28368764 -213.67228918 369.6923778 -213.67855835 368.10107422 C-213.68591462 364.7722106 -213.67526533 361.44401956 -213.65185547 358.11523438 C-213.62336732 353.85788434 -213.63977815 349.60211038 -213.66971779 345.34481812 C-213.68782516 342.0606712 -213.68201723 338.77689518 -213.66907883 335.49273682 C-213.66575426 333.92352103 -213.66979844 332.35427107 -213.68147659 330.78509521 C-213.69424359 328.58759985 -213.67473338 326.39262134 -213.64697266 324.1953125 C-213.64299469 322.94766113 -213.63901672 321.70000977 -213.63491821 320.41455078 C-212.64216932 315.07560879 -209.77777259 312.29534854 -205.39453125 309.1015625 C-204.54246094 308.61429687 -203.69039062 308.12703125 -202.8125 307.625 C-201.52279297 306.87089844 -201.52279297 306.87089844 -200.20703125 306.1015625 C-198 305 -198 305 -196 305 C-196 304.34 -196 303.68 -196 303 C-197.07701172 302.59587891 -197.07701172 302.59587891 -198.17578125 302.18359375 C-201.00607908 300.99745233 -203.55116695 299.62994159 -206.1875 298.0625 C-207.04730469 297.55847656 -207.90710938 297.05445313 -208.79296875 296.53515625 C-211 295 -211 295 -213 292 C-213.26171303 289.97008038 -213.26171303 289.97008038 -213.2784729 287.59880066 C-213.28963638 286.69667343 -213.30079987 285.7945462 -213.31230164 284.86508179 C-213.31446182 283.87601837 -213.31662201 282.88695496 -213.31884766 281.86791992 C-213.32889328 280.82280746 -213.3389389 279.77769501 -213.34928894 278.70091248 C-213.38038092 275.21076999 -213.39728062 271.72070721 -213.4140625 268.23046875 C-213.43282321 265.76336556 -213.45240005 263.29626846 -213.4727478 260.82917786 C-213.51906844 254.94375713 -213.55628996 249.05833085 -213.58942068 243.1728223 C-213.63012535 236.05979529 -213.68666801 228.94690776 -213.7421875 221.83398438 C-213.82943537 210.37660165 -213.89377664 198.91924374 -213.94313431 187.4616375 C-213.97769263 179.70533277 -214.03072015 171.94941018 -214.09687996 164.19331264 C-214.13708669 159.1559804 -214.16476896 154.1186315 -214.18943405 149.08120155 C-214.20365554 146.70499304 -214.22306346 144.32880935 -214.24791336 141.95268822 C-214.2812599 138.68491866 -214.29596999 135.41757016 -214.30615234 132.1496582 C-214.32044155 131.18869799 -214.33473076 130.22773777 -214.34945297 129.23765755 C-214.34410282 124.32980303 -214.22846854 120.97194917 -211 117 C-204.8336837 111.75994034 -197.05597106 108.13513695 -190 104.25 C-182.81107379 100.25824176 -175.63363437 96.26001356 -168.5625 92.0625 C-161.59230165 87.92682031 -154.58498988 83.85878933 -147.5625 79.8125 C-146.45527588 79.17449463 -145.34805176 78.53648926 -144.20727539 77.87915039 C-141.93662932 76.57110523 -139.66587642 75.26324552 -137.39501953 73.95556641 C-131.9283002 70.80667946 -126.46425113 67.65316736 -121 64.5 C-118.83334689 63.2499765 -116.66668021 61.99997653 -114.5 60.75 C-113.4275 60.13125 -112.355 59.5125 -111.25 58.875 C-99.33333333 52 -87.41666667 45.125 -75.5 38.25 C-74.42709717 37.6310083 -73.35419434 37.0120166 -72.2487793 36.37426758 C-70.08621417 35.1266526 -67.92361661 33.87909384 -65.76098633 32.6315918 C-59.17006479 28.82953801 -52.58006228 25.02590263 -45.99194336 21.21899414 C-43.80808573 19.95902042 -41.62272525 18.70164755 -39.43579102 17.44702148 C-34.26378481 14.4782355 -29.11683661 11.47971078 -24.015625 8.390625 C-23.07243408 7.82819092 -22.12924316 7.26575684 -21.1574707 6.6862793 C-19.40681785 5.64116736 -17.66489622 4.58121449 -15.93432617 3.50317383 C-10.61233879 0.35460931 -6.18072384 -1.49542697 0 0 Z " fill="#010101" transform="translate(259,0)"/>
<path d="M0 0 C2.46098631 1.31369376 4.81481019 2.66752323 7.1875 4.125 C8.70098225 5.0352534 10.21536679 5.94400764 11.73046875 6.8515625 C12.98029541 7.60228027 12.98029541 7.60228027 14.25537109 8.36816406 C19.47057338 11.46889455 24.73935716 14.47724929 30 17.5 C37.89063161 22.04333016 45.76801923 26.6062401 53.60961914 31.23364258 C69.11229758 40.38065229 84.68583075 49.40549981 100.2824707 58.39111328 C110.54858681 64.30889386 120.78425592 70.27806313 131.01464844 76.25732422 C134.05207975 78.03040115 137.09207948 79.79899828 140.1328125 81.56640625 C145.12138295 84.46669181 150.10509519 87.3751178 155.08398438 90.29199219 C157.05306348 91.44534763 159.02314138 92.59699932 160.99414062 93.74707031 C163.83406536 95.40697352 166.66782992 97.07690853 169.5 98.75 C170.36141602 99.25160645 171.22283203 99.75321289 172.11035156 100.27001953 C172.88862305 100.73263184 173.66689453 101.19524414 174.46875 101.671875 C175.15388672 102.0750293 175.83902344 102.47818359 176.54492188 102.89355469 C177.02509766 103.25868164 177.50527344 103.62380859 178 104 C178 104.66 178 105.32 178 106 C177.27111572 106.40202637 176.54223145 106.80405273 175.79125977 107.21826172 C158.03313177 117.00064103 158.03313177 117.00064103 140.48876953 127.15869141 C134.17146343 130.91364807 127.80686138 134.58414373 121.4375 138.25 C112.98325042 143.11759824 104.54473374 148.01045387 96.125 152.9375 C86.85444994 158.35973762 77.54063142 163.70324102 68.20953369 169.02023315 C59.14761065 174.18501246 50.12425158 179.41248528 41.12426758 184.68457031 C31.78953487 190.14369762 22.39891053 195.50347648 12.99804688 200.84765625 C11.86818359 201.49089844 10.73832031 202.13414062 9.57421875 202.796875 C8.06734497 203.65297363 8.06734497 203.65297363 6.5300293 204.52636719 C4.6490112 205.621979 2.81123309 206.79251127 1 208 C-2.71979658 207.65535673 -5.46351958 206.39422827 -8.67578125 204.55078125 C-9.57353271 204.03974854 -10.47128418 203.52871582 -11.39624023 203.00219727 C-12.35860596 202.44459717 -13.32097168 201.88699707 -14.3125 201.3125 C-15.32578369 200.73234131 -16.33906738 200.15218262 -17.38305664 199.55444336 C-20.59392936 197.71185571 -23.79794947 195.85787163 -27 194 C-28.50288574 193.12891602 -28.50288574 193.12891602 -30.03613281 192.24023438 C-36.03003486 188.76168327 -42.01332953 185.26521928 -47.99267578 181.76171875 C-52.95069751 178.85726309 -57.91238105 175.95909225 -62.875 173.0625 C-63.85976318 172.48765869 -64.84452637 171.91281738 -65.85913086 171.32055664 C-73.2263907 167.02433377 -80.61025028 162.75740115 -88 158.5 C-101.35009178 150.80871162 -114.65733042 143.0451709 -127.95898438 135.27050781 C-130.93065504 133.53393165 -133.90270372 131.79800513 -136.875 130.0625 C-137.84840332 129.49402344 -138.82180664 128.92554688 -139.82470703 128.33984375 C-145.21034327 125.19829615 -150.60397799 122.07107373 -156.0078125 118.9609375 C-156.59319794 118.62390305 -157.17858337 118.28686859 -157.78170776 117.93962097 C-160.61085721 116.31112885 -163.44109507 114.6845761 -166.27294922 113.06079102 C-171.92170263 109.81318015 -177.50136405 106.49612791 -183 103 C-179.58501433 99.10973282 -175.74967408 97.01780162 -171.25 94.625 C-163.92538522 90.64295542 -156.69139093 86.53035742 -149.5 82.3125 C-141.05758857 77.36785184 -132.60196113 72.44771204 -124.125 67.5625 C-123.04541016 66.94028564 -121.96582031 66.31807129 -120.85351562 65.67700195 C-118.6631748 64.41488483 -116.47274498 63.15292215 -114.28222656 61.89111328 C-108.85340058 58.76319852 -103.42680719 55.63141552 -98 52.5 C-95.83334417 51.24998121 -93.6666775 49.99998122 -91.5 48.75 C-90.4275 48.13125 -89.355 47.5125 -88.25 46.875 C-76.33333333 40 -64.41666667 33.125 -52.5 26.25 C-51.42556641 25.63012207 -50.35113281 25.01024414 -49.24414062 24.37158203 C-47.09704864 23.13289998 -44.94991386 21.8942921 -42.80273438 20.65576172 C-37.70411191 17.7146665 -32.60594704 14.77278587 -27.50927734 11.82830811 C-25.08952335 10.43041399 -22.66952737 9.03293911 -20.24951172 7.63549805 C-18.53198948 6.64347676 -16.81481948 5.65084571 -15.09765625 4.65820312 C-13.54884766 3.76391602 -13.54884766 3.76391602 -11.96875 2.8515625 C-10.59879883 2.05999756 -10.59879883 2.05999756 -9.20117188 1.25244141 C-5.4584453 -0.87712684 -4.21575707 -1.22449375 0 0 Z " fill="#F6B42B" transform="translate(258,22)"/>
<path d="M0 0 C3.44551973 36.92006914 3.44551973 36.92006914 -1.74023438 46.07080078 C-6.5376371 50.67092128 -12.51513819 52.68304576 -18.72363281 54.77246094 C-24.46095218 56.92203186 -29.52537928 60.21158434 -34.75 63.375 C-36.94991482 64.64878953 -39.15307191 65.91699528 -41.359375 67.1796875 C-48.9827446 71.56435604 -56.60005215 75.95950024 -64.21606445 80.35693359 C-69.22692991 83.24943681 -74.23931125 86.13917161 -79.25863647 89.01696777 C-81.01728749 90.02548314 -82.77533209 91.0350477 -84.53320312 92.04492188 C-86.72472231 93.30350518 -88.91734504 94.56016987 -91.11132812 95.81445312 C-103.00262454 101.45248885 -103.00262454 101.45248885 -112 110 C-112.12355235 112.85836493 -112.188432 115.69137464 -112.203125 118.55078125 C-112.20882507 119.40173874 -112.21452515 120.25269623 -112.22039795 121.12944031 C-112.22985298 122.93255366 -112.23638392 124.73568433 -112.24023438 126.53881836 C-112.24992487 129.29116198 -112.28093675 132.04275408 -112.3125 134.79492188 C-112.31903163 136.54687057 -112.32428147 138.2988246 -112.328125 140.05078125 C-112.3466452 141.28227654 -112.3466452 141.28227654 -112.36553955 142.53865051 C-112.34753929 147.18087484 -112.01932262 150.23044095 -109 154 C-105.48847264 155.75576368 -101.74186706 154.79256688 -98 154 C-95.36710489 152.92561445 -93.06925568 151.48192687 -90.6875 149.9375 C-89.20476948 149.02207064 -87.72025757 148.10952293 -86.234375 147.19921875 C-85.41259766 146.69181152 -84.59082031 146.1844043 -83.74414062 145.66162109 C-78.9666776 142.76879072 -74.10065391 140.02981088 -69.24301147 137.2746582 C-59.75219319 131.88845881 -50.29466932 126.44731075 -40.875 120.9375 C-32.760203 116.19125149 -24.63659314 111.46093598 -16.49615479 106.75881958 C-14.78847502 105.77222847 -13.08148527 104.78444334 -11.37451172 103.79663086 C-10.3382666 103.19858643 -9.30202148 102.60054199 -8.234375 101.984375 C-6.86104004 101.19111816 -6.86104004 101.19111816 -5.45996094 100.38183594 C-3.3408619 99.19147264 -1.1739449 98.08697245 1 97 C1 143.86 1 190.72 1 239 C-12.86 246.92 -12.86 246.92 -27 255 C-36.01095762 260.2485178 -36.01095762 260.2485178 -45.015625 265.5078125 C-54.55822933 271.08429156 -64.14057793 276.59211491 -73.71777344 282.10888672 C-79.14659942 285.23680148 -84.57319281 288.36858448 -90 291.5 C-92.16665583 292.75001879 -94.3333225 294.00001878 -96.5 295.25 C-97.5725 295.86875 -98.645 296.4875 -99.75 297.125 C-109.5 302.75 -109.5 302.75 -112.75097656 304.62548828 C-114.91447476 305.87371034 -117.07788643 307.12208239 -119.24121094 308.37060547 C-124.70565017 311.52405256 -130.17163645 314.67476096 -135.640625 317.8203125 C-137.84383665 319.08839113 -140.04696237 320.35661906 -142.25 321.625 C-143.31541016 322.23802979 -144.38082031 322.85105957 -145.47851562 323.48266602 C-150.82399409 326.565307 -156.15179959 329.67398363 -161.453125 332.83203125 C-162.47245117 333.43901855 -163.49177734 334.04600586 -164.54199219 334.67138672 C-166.47219544 335.82383722 -168.40004851 336.98023579 -170.32519531 338.14111328 C-171.60281738 338.90464111 -171.60281738 338.90464111 -172.90625 339.68359375 C-173.65197266 340.13275146 -174.39769531 340.58190918 -175.16601562 341.04467773 C-177 342 -177 342 -179 342 C-179.42296323 336.06014171 -179.72972652 330.12914157 -179.93383789 324.17773438 C-180.01892348 322.15892941 -180.13466212 320.14116034 -180.2824707 318.12597656 C-181.4418257 301.90302985 -181.4418257 301.90302985 -177.46084595 297.1701355 C-173.43435678 293.9187274 -168.89824563 291.86817393 -164.1378479 289.9095459 C-161.26390037 288.68682693 -158.660932 287.12315757 -156.00390625 285.48828125 C-154.19040182 284.42917766 -152.37659703 283.37058822 -150.5625 282.3125 C-149.56009277 281.72782959 -148.55768555 281.14315918 -147.52490234 280.54077148 C-134.57490247 272.99512594 -121.58475295 265.51903577 -108.59619141 258.04003906 C-103.05844085 254.85099042 -97.52267177 251.65866681 -91.9921875 248.45703125 C-88.23916228 246.28539058 -84.47528719 244.1360674 -80.6953125 242.01171875 C-79.15102715 241.13283801 -77.60675523 240.25393367 -76.0625 239.375 C-75.37663818 238.99754639 -74.69077637 238.62009277 -73.98413086 238.23120117 C-70.01626499 235.95379919 -67.90906606 234.15172143 -66 230 C-65.68874056 227.05244545 -65.53200151 224.32151003 -65.53125 221.375 C-65.52363647 220.5504834 -65.51602295 219.7259668 -65.50817871 218.87646484 C-65.49740408 217.13837707 -65.49451387 215.40022469 -65.49902344 213.66210938 C-65.49999706 211.00801562 -65.45832325 208.35680265 -65.4140625 205.703125 C-65.40885591 204.01042267 -65.4061673 202.31771033 -65.40625 200.625 C-65.38985474 199.83528809 -65.37345947 199.04557617 -65.35656738 198.23193359 C-65.40898814 194.03918073 -65.66065996 192.43905116 -68.31396484 189.00610352 C-71.18463695 186.86210127 -73.06318517 186.17351317 -76.66113281 186.42138672 C-81.88282432 187.71318305 -86.3321512 190.77782105 -90.875 193.5625 C-92.02233513 194.24794234 -93.17079697 194.93150185 -94.3203125 195.61328125 C-96.70461527 197.02938635 -99.08389494 198.45342181 -101.45996094 199.88330078 C-106.92895829 203.16525973 -112.4679437 206.32595903 -118 209.5 C-120.16049018 210.74551468 -122.32064533 211.9916107 -124.48046875 213.23828125 C-125.55216309 213.85654785 -126.62385742 214.47481445 -127.72802734 215.11181641 C-131.044382 217.02561188 -134.36014721 218.94042512 -137.67578125 220.85546875 C-144.11498147 224.57414578 -150.55655968 228.28867509 -157 232 C-158.56524414 232.90202148 -158.56524414 232.90202148 -160.16210938 233.82226562 C-163.12748598 235.52982987 -166.09465299 237.23423393 -169.0625 238.9375 C-169.95557861 239.45207764 -170.84865723 239.96665527 -171.76879883 240.49682617 C-172.57857178 240.96064697 -173.38834473 241.42446777 -174.22265625 241.90234375 C-175.28625366 242.51323853 -175.28625366 242.51323853 -176.37133789 243.13647461 C-178 244 -178 244 -179 244 C-179 197.14 -179 150.28 -179 102 C-169.1 96.555 -169.1 96.555 -159 91 C-152.84378336 87.40437918 -152.84378336 87.40437918 -146.70703125 83.77734375 C-141.0191213 80.4091603 -135.29022431 77.11236952 -129.5625 73.8125 C-128.45712891 73.17546143 -127.35175781 72.53842285 -126.21289062 71.88208008 C-122.80889695 69.9208598 -119.40449228 67.96035461 -116 66 C-111.62449212 63.48004706 -107.24943866 60.95930859 -102.875 58.4375 C-101.79661865 57.81584961 -100.7182373 57.19419922 -99.60717773 56.55371094 C-92.43241148 52.41377966 -85.27501075 48.24500712 -78.125 44.0625 C-69.48718013 39.0116199 -60.81681248 34.01974096 -52.125 29.0625 C-42.69740794 23.68549484 -33.27781998 18.29523456 -23.875 12.875 C-22.82715332 12.27179932 -21.77930664 11.66859863 -20.69970703 11.04711914 C-15.07086374 7.79949953 -9.48802808 4.49641168 -3.96533203 1.07080078 C-2 0 -2 0 0 0 Z " fill="#FDFDFD" transform="translate(446,144)"/>
<path d="M0 0 C1.72389692 0.9384665 3.447566 1.87735154 5.17114258 2.81640625 C6.61098259 3.60059937 6.61098259 3.60059937 8.07991028 4.40063477 C12.63686437 6.89652861 17.16473862 9.44278813 21.6875 12 C23.16682007 12.83640015 23.16682007 12.83640015 24.67602539 13.68969727 C34.83149552 19.44753987 44.91168602 25.33196481 54.98388672 31.23388672 C59.98538616 34.1625614 64.99295476 37.08082046 70 40 C75.97782079 43.486131 81.95505999 46.97324228 87.9296875 50.46484375 C99.36219469 57.14383479 110.81535395 63.78547374 122.28857422 70.39428711 C130.51292381 75.13448084 138.71602799 79.91011083 146.91040039 84.7019043 C152.3456479 87.87739717 157.78984639 91.0365544 163.24609375 94.17578125 C163.84853912 94.52252899 164.4509845 94.86927673 165.07168579 95.22653198 C168.00938927 96.91696396 170.94825226 98.60530817 173.88867188 100.29101562 C175.4577832 101.19303711 175.4577832 101.19303711 177.05859375 102.11328125 C178.45549438 102.91439331 178.45549438 102.91439331 179.88061523 103.73168945 C182 105 182 105 183 106 C183.09643778 107.82227687 183.12187371 109.6483336 183.12025452 111.47315979 C183.12231651 113.25481537 183.12231651 113.25481537 183.12442017 115.07246399 C183.12082489 116.38732285 183.11722961 117.7021817 183.11352539 119.05688477 C183.11324352 120.44617714 183.11340125 121.83546967 183.1139679 123.22476196 C183.11425588 127.00765289 183.10835901 130.79051238 183.10139394 134.57339597 C183.09516055 138.52255677 183.09455661 142.47171822 183.09336853 146.42088318 C183.09025517 153.90425075 183.08204172 161.38760379 183.07201904 168.87096494 C183.06085805 177.38835733 183.05534749 185.9057504 183.05032361 194.42314827 C183.03985911 211.94877394 183.02225958 229.47438543 183 247 C181.11527121 246.06765245 179.23171293 245.13293856 177.34863281 244.19726562 C176.29959778 243.67700806 175.25056274 243.15675049 174.16973877 242.62072754 C169.24930903 240.10484956 164.50373639 237.31488185 159.75 234.5 C157.64068487 233.26031479 155.53130812 232.02073442 153.421875 230.78125 C152.35646484 230.15347656 151.29105469 229.52570313 150.19335938 228.87890625 C145.13766509 225.90424086 140.06848383 222.95280165 135 220 C132.99731305 218.8321732 130.99470902 217.6642042 128.9921875 216.49609375 C128.00186523 215.91843262 127.01154297 215.34077148 125.99121094 214.74560547 C123.01693706 213.0098841 120.04351578 211.27271075 117.0703125 209.53515625 C105.63780531 202.85616521 94.18464605 196.21452626 82.71142578 189.60571289 C74.47172552 184.85667163 66.25386578 180.07119041 58.04345703 175.27172852 C50.6702595 170.96514664 43.27570261 166.69660626 35.875 162.4375 C27.3718378 157.54040426 18.88930312 152.61027041 10.4375 147.625 C9.49696777 147.07126709 8.55643555 146.51753418 7.58740234 145.94702148 C6.73227051 145.44114502 5.87713867 144.93526855 4.99609375 144.4140625 C4.24513428 143.9701416 3.4941748 143.5262207 2.72045898 143.06884766 C1 142 1 142 0 141 C-0.09643778 139.17772313 -0.12187371 137.3516664 -0.12025452 135.52684021 C-0.12231651 133.74518463 -0.12231651 133.74518463 -0.12442017 131.92753601 C-0.12082489 130.61267715 -0.11722961 129.2978183 -0.11352539 127.94311523 C-0.11324352 126.55382286 -0.11340125 125.16453033 -0.1139679 123.77523804 C-0.11425588 119.99234711 -0.10835901 116.20948762 -0.10139394 112.42660403 C-0.09516055 108.47744323 -0.09455661 104.52828178 -0.09336853 100.57911682 C-0.09025517 93.09574925 -0.08204172 85.61239621 -0.07201904 78.12903506 C-0.06085805 69.61164267 -0.05534749 61.0942496 -0.05032361 52.57685173 C-0.03985911 35.05122606 -0.02225958 17.52561457 0 0 Z " fill="#2BC4DE" transform="translate(65,141)"/>
<path d="M0 0 C4.20818624 1.27429357 7.75039092 2.85759814 11.5078125 5.1328125 C12.56226562 5.76574219 13.61671875 6.39867187 14.703125 7.05078125 C15.5374707 7.55665771 15.5374707 7.55665771 16.38867188 8.07275391 C19.39972337 9.8975053 22.42279035 11.70214608 25.4453125 13.5078125 C26.07044739 13.88174133 26.69558228 14.25567017 27.33966064 14.64093018 C33.84085415 18.52017269 40.41532571 22.26445472 47 26 C56.22477683 31.23842534 65.38696139 36.56838758 74.5 42 C83.6775781 47.46894535 92.90249783 52.84149347 102.1875 58.125 C113.84865042 64.76101208 125.45530558 71.48526252 137.03369141 78.26464844 C141.13708688 80.66521922 145.24475419 83.05843546 149.35229492 85.4519043 C154.23649488 88.29847648 159.11853131 91.14874722 164 94 C165.32837891 94.77561279 165.32837891 94.77561279 166.68359375 95.56689453 C169.10262227 96.98029571 171.52032993 98.3959235 173.9375 99.8125 C174.64769287 100.22725586 175.35788574 100.64201172 176.08959961 101.06933594 C180.88458503 103.88458503 180.88458503 103.88458503 182 105 C182.09268999 106.35094982 182.11747326 107.70667091 182.11352539 109.06079102 C182.11344986 109.92160782 182.11337433 110.78242462 182.11329651 111.66932678 C182.10813522 112.60473801 182.10297394 113.54014923 182.09765625 114.50390625 C182.09553383 115.93342873 182.09553383 115.93342873 182.09336853 117.39183044 C182.08775152 120.44875165 182.07519616 123.50560077 182.0625 126.5625 C182.05748719 128.62955624 182.05292391 130.69661362 182.04882812 132.76367188 C182.03777656 137.84247588 182.02050055 142.9212257 182 148 C173.87255762 143.61197782 165.82735167 139.08991099 157.8125 134.5 C157.2070636 134.15373566 156.6016272 133.80747131 155.97784424 133.45071411 C146.60389458 128.08877329 137.26170868 122.67419485 127.94067383 117.22070312 C120.6432037 112.95231454 113.32601254 108.71919227 106 104.5 C92.6497785 96.80893898 79.34266785 89.04516989 66.04101562 81.27050781 C50.55631983 72.21798477 50.55631983 72.21798477 35.02441406 63.24682617 C32.80977812 61.96305674 30.60699809 60.65860115 28.41699219 59.33325195 C22.58643359 55.84014958 17.26600504 53.10985278 10.6315918 51.52124023 C6.25152954 49.50131426 2.91199504 46.86214512 0 43 C-1.11680834 39.56662911 -1.17918624 36.34563455 -1.16015625 32.75390625 C-1.18346512 31.7981218 -1.20677399 30.84233734 -1.23078918 29.85758972 C-1.39157763 19.88701989 -0.79395721 9.93442973 0 0 Z " fill="#2BC3DE" transform="translate(66,338)"/>
<path d="M0 0 C2.90203679 1.3399032 5.64438896 2.82850414 8.41552734 4.42211914 C9.52951904 5.06068848 10.64351074 5.69925781 11.79125977 6.35717773 C12.99549875 7.05190483 14.19968025 7.74673155 15.40380859 8.44165039 C16.65406891 9.16016724 17.90447806 9.87842516 19.1550293 10.59643555 C22.37969766 12.44902778 25.60201385 14.30567162 28.82373047 16.16339111 C31.7969891 17.87698454 34.77243748 19.58676143 37.74755859 21.29711914 C48.31245952 27.3760596 58.85547706 33.48937171 69.35302734 39.68383789 C83.09376341 47.78776021 96.89407551 55.79023096 110.71630859 63.75415039 C119.18384318 68.63423894 127.64492267 73.52503639 136.09130859 78.44165039 C137.07228516 79.01028809 138.05326172 79.57892578 139.06396484 80.16479492 C143.88451595 82.97007892 148.66064175 85.82492089 153.38037109 88.79711914 C154.73122803 89.63883667 154.73122803 89.63883667 156.109375 90.49755859 C157.79060909 91.5497863 159.46298841 92.61636238 161.12402344 93.70019531 C165.06328992 96.1558036 168.62715244 98.21269313 173.44726562 97.85913086 C178.94775895 96.39256937 183.77951419 93.23772753 188.65380859 90.37915039 C189.872318 89.68111948 191.09164632 88.98451627 192.31176758 88.28930664 C195.79277349 86.29916546 199.25571775 84.27957981 202.71630859 82.25415039 C203.53905273 81.77558594 204.36179687 81.29702148 205.20947266 80.80395508 C208.5474619 78.86149215 211.87427734 76.90141751 215.19287109 74.92602539 C222.2375515 70.74437116 229.35513882 66.68620374 236.45874023 62.60571289 C237.51182373 61.99985352 238.56490723 61.39399414 239.64990234 60.76977539 C240.67196777 60.18518555 241.6940332 59.6005957 242.74707031 58.99829102 C244.70444705 57.84852129 246.63969709 56.66010007 248.54882812 55.43188477 C249.42007324 54.87307617 250.29131836 54.31426758 251.18896484 53.73852539 C252.32410522 52.98394043 252.32410522 52.98394043 253.48217773 52.21411133 C256.33752165 50.98722768 257.78646765 51.34180731 260.71630859 52.25415039 C263.52880859 53.69165039 263.52880859 53.69165039 265.71630859 55.25415039 C265.71630859 55.91415039 265.71630859 56.57415039 265.71630859 57.25415039 C263.92578125 58.52832031 263.92578125 58.52832031 261.38037109 59.98461914 C259.95772949 60.80615479 259.95772949 60.80615479 258.50634766 61.64428711 C257.46188477 62.23741699 256.41742188 62.83054687 255.34130859 63.44165039 C254.26075195 64.06313965 253.18019531 64.68462891 252.06689453 65.32495117 C249.77298274 66.64373567 247.47778235 67.95991582 245.18017578 69.2722168 C241.88713019 71.15641077 238.60108573 73.05210691 235.31787109 74.95336914 C220.60052975 83.47405452 205.85843125 91.9558031 191.05810547 100.33178711 C188.66753612 101.70695829 186.30623838 103.10445337 183.95263672 104.53979492 C183.32605164 104.91523941 182.69946655 105.2906839 182.05389404 105.67750549 C180.29726559 106.73136396 178.549002 107.79912892 176.80126953 108.86767578 C173.33567834 110.42521712 172.22274346 110.5495392 168.71630859 109.25415039 C166.14282227 107.98583984 166.14282227 107.98583984 163.38427734 106.36743164 C162.35093262 105.76600342 161.31758789 105.1645752 160.25292969 104.54492188 C159.14771973 103.89209229 158.04250977 103.2392627 156.90380859 102.56665039 C155.73834136 101.88508233 154.57248216 101.20418414 153.40625 100.52392578 C151.00816902 99.12366884 148.6124686 97.71946867 146.21875 96.31176758 C142.98714642 94.41173774 139.74931239 92.52258702 136.50927734 90.63696289 C129.58699879 86.6080093 122.67218964 82.56631717 115.75732422 78.5246582 C104.42777968 71.90393228 93.08654257 65.30479812 81.71630859 58.75415039 C68.36621681 51.06286201 55.05897817 43.29932129 41.75732422 35.5246582 C38.78565363 33.78808208 35.81352499 32.05229214 32.84130859 30.31665039 C31.87008057 29.74889893 30.89885254 29.18114746 29.89819336 28.59619141 C24.48003944 25.43334128 19.04929904 22.29400864 13.60302734 19.17993164 C12.41077746 18.49695963 11.21855717 17.81393595 10.02636719 17.13085938 C7.74675606 15.82484778 5.46420393 14.52451889 3.1796875 13.22705078 C2.14634277 12.63529053 1.11299805 12.04353027 0.04833984 11.43383789 C-1.31713989 10.6562915 -1.31713989 10.6562915 -2.71020508 9.86303711 C-5.41252494 8.17360652 -7.83477804 6.28999071 -10.28369141 4.25415039 C-9.07053862 3.3570796 -7.83729234 2.48713884 -6.59619141 1.62915039 C-5.56945312 0.89825195 -5.56945312 0.89825195 -4.52197266 0.15258789 C-2.28369141 -0.74584961 -2.28369141 -0.74584961 0 0 Z " fill="#F0AF2A" transform="translate(85.28369140625,315.745849609375)"/>
<path d="M0 0 C2.70007929 1.06582077 5.01069786 2.24871276 7.375 3.9375 C7.375 4.5975 7.375 5.2575 7.375 5.9375 C6.2912207 6.55455811 6.2912207 6.55455811 5.18554688 7.18408203 C-7.44952113 14.38160103 -20.07664824 21.58946244 -32.625 28.9375 C-41.67989957 34.23774128 -50.7670015 39.47923109 -59.875 44.6875 C-60.79394043 45.2136792 -60.79394043 45.2136792 -61.73144531 45.75048828 C-63.47129173 46.74636471 -65.21218747 47.74040723 -66.953125 48.734375 C-67.9524707 49.30510742 -68.95181641 49.87583984 -69.98144531 50.46386719 C-72.17180573 51.68486972 -74.37022142 52.84155718 -76.625 53.9375 C-77.62507326 49.97424672 -77.80504129 46.87955932 -76.625 42.9375 C-72.92874099 39.57455904 -68.651535 37.53722977 -64.21435547 35.28808594 C-59.14597719 32.64446265 -54.24884277 29.69273877 -49.3125 26.8125 C-47.07127477 25.52046478 -44.82906846 24.23013006 -42.5859375 22.94140625 C-37.85978605 20.22383573 -33.13564358 17.50284669 -28.4140625 14.77734375 C-27.82613419 14.43797791 -27.23820587 14.09861206 -26.63246155 13.7489624 C-24.90078617 12.74934557 -23.16914281 11.74967325 -21.4375 10.75 C-18.36317512 8.97535428 -15.28881789 7.20084565 -12.2109375 5.43237305 C-10.6107699 4.50735169 -9.01584821 3.57310638 -7.4296875 2.62426758 C-2.89716313 -0.06898007 -2.89716313 -0.06898007 0 0 Z " fill="#F0B02A" transform="translate(428.625,220.0625)"/>
</svg>
</file>

<file path="src/components/auth/LoginScreen.tsx">
import React, { useState, FormEvent } from 'react';
import { LoginScreenProps } from '../../types';
import { Mail, Lock, AlertCircle } from 'lucide-react';


export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, language = 'vi' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const copy = language === 'en'
    ? {
        title: 'Sign in',
        subtitle: 'Sign in with your FASTBOARD account',
        email: 'Email Address',
        password: 'Password',
        button: 'Sign in',
        error: 'Invalid email or password',
        hint: 'Demo accounts — see SETUP.md',
      }
    : {
        title: 'Đăng nhập',
        subtitle: 'Nhập email và mật khẩu để tiếp tục',
        email: 'Email',
        password: 'Mật khẩu',
        button: 'Đăng nhập',
        error: 'Email hoặc mật khẩu không đúng',
        hint: 'Tài khoản demo — xem SETUP.md',
      };

  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const ok = await onLogin(email, password);
      if (!ok) setError(copy.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'ken-burns 30s ease-in-out infinite alternate'
        }}
      />
      <div className="absolute inset-0 z-0 bg-white/20 dark:bg-black/50 backdrop-blur-sm" />

      <style>{`
          @keyframes ken-burns {
              0% { transform: scale(1) translate(0, 0); }
              100% { transform: scale(1.15) translate(-2%, -2%); }
          }
      `}</style>

      <div className="relative z-10 bg-white/90 dark:bg-slate-900/85 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 dark:border-white/10 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow rotate-6">
            <div className="w-10 h-10 bg-white rounded-xl opacity-20 rotate-45" />
          </div>
          <h1 className="text-3xl font-logo font-extrabold text-brand dark:text-brand-bright tracking-tight">FASTBOARD</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2 font-medium">{copy.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              {copy.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="admin@fastboard.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
              {copy.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-lg">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-neutral-800 dark:bg-primary-500 dark:hover:bg-primary-400 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 text-base"
          >
            {isSubmitting ? '...' : copy.button}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">{copy.hint}</p>
      </div>
    </div>
  );
};
</file>

<file path="src/components/dashboard/DashboardStats.tsx">
import React from 'react';
import { DashboardStatsProps } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FolderKanban, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';


export const DashboardStats: React.FC<DashboardStatsProps> = ({ projectsCount, completedTasksCount, onNavigateProjects }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <>
        <Card 
          onClick={onNavigateProjects}
          className="relative overflow-hidden group hover:border-primary-200 dark:hover:border-primary-800 transition-colors cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <FolderKanban size={100} />
          </div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <FolderKanban size={20} />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t('projectsCount')}</p>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{projectsCount}</h3>
            <Badge variant="success" className="gap-1 shadow-sm"><ArrowUpRight size={12} /> {t('active')}</Badge>
          </div>
        </Card>

        <Card className="relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <CheckCircle2 size={100} />
          </div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={20} />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">{t('completedCount')}</p>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{completedTasksCount}</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('tasks')}</span>
          </div>
        </Card>
    </>
  );
};
</file>

<file path="src/components/dashboard/ProductivityCard.tsx">
import React from 'react';
import { ProductivityCardProps } from '../../types';
import { TrendingUp, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';


export const ProductivityCard: React.FC<ProductivityCardProps> = ({ stats }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="md:col-span-2 bg-black dark:bg-neutral-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all border border-neutral-800/50">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.08] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:opacity-[0.12] transition-opacity duration-700"></div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-90">
                <TrendingUp size={16} />
                <p className="text-sm font-semibold tracking-wide uppercase">{t('productivity')}</p>
            </div>
            <h3 className="text-3xl font-extrabold mt-1 text-white">{stats.label}</h3>
            <p className="text-xs mt-1 font-medium text-neutral-200">{stats.completed} / {stats.total} {t('tasks')}</p>
            <p className="text-xs mt-2 font-medium text-neutral-200">
              {t('avgCompletionTime')}: {stats.averageCompletionDays === null ? '—' : `${stats.averageCompletionDays.toFixed(1)} ${t('days')}`}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl shadow-inner border border-white/10">
             <Clock className="text-white" size={24} />
          </div>
        </div>
        <div className="mt-6">
           <div className="flex justify-between text-sm mb-2 font-medium opacity-90">
             <span className="text-neutral-200">{t('completionRate')}</span>
             <span className="text-white">{stats.percentage}%</span>
           </div>
           <div className="h-2.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
             <div 
               className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out" 
               style={{ width: `${stats.percentage}%` }}
             ></div>
           </div>
        </div>
      </div>
    </div>
  );
};
</file>

<file path="src/components/dashboard/RecentActivity.tsx">
import React from 'react';
import { RecentActivityProps, Priority } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';


export const RecentActivity: React.FC<RecentActivityProps> = ({ tasks, onViewAll }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <Card noPadding className="overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('recentTasks')}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('latestUpdates')}</p>
        </div>
        <Button variant="ghost" size="sm" className="font-semibold" onClick={onViewAll}>{t('viewAll')}</Button>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {tasks.slice(0, 4).map(task => (
           <div key={task.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${task.priority === Priority.HIGH ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-primary-50 text-primary-500 dark:bg-primary-900/20 dark:text-primary-400'}`}>
                    {task.priority === Priority.HIGH ? <TrendingUp size={24} /> : <CheckCircle2 size={24} />}
                 </div>
                 <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{task.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{new Date(task.dueDate).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}</p>
                 </div>
              </div>
              <Badge variant={
                  task.status === 'DONE' ? 'success' : 
                  task.status === 'IN_PROGRESS' ? 'primary' :
                  task.status === 'REVIEW' ? 'warning' : 'neutral'
              }>
                  {t(task.status as any)}
              </Badge>
           </div>
        ))}
        {tasks.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">{t('noTasksFound')}</div>
        )}
      </div>
    </Card>
  );
};
</file>

<file path="src/components/dashboard/StatusDonutChart.tsx">
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { StatusDonutChartProps } from '../../types';
import { Card } from '../ui/Card';
import { useApp } from '../../context/AppContext';


export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ data, totalTasks }) => {
  const { state } = useApp();
  const { t, darkMode } = state;

  return (
    <Card>
      <div className="flex justify-between items-start mb-6">
        <div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('statusOverview')}</h3>
           <p className="text-sm text-slate-600 dark:text-slate-300">{t('realTimeStats')}</p>
        </div>
      </div>
      
      <div className="h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={6}
              dataKey="value"
              cornerRadius={8}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{
                 backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                 borderRadius: '12px',
                 border: 'none',
                 boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                 color: darkMode ? '#F1F5F9' : '#0F172A',
               }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{totalTasks}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mt-1">{t('totalTasks')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
               <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                 {totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0}%
               </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
</file>

<file path="src/components/dashboard/TaskTrendChart.tsx">
import React, { useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TaskTrendChartProps } from '../../types';
import { Card } from '../ui/Card';
import { CHART_COLORS } from '../../constants';
import { useApp } from '../../context/AppContext';
import { 
  BarChart2, LineChart as LineChartIcon, Activity, 
} from 'lucide-react';


export const TaskTrendChart: React.FC<TaskTrendChartProps> = ({ data, timeRange, onRangeChange }) => {
  const { state } = useApp();
  const { t, darkMode } = state;
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line'>('area');
  const [metric, setMetric] = useState<'created' | 'due' | 'comparison'>('created');

  const tickFill = darkMode ? '#CBD5E1' : '#475569';
  const legendColor = darkMode ? '#E2E8F0' : '#334155';
  const gridStroke = darkMode ? '#334155' : '#E2E8F0';

  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
               <span className="text-sm font-bold text-slate-900 dark:text-white">
                 {entry.name === 'created' ? t('created') : t('due')}: {entry.value}
               </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  
  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 10, right: 10, left: -20, bottom: 0 }
    };

    const axisTick = { fill: tickFill, fontSize: 11 };
    const legendStyle = { color: legendColor };

    switch(chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} opacity={0.5} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisTick} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
            <Legend iconType="circle" wrapperStyle={legendStyle} />
            {(metric === 'created' || metric === 'comparison') && (
              <Bar dataKey="created" name="Created" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} barSize={20} />
            )}
            {(metric === 'due' || metric === 'comparison') && (
              <Bar dataKey="due" name="Due" fill={CHART_COLORS.orange} radius={[4, 4, 0, 0]} barSize={20} />
            )}
          </BarChart>
        );
      case 'line':
        return (
           <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} opacity={0.5} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisTick} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={legendStyle} />
            {(metric === 'created' || metric === 'comparison') && (
              <Line type="monotone" dataKey="created" name="Created" stroke={CHART_COLORS.purple} strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
            )}
            {(metric === 'due' || metric === 'comparison') && (
              <Line type="monotone" dataKey="due" name="Due" stroke={CHART_COLORS.orange} strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
            )}
          </LineChart>
        );
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.orange} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={CHART_COLORS.orange} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} opacity={0.5} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisTick} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={axisTick} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={legendStyle} />
            {(metric === 'created' || metric === 'comparison') && (
              <Area type="monotone" dataKey="created" name="Created" stroke={CHART_COLORS.purple} fillOpacity={1} fill="url(#colorCreated)" strokeWidth={3} />
            )}
            {(metric === 'due' || metric === 'comparison') && (
              <Area type="monotone" dataKey="due" name="Due" stroke={CHART_COLORS.orange} fillOpacity={1} fill="url(#colorDue)" strokeWidth={3} />
            )}
          </AreaChart>
        );
    }
  };

  const inactiveBtn = 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200';
  const activeBtn = 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm';
  const activeIconBtn = 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm';

  return (
    <Card className="lg:col-span-2" hoverEffect>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('taskCreation')}</h3>
           <p className="text-sm text-slate-600 dark:text-slate-300">{t('newTasksOverTime')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
           <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              <button onClick={() => setChartType('area')} className={`p-1.5 rounded-lg transition-all ${chartType === 'area' ? activeIconBtn : inactiveBtn}`} title={t('areaChart')}>
                 <Activity size={16} />
              </button>
              <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-lg transition-all ${chartType === 'bar' ? activeIconBtn : inactiveBtn}`} title={t('barChart')}>
                 <BarChart2 size={16} />
              </button>
              <button onClick={() => setChartType('line')} className={`p-1.5 rounded-lg transition-all ${chartType === 'line' ? activeIconBtn : inactiveBtn}`} title={t('lineChart')}>
                 <LineChartIcon size={16} />
              </button>
           </div>

           <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
             <button onClick={() => setMetric('created')} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${metric === 'created' ? activeBtn : inactiveBtn}`}>
                {t('created')}
             </button>
             <button onClick={() => setMetric('due')} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${metric === 'due' ? activeBtn : inactiveBtn}`}>
                {t('due')}
             </button>
             <button onClick={() => setMetric('comparison')} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${metric === 'comparison' ? activeBtn : inactiveBtn}`}>
                {t('comparison')}
             </button>
           </div>

           <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
              <button onClick={() => onRangeChange('weekly')} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${timeRange === 'weekly' ? activeBtn : inactiveBtn}`}>
                 {t('weekly')}
              </button>
              <button onClick={() => onRangeChange('monthly')} className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${timeRange === 'monthly' ? activeBtn : inactiveBtn}`}>
                 {t('monthly')}
              </button>
           </div>
        </div>
      </div>
      
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
           {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
</file>

<file path="src/components/layout/header/HeaderClock.tsx">
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useApp } from '../../../context/AppContext';


export const HeaderClock: React.FC = () => {
  const { state } = useApp();
  const [date, setDate] = useState(new Date());
  
  const dateLocale = state.language === 'vi' ? 'vi-VN' : 'en-US';

  
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden sm:flex flex-col justify-center min-w-[140px] md:min-w-[180px]">
      <h1 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
        <span className="xl:hidden">{date.toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric' })}</span>
        <span className="hidden xl:inline">{date.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </h1>
      <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400">
          <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary-500" />
          <span>
            <span className="xl:hidden">{date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="hidden xl:inline">{date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </span>
      </div>
    </div>
  );
};
</file>

<file path="src/components/layout/header/HeaderControls.tsx">
import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Sun, Moon, Bell, PanelLeft, Menu } from 'lucide-react';


export const HeaderControls: React.FC = () => {
  const { state, actions } = useApp();
  const notificationsCount = state.notifications.filter(n => !n.read).length;

  return (
    <>
        <button 
          onClick={() => actions.setDarkMode(!state.darkMode)}
          className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm"
        >
          {state.darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button 
          onClick={() => actions.setShowNotifications(!state.showNotifications)}
          className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl md:rounded-2xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all relative shadow-sm"
        >
          <Bell size={20} />
          {notificationsCount > 0 && (
            <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-dark-surface animate-pulse"></span>
          )}
        </button>
    </>
  );
};


export const SidebarToggle: React.FC = () => {
    const { state, actions } = useApp();
    return (
        <>
            <button onClick={() => actions.setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-colors">
                <Menu size={24} />
            </button>

            <button 
                onClick={() => actions.setIsDesktopSidebarOpen(!state.isDesktopSidebarOpen)} 
                className="hidden lg:flex p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                title="Toggle Sidebar"
            >
                <PanelLeft size={24} />
            </button>
        </>
    )
}
</file>

<file path="src/components/layout/header/HeaderLanguage.tsx">
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { ChevronDown, Check } from 'lucide-react';
import { Language } from '../../../types';


const FlagUK = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 30" className={className || "w-6 h-4 rounded shadow-sm object-cover"}>
    <rect width="60" height="30" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
  </svg>
);


const FlagVN = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 40" className={className || "w-6 h-4 rounded shadow-sm object-cover"}>
    <rect width="60" height="40" fill="#DA251D"/>
    <polygon
      points="30,8 33.5,19 45,19 35.5,26 39,37 30,30 21,37 24.5,26 15,19 26.5,19"
      fill="#FFFF00"
    />
  </svg>
);


export const HeaderLanguage: React.FC = () => {
  const { state, actions } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; Flag: typeof FlagUK }[] = [
    { code: 'en', label: 'English', Flag: FlagUK },
    { code: 'vi', label: 'Tiếng Việt', Flag: FlagVN },
  ];

  const currentLang = languages.find(l => l.code === state.language) || languages[0];

  
  useEffect(() => {
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 h-11 px-2 md:px-3 rounded-xl md:rounded-2xl bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm group"
          title="Switch Language"
        >
          <currentLang.Flag className="w-6 h-4 rounded-sm shadow-sm object-cover" />
          <span className="hidden md:inline text-sm font-bold">{currentLang.label}</span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-slate-100 dark:border-dark-border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <div className="p-1.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      actions.setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${state.language === lang.code 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <lang.Flag className="w-5 h-3.5 rounded-sm shadow-sm" />
                      <span>{lang.label}</span>
                    </div>
                    {state.language === lang.code && <Check size={14} />}
                  </button>
                ))}
              </div>
          </div>
        )}
    </div>
  );
};
</file>

<file path="src/components/layout/Header.tsx">
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

import { HeaderClock } from './header/HeaderClock';
import { HeaderLanguage } from './header/HeaderLanguage';
import { HeaderControls, SidebarToggle } from './header/HeaderControls';


export const Header: React.FC = () => {
    const { state, actions } = useApp();
    const { t } = state;

    return (
        <header className="h-16 px-4 md:px-6 xl:px-8 flex items-center justify-between sticky top-0 z-30 bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border transition-all">
            <div className="flex items-center gap-4">
                <SidebarToggle />
                <HeaderClock />
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                <HeaderLanguage />
                <HeaderControls />

                <Button onClick={() => actions.openNewTaskModal()} className="hidden md:flex" icon={<Plus size={16} />}>
                    {t('newTask')}
                </Button>
            </div>
        </header>
    );
};
</file>

<file path="src/components/layout/Sidebar.tsx">
import React from 'react';
import { useApp } from '../../context/AppContext';
import {
    LayoutDashboard, Kanban, List, Users, LogOut, Folder
} from 'lucide-react';
import { NAV_CONFIG } from '../../constants';
import { ViewMode } from '../../types';


const ICON_MAP = {
    dashboard: LayoutDashboard,
    projects: Folder,
    folder: Folder,
    kanban: Kanban,
    list: List,
    team: Users,
};


const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
        <path d="M7 4H17M7 4V20M7 11H15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
);


export const Sidebar: React.FC = () => {
    const { state, actions } = useApp();
    const { activeTab, user, isSidebarOpen, isDesktopSidebarOpen, t } = state;
    const { setActiveTab, handleLogout, setIsSidebarOpen, setProfileModalOpen } = actions;

    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
        fixed lg:static inset-y-0 left-0 bg-slate-50/50 dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border z-50
        flex flex-col transition-all duration-300 ease-in-out overflow-hidden
        ${isSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'}
        ${isDesktopSidebarOpen ? 'lg:w-[260px]' : 'lg:w-0 lg:border-none'}
      `}>
                <div className="p-6 h-20 flex items-center min-w-[260px]">
                    <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                            <LogoIcon />
                        </div>
                        <span className="font-logo font-bold text-xl tracking-tight text-brand dark:text-brand-bright">
                            FASTBOARD
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar min-w-[260px]">
                    <p className="px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('mainMenu')}</p>
                    {NAV_CONFIG.map(item => {
                        const Icon = ICON_MAP[item.iconId as keyof typeof ICON_MAP] || Folder;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as ViewMode); setIsSidebarOpen(false); }}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group whitespace-nowrap
                  ${isActive
                                        ? 'bg-white dark:bg-white/10 text-primary-700 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-white/10'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                    }
                `}
                            >
                                <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} />
                                {t(item.id as any)}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto min-w-[260px] border-t border-slate-200 dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                            onClick={() => setProfileModalOpen(true)}
                        >
                            <img src={user.avatar} alt="User" className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleLogout()}
                            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 transition-all"
                            title={t('logout')}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};
</file>

<file path="src/components/member-modal/MemberForm.tsx">
import React, { useState, useRef } from 'react';
import { MemberFormProps, User } from '../../types';
import { Camera, User as UserIcon, Mail, Shield, Link, Briefcase } from 'lucide-react';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';


export const MemberForm: React.FC<MemberFormProps> = ({ member, onSave, onClose }) => {
  const { state } = useApp();
  const { t } = state;
  const [name, setName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>(member?.role || 'MEMBER');
  const [jobRole, setJobRole] = useState(member?.jobRole || '');
  
  
  const getInitialAvatar = () => {
      if (member?.avatar) return member.avatar;
      const seed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };
  
  const [avatar, setAvatar] = useState(getInitialAvatar());
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  
  const handleRandomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: member?.id || Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      jobRole,
      avatar
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
              
        <div className="flex flex-col items-center justify-center mb-6 gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img src={avatar} alt="Avatar Preview" className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-700 shadow-md object-cover bg-slate-50" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
            </div>
            </div>
            <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
            />
            <div className="flex gap-2">
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-primary-600 font-bold hover:underline"
            >
                {t('uploadImage')}
            </button>
            <span className="text-xs text-slate-300">|</span>
            <button 
                type="button" 
                onClick={handleRandomizeAvatar}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            >
                {t('randomize')}
            </button>
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('fullName')}</label>
            <div className="relative">
            <UserIcon size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                placeholder="e.g. John Doe"
            />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('emailAddress')}</label>
            <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                placeholder="john@example.com"
            />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('accessLevel')}</label>
                <div className="relative">
                <Shield size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <select 
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium appearance-none"
                >
                    <option value="MEMBER">{t('member')}</option>
                    <option value="ADMIN">{t('admin')}</option>
                </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('jobRole')}</label>
                <div className="relative">
                <Briefcase size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                    type="text" 
                    value={jobRole}
                    onChange={e => setJobRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                    placeholder="e.g. Designer"
                />
                </div>
            </div>
        </div>
        
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('avatarUrl')}</label>
            <div className="relative">
            <Link size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input 
                type="text" 
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                placeholder="https://..."
            />
            </div>
        </div>

        <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" variant="primary" className="flex-1">{t('saveMember')}</Button>
        </div>
    </form>
  );
};
</file>

<file path="src/components/modals/ModalManager.tsx">
import React from 'react';
import { useApp } from '../../context/AppContext';
import { TaskModal } from '../TaskModal';
import { ProfileModal } from '../ProfileModal';
import { MemberModal } from '../MemberModal';
import { ProjectModal } from '../ProjectModal';


export const ModalManager: React.FC = () => {
  const { state, actions } = useApp();

  return (
    <>
      <TaskModal 
        isOpen={state.isTaskModalOpen}
        onClose={() => actions.setTaskModalOpen(false)}
        task={state.editingTask}
        projects={state.projects}
        users={state.users}
        currentUser={state.user}
        onSave={actions.handleTaskSave}
        onDelete={actions.handleTaskDelete}
        defaultStatus={state.newTaskStatus}
      />

      <ProfileModal 
         isOpen={state.isProfileModalOpen}
         onClose={() => actions.setProfileModalOpen(false)}
         user={state.user}
         onUpdate={actions.handleProfileUpdate}
      />

      <MemberModal 
         isOpen={state.isMemberModalOpen}
         onClose={() => actions.setMemberModalOpen(false)}
         member={state.editingMember}
         onSave={actions.handleMemberSave}
      />

      <ProjectModal 
         isOpen={state.isProjectModalOpen}
         onClose={() => actions.setProjectModalOpen(false)}
         project={state.editingProject}
         users={state.users}
         onSave={actions.handleProjectSave}
      />
    </>
  );
};
</file>

<file path="src/components/notifications/NotificationsFooter.tsx">
import React from 'react';
import { NotificationsFooterProps } from '../../types';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';


export const NotificationsFooter: React.FC<NotificationsFooterProps> = ({ onViewAll }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-3xl border-t border-slate-100 dark:border-slate-700 text-center">
         <Button onClick={onViewAll} variant="ghost" size="sm" className="w-full text-xs text-slate-500">{t('viewAllActivity')}</Button>
    </div>
  );
};
</file>

<file path="src/components/notifications/NotificationsHeader.tsx">
import React from 'react';
import { NotificationsHeaderProps } from '../../types';
import { Check, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';


export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({ unreadCount, onMarkAllRead, onClose }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-3xl">
        <div>
           <h3 className="font-bold text-slate-900 dark:text-white">{t('notifications')}</h3>
           <p className="text-xs text-slate-600 dark:text-slate-300">{unreadCount} {t('unread')}</p>
        </div>
        <div className="flex gap-1">
            <button 
                onClick={onMarkAllRead}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                title={t('markAllRead')}
            >
                <Check size={16} />
            </button>
            <button 
                onClick={onClose}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
                <X size={16} />
            </button>
        </div>
      </div>
  );
};
</file>

<file path="src/components/notifications/NotificationsList.tsx">
import React from 'react';
import { NotificationsListProps, Notification } from '../../types';
import { User, Clock, AlertCircle, MessageSquare } from 'lucide-react';


export const NotificationsList: React.FC<NotificationsListProps> = ({ notifications, onMarkRead }) => {
  
  
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ASSIGNMENT': return <User size={16} className="text-blue-500" />;
      case 'STATUS_CHANGE': return <Clock size={16} className="text-amber-500" />;
      case 'DUE_DATE': return <AlertCircle size={16} className="text-rose-500" />;
      default: return <MessageSquare size={16} className="text-emerald-500" />;
    }
  };

  return (
    <div className="overflow-y-auto custom-scrollbar">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            onClick={() => onMarkRead(notification.id)}
            className={`
              p-4 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50
              ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
            `}
          >
            <div className="flex gap-3">
              <div className={`
                mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${!notification.read ? 'bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}
              `}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-0.5">
                    <h4 className={`text-sm ${!notification.read ? 'font-bold text-slate-800 dark:text-slate-200' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                    {notification.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
    </div>
  );
};
</file>

<file path="src/components/project-detail/ProjectHeader.tsx">
import React from 'react';
import { ProjectHeaderProps } from '../../types';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';


export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onBack, onEdit, onDelete }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="mb-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold mb-4 transition-colors">
         <ArrowLeft size={16} /> {t('backToProjects')}
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl font-bold text-brand dark:text-brand-bright tracking-tight">{project.name}</h1>
               <Badge variant={project.status === 'ACTIVE' ? 'success' : 'neutral'}>{t(`projectStatus_${project.status}` as any)}</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">{project.description}</p>
         </div>
         
         <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onEdit} icon={<Edit size={14} />}>{t('edit')}</Button>
            <Button variant="danger" size="sm" onClick={onDelete} icon={<Trash2 size={14} />}>{t('delete')}</Button>
         </div>
      </div>
    </div>
  );
};
</file>

<file path="src/components/project-detail/ProjectStats.tsx">
import React from 'react';
import { ProjectStatsProps } from '../../types';
import { BarChart3, CheckCircle2, Clock } from 'lucide-react';


export const ProjectStats: React.FC<ProjectStatsProps> = ({ progress, completed, total, inProgress, members }) => {
  return (
    <div className="flex items-center gap-8 mt-6 pb-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <BarChart3 size={24} />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{progress}%</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={24} />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{completed}/{total}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
              <Clock size={24} />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{inProgress}</p>
           </div>
        </div>

        <div className="flex -space-x-3 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
            {members.map(m => (
                <img key={m.id} src={m.avatar} title={m.name} alt={m.name} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900" />
            ))}
            {members.length === 0 && <span className="text-sm text-slate-400 italic">No members assigned</span>}
        </div>
    </div>
  );
};
</file>

<file path="src/components/project-modal/ProjectForm.tsx">
import React, { useState } from 'react';
import { ProjectFormProps, Project } from '../../types';
import { Briefcase, FileText, Activity, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';


export const ProjectForm: React.FC<ProjectFormProps> = ({ project, users, onSave, onClose }) => {
  const { state } = useApp();
  const { t } = state;
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED' | 'COMPLETED'>(project?.status || 'ACTIVE');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(project?.members || []);

  
  const handleToggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedMembers(prev => [...prev, userId]);
    }
  };

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: project?.id || Math.random().toString(36).substr(2, 9),
      name,
      description,
      status,
      members: selectedMembers,
      progress: project?.progress || 0
    };
    onSave(newProject);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('projectName')}</label>
            <div className="relative">
            <Briefcase size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                placeholder={t('projectPlaceholder')}
            />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('projectDescription')}</label>
            <div className="relative">
            <FileText size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                placeholder={t('projectDescPlaceholder')}
            />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{t('status')}</label>
            <div className="relative">
            <Activity size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <select 
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium appearance-none"
            >
                <option value="ACTIVE">{t('projectStatus_ACTIVE')}</option>
                <option value="COMPLETED">{t('projectStatus_COMPLETED')}</option>
                <option value="ARCHIVED">{t('projectStatus_ARCHIVED')}</option>
            </select>
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
            <Users size={14} /> {t('assignTeamMembers')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map(u => (
                <div 
                    key={u.id}
                    onClick={() => handleToggleMember(u.id)}
                    className={`
                    flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all
                    ${selectedMembers.includes(u.id) 
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-500/50' 
                        : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200'
                    }
                    `}
                >
                    <div className="relative">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full" />
                        {selectedMembers.includes(u.id) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full border border-white"></div>
                        )}
                    </div>
                    <span className={`text-sm font-medium ${selectedMembers.includes(u.id) ? 'text-primary-700 dark:text-primary-300' : 'text-slate-600 dark:text-slate-300'}`}>
                        {u.name}
                    </span>
                </div>
            ))}
            </div>
        </div>

        <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" variant="primary" className="flex-1">
            {project ? t('saveProject') : t('createProject')}
            </Button>
        </div>
    </form>
  );
};
</file>

<file path="src/components/projects-view/ProjectCardFooter.tsx">
import React from 'react';
import { ProjectCardFooterProps } from '../../types';
import { CheckCircle2 } from 'lucide-react';


export const ProjectCardFooter: React.FC<ProjectCardFooterProps> = ({ members, completedTasks, totalTasks }) => {
    return (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex -space-x-2">
                {members.slice(0, 4).map(m => (
                    <img 
                        key={m.id} 
                        src={m.avatar} 
                        alt={m.name} 
                        title={m.name}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" 
                    />
                ))}
                {members.length > 4 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        +{members.length - 4}
                    </div>
                )}
                {members.length === 0 && <span className="text-xs text-slate-400 italic mt-1.5">No members</span>}
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 size={14} className={completedTasks === totalTasks && totalTasks > 0 ? 'text-emerald-500' : 'text-slate-400'} />
                <span className="text-slate-700 dark:text-slate-300">{completedTasks}/{totalTasks} Tasks</span>
            </div>
        </div>
    );
};
</file>

<file path="src/components/projects-view/ProjectCardHeader.tsx">
import React from 'react';
import { ProjectCardHeaderProps } from '../../types';
import { Badge } from '../ui/Badge';
import { Edit, Trash2 } from 'lucide-react';


export const ProjectCardHeader: React.FC<ProjectCardHeaderProps> = ({ status, onEdit, onDelete }) => {
    
    const getStatusColor = (s: string) => {
        switch(s) {
            case 'ACTIVE': return 'success';
            case 'COMPLETED': return 'primary';
            case 'ARCHIVED': return 'neutral';
            default: return 'neutral';
        }
    };

    return (
        <div className="flex justify-between items-start mb-4 mt-2">
            <Badge variant={getStatusColor(status)}>
                {status}
            </Badge>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <button onClick={onEdit} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                    <Edit size={16} />
                </button>
                <button 
                    onClick={onDelete} 
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
</file>

<file path="src/components/projects-view/ProjectCardProgress.tsx">
import React from 'react';
import { ProjectCardProgressProps } from '../../types';


export const ProjectCardProgress: React.FC<ProjectCardProgressProps> = ({ progress }) => {
    return (
        <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                <span>Progress</span>
                <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                        progress === 100 ? 'bg-emerald-500' : 'bg-primary-500'
                    }`} 
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
</file>

<file path="src/components/task-modal/TaskComments.tsx">
import React from 'react';
import { TaskCommentsProps } from '../../types';
import { Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';


export const TaskComments: React.FC<TaskCommentsProps> = ({
  comments, users, newComment, setNewComment, onAdd
}) => {
  const { state } = useApp();
  const { t } = state;

  return (
    <div className="flex flex-col h-[400px] animate-in fade-in duration-300">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-10">{t('noComments')}</p>
        ) : (
          comments.map(comment => {
            const author = users.find(u => u.id === comment.userId);
            return (
              <div key={comment.id} className="flex gap-3">
                 <img src={author?.avatar} alt={author?.name} className="w-8 h-8 rounded-full bg-slate-200" />
                 <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{author?.name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{comment.text}</p>
                 </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={onAdd} className="relative">
        <input 
          type="text" 
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={t('typeComment')}
          className="w-full pr-12 pl-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
</file>

<file path="src/components/task-modal/TaskDetails.tsx">
import React from 'react';
import { Sparkles } from 'lucide-react';
import { TaskDetailsProps, TaskStatus, Priority } from '../../types';
import { useApp } from '../../context/AppContext';


export const TaskDetails: React.FC<TaskDetailsProps> = ({
  title, setTitle, description, setDescription,
  status, setStatus, priority, setPriority,
  projectId, setProjectId, assigneeId, setAssigneeId,
  dueDate, setDueDate, projects, users, isGenerating,
  onAutoPriority, onSuggestSubtasks
}) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex justify-between items-center mb-1">
           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('taskTitle')}</label>
           <button
              type="button"
              onClick={onAutoPriority}
              disabled={isGenerating || !title.trim()}
              className="text-xs flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Sparkles size={12} /> {t('autoPriority')}
           </button>
        </div>
        <input 
          type="text" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('taskPlaceholder')}
          className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('status')}</label>
           <select 
              value={status} 
              onChange={e => setStatus(e.target.value as TaskStatus)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
           >
             {Object.values(TaskStatus).map(s => <option key={s} value={s}>{t(s as any)}</option>)}
           </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('priority')}</label>
           <select 
              value={priority} 
              onChange={e => setPriority(e.target.value as Priority)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
           >
             {Object.values(Priority).map(p => <option key={p} value={p}>{t(p as any)}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('projects')}</label>
           <select 
              value={projectId} 
              onChange={e => setProjectId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
           >
             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('assignee')}</label>
           <div className="flex items-center gap-2">
             <select 
                value={assigneeId} 
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
             >
               {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
             </select>
           </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('dueDate')}</label>
        <input 
          type="date" 
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
        />
      </div>

      <div>
         <div className="flex justify-between items-center mb-1">
           <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('description')}</label>
           <button
              type="button"
              onClick={onSuggestSubtasks}
              disabled={isGenerating || !title.trim()}
              className="text-xs flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Sparkles size={12} /> {t('suggestSubtasks')}
           </button>
         </div>
         <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder={t('descPlaceholder')}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
         />
      </div>
    </div>
  );
};
</file>

<file path="src/components/task-modal/TaskModalFooter.tsx">
import React from 'react';
import { Trash2 } from 'lucide-react';
import { TaskModalFooterProps } from '../../types';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';


export const TaskModalFooter: React.FC<TaskModalFooterProps> = ({ task, onDelete, onClose, onSave }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-2xl">
       <div>
           {task && onDelete && (
               <Button variant="danger" onClick={onDelete} icon={<Trash2 size={16} />}>
                   {t('delete')}
               </Button>
           )}
       </div>
       <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-xl transition-all">
                {t('cancel')}
            </button>
            <button onClick={onSave} className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-500/20 transition-all">
                {task ? t('saveChanges') : t('createTask')}
            </button>
       </div>
    </div>
  );
};
</file>

<file path="src/components/task-modal/TaskModalHeader.tsx">
import React from 'react';
import { X } from 'lucide-react';
import { TaskModalHeaderProps } from '../../types';
import { useApp } from '../../context/AppContext';


export const TaskModalHeader: React.FC<TaskModalHeaderProps> = ({ task, onClose }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          {task ? t('edit') : t('newTask')}
        </h2>
        <div className="flex items-center gap-3">
           <p className="text-sm text-slate-500 dark:text-slate-400">
              {task ? `ID: ${task.id}` : t('newItemPlaceholder')}
           </p>
        </div>
      </div>
      <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
        <X size={20} />
      </button>
    </div>
  );
};
</file>

<file path="src/components/task-modal/TaskModalTabs.tsx">
import React from 'react';
import { TaskModalTabsProps } from '../../types';
import { useApp } from '../../context/AppContext';


export const TaskModalTabs: React.FC<TaskModalTabsProps> = ({ activeTab, setActiveTab, subtasksCount, commentsCount }) => {
  const { state } = useApp();
  const { t } = state;
  return (
    <div className="flex border-b border-slate-100 dark:border-slate-700 px-6">
      <button 
        onClick={() => setActiveTab('details')}
        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
      >
        {t('details')}
      </button>
      <button 
        onClick={() => setActiveTab('subtasks')}
        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'subtasks' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
      >
        {t('subtasks')} <span className="bg-slate-100 dark:bg-slate-700 text-xs px-1.5 py-0.5 rounded-full">{subtasksCount}</span>
      </button>
      <button 
        onClick={() => setActiveTab('comments')}
        className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'comments' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
      >
        {t('comments')} <span className="bg-slate-100 dark:bg-slate-700 text-xs px-1.5 py-0.5 rounded-full">{commentsCount}</span>
      </button>
    </div>
  );
};
</file>

<file path="src/components/task-modal/TaskSubtasks.tsx">
import React from 'react';
import { TaskSubtasksProps } from '../../types';
import { Plus, CheckSquare, Trash2, User as UserIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';


export const TaskSubtasks: React.FC<TaskSubtasksProps> = ({
  subtasks, users, onAdd, onUpdate, onDelete
}) => {
  const { state } = useApp();
  const { t } = state;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
       <div className="flex items-center justify-between mb-2">
         <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('checklist')}</h3>
         <button onClick={onAdd} className="text-xs flex items-center gap-1 text-primary-600 hover:bg-primary-50 px-2 py-1 rounded transition-colors">
           <Plus size={14} /> {t('addItem')}
         </button>
       </div>
       
       {subtasks.length === 0 && (
         <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm italic border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
           {t('newItemPlaceholder')}
         </div>
       )}

       <div className="space-y-2">
         {subtasks.map((st) => {
           const assignedUser = users.find(u => u.id === st.assigneeId);
           
           return (
             <div key={st.id} className="flex items-center gap-3 p-2 group hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
               <button 
                 onClick={() => onUpdate(st.id, { completed: !st.completed })}
                 className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${st.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-500'}`}
               >
                 {st.completed && <CheckSquare size={14} />}
               </button>
               <input 
                 type="text" 
                 value={st.title}
                 onChange={e => onUpdate(st.id, { title: e.target.value })}
                 className={`flex-1 bg-transparent border-none outline-none text-sm ${st.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}
               />
               
               <div className="relative group/assignee">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${assignedUser ? 'border-primary-200' : 'border-dashed border-slate-300 dark:border-slate-600'} overflow-hidden bg-white dark:bg-slate-800 cursor-pointer`}>
                      {assignedUser ? (
                        <img src={assignedUser.avatar} alt={assignedUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={14} className="text-slate-400" />
                      )}
                  </div>
                  <select 
                    value={st.assigneeId || ''}
                    onChange={(e) => onUpdate(st.id, { assigneeId: e.target.value || undefined })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="">{t('unassigned')}</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
               </div>

               <button onClick={() => onDelete(st.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                 <Trash2 size={16} />
               </button>
             </div>
           );
         })}
       </div>
    </div>
  );
};
</file>

<file path="src/components/ui/Badge.tsx">
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { BadgeProps } from '../../types';


export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className }) => {
    const variants = {
        primary: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-500/10 dark:text-primary-400 dark:border-primary-800',
        secondary: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800',
        warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800',
        danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800',
        neutral: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    };

    return (
        <span className={twMerge(
            "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide border",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};
</file>

<file path="src/components/ui/Button.tsx">
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ButtonProps } from '../../types';


export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    icon,
    ...props
}) => {

    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

    const variants = {
        primary: "bg-black hover:bg-neutral-800 text-white dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-white focus:ring-neutral-500 dark:focus:ring-primary-500",

        secondary: "bg-white dark:bg-dark-surface text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-white/5 focus:ring-slate-400 hover:border-slate-300",

        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:ring-slate-300",

        danger: "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 dark:text-rose-300 focus:ring-rose-500 border border-transparent hover:border-rose-200",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {icon && <span className="flex-shrink-0 transition-transform group-hover:scale-105">{icon}</span>}
            {children}
        </button>
    );
};
</file>

<file path="src/components/ui/Card.tsx">
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { CardProps } from '../../types';


export const Card: React.FC<CardProps> = ({
    children,
    className,
    noPadding = false,
    hoverEffect = false,
    ...props
}) => {
    return (
        <div
            className={twMerge(
                "bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border transition-all duration-200",
                !noPadding && "p-5",
                hoverEffect && "hover:border-slate-300 dark:hover:border-slate-600",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
</file>

<file path="src/components/ui/ErrorBoundary.tsx">
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../../types';


export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  
  handleReload = () => {
    window.location.reload();
  };

  
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Don't worry, your data is safe. It's just a rendering glitch.
            </p>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-left mb-8 overflow-auto max-h-32">
                 <code className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                     {this.state.error?.message}
                 </code>
            </div>
            <Button onClick={this.handleReload} icon={<RefreshCcw size={18} />} className="w-full">
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
</file>

<file path="src/components/ui/FilterBar.tsx">
import React from 'react';
import { FilterBarProps, Priority } from '../../types';
import { Search, Filter, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';


export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters, users }) => {
    const { state } = useApp();
    const { t } = state;
    const hasActiveFilters = filters.priority !== 'ALL' || filters.assigneeId !== 'ALL' || filters.search !== '';

    
    const clearFilters = () => {
        setFilters({ search: '', priority: 'ALL', assigneeId: 'ALL' });
    };

    return (
        <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm">

            <div className="flex items-center flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2 border border-transparent focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all">
                <Search size={16} className="text-slate-500 dark:text-slate-400 mr-2" />
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder={t('filterPlaceholder')}
                    className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
                />
                {filters.search && (
                    <button onClick={() => setFilters({ ...filters, search: '' })} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"><X size={14} /></button>
                )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                <div className="relative group min-w-[120px]">
                    <Filter size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/10 cursor-pointer appearance-none hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <option value="ALL">{t('allPriorities')}</option>
                        {Object.values(Priority).map(p => <option key={p} value={p}>{t(p as any)}</option>)}
                    </select>
                </div>

                <div className="relative group min-w-[140px]">
                    <select
                        value={filters.assigneeId}
                        onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}
                        className="w-full pl-3 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/10 cursor-pointer appearance-none hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <option value="ALL">{t('allMembers')}</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors whitespace-nowrap"
                    >
                        {t('clearFilters')}
                    </button>
                )}
            </div>
        </div>
    );
};
</file>

<file path="src/components/ui/ModalHeader.tsx">
import React from 'react';
import { X } from 'lucide-react';
import { ModalHeaderProps } from '../../types';


export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle, onClose }) => {
    return (
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {title}
                </h2>
                {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>
    );
};
</file>

<file path="src/components/ui/Skeleton.tsx">
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { SkeletonProps } from '../../types';


export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1, variant = 'rect' }) => {
    const baseStyles = "animate-pulse bg-slate-200 dark:bg-slate-700/50";

    const variantStyles = {
        rect: "rounded-xl",
        circle: "rounded-full",
        text: "rounded h-4"
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={twMerge(baseStyles, variantStyles[variant], className)}
                />
            ))}
        </>
    );
};
</file>

<file path="src/components/ui/Toast.tsx">
import React, { useEffect } from 'react';
import { ToastProps } from '../../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';


export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};


const ToastItem: React.FC<{ id: string; type: 'success' | 'error' | 'info'; message: string; onRemove: () => void }> = ({
  id, type, message, onRemove 
}) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-200',
    error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200'
  };

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-rose-500" />,
    info: <Info size={18} className="text-blue-500" />
  };

  return (
    <div className={`
       flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md
       animate-in slide-in-from-right-full duration-300
       ${styles[type]}
    `}>
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onRemove} className="ml-2 hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  );
};
</file>

<file path="src/components/views/ViewManager.tsx">
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Dashboard } from '../Dashboard';
import { KanbanBoard } from '../KanbanBoard';
import { TaskListView } from '../TaskListView';
import { TeamView } from '../TeamView';
import { ProjectsView } from '../ProjectsView';
import { ProjectDetailView } from '../ProjectDetailView';
import { MemberDetailView } from '../MemberDetailView';


export const ViewManager: React.FC = () => {
  const { state, actions } = useApp();
  
  switch (state.activeTab) {
    case 'dashboard':
      return <div className="max-w-[1600px] mx-auto"><Dashboard tasks={state.tasks} projects={state.projects} onNavigate={actions.setActiveTab} /></div>;
      
    case 'projects':
      if (state.selectedProject) {
        return (
           <div className="max-w-[1600px] mx-auto">
             <ProjectDetailView 
                project={state.selectedProject}
                tasks={state.tasks}
                users={state.users}
                onBack={actions.handleBackToProjects}
                onEditProject={actions.openEditProjectModal}
                onDeleteProject={actions.handleProjectDelete}
                onUpdateTaskStatus={actions.handleUpdateTaskStatus}
                onEditTask={actions.openEditTaskModal}
                onCreateTask={actions.openNewTaskModal}
             />
           </div>
        );
      }
      return (
        <div className="max-w-[1600px] mx-auto">
          <ProjectsView 
             projects={state.projects}
             tasks={state.tasks}
             users={state.users}
             onCreateProject={actions.openNewProjectModal}
             onEditProject={actions.openEditProjectModal}
             onDeleteProject={actions.handleProjectDelete}
             onProjectClick={actions.handleProjectClick}
          />
        </div>
      );

    case 'kanban':
      return (
        <div className="flex flex-col animate-fade-in min-h-full">
           <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Project Board</h2>
           </div>
           <div className="flex-1">
             <KanbanBoard 
                tasks={state.tasks} 
                projects={state.projects}
                filters={state.filters}
                setFilters={actions.setFilters}
                users={state.users}
                onUpdateTaskStatus={actions.handleUpdateTaskStatus}
                onEditTask={actions.openEditTaskModal}
                onCreateTask={actions.openNewTaskModal}
             />
           </div>
        </div>
      );

    case 'list':
      return (
        <div className="max-w-[1600px] mx-auto animate-fade-in">
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">Task List</h2>
           <TaskListView 
              tasks={state.tasks} 
              users={state.users}
              projects={state.projects}
              filters={state.filters}
              setFilters={actions.setFilters}
              onEditTask={actions.openEditTaskModal}
              onUpdateStatus={actions.handleUpdateTaskStatus}
           />
        </div>
      );

    case 'team':
      if (state.selectedMember) {
        return (
          <div className="max-w-[1600px] mx-auto">
            <MemberDetailView 
              member={state.selectedMember}
              tasks={state.rawTasks}
              projects={state.projects}
              onBack={actions.handleBackToTeam}
              onEditMember={actions.openEditMemberModal}
              onDeleteMember={(id) => {
                  actions.handleDeleteMember(id);
                  actions.handleBackToTeam();
              }}
              onEditTask={actions.openEditTaskModal}
              onUpdateTaskStatus={actions.handleUpdateTaskStatus}
            />
          </div>
        );
      }
      return (
         <div className="max-w-[1600px] mx-auto">
           <TeamView 
             currentUser={state.user}
             users={state.users} 
             tasks={state.rawTasks} 
             onAddMember={actions.openNewMemberModal}
             onEditMember={actions.openEditMemberModal}
             onDeleteMember={actions.handleDeleteMember}
             onMemberClick={actions.handleMemberClick}
           />
         </div>
      );

    default:
      return null;
  }
};
</file>

<file path="src/components/Dashboard.tsx">
import React from 'react';
import { DashboardProps } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';
import { useApp } from '../context/AppContext';

import { DashboardStats } from './dashboard/DashboardStats';
import { ProductivityCard } from './dashboard/ProductivityCard';
import { TaskTrendChart } from './dashboard/TaskTrendChart';
import { StatusDonutChart } from './dashboard/StatusDonutChart';
import { RecentActivity } from './dashboard/RecentActivity';
import { Skeleton } from './ui/Skeleton';


export const Dashboard: React.FC<DashboardProps> = ({ tasks, projects, onNavigate }) => {
  const { state } = useApp();
  const { t, isLoading } = state;
  const { 
    timeRange, 
    setTimeRange, 
    statusData, 
    chartData, 
    productivityStats, 
    completedCount 
  } = useDashboardData(tasks);

  if (isLoading) {
      return (
        <div className="space-y-8 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32 md:col-span-2" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Skeleton className="h-[400px] lg:col-span-2" />
                <Skeleton className="h-[400px]" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-20 mb-3" count={3} />
            </div>
        </div>
      )
  }

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStats 
          projectsCount={projects.length}
          completedTasksCount={completedCount}
          onNavigateProjects={() => onNavigate && onNavigate('projects')}
        />
        <ProductivityCard stats={productivityStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TaskTrendChart 
          data={chartData} 
          timeRange={timeRange} 
          onRangeChange={setTimeRange} 
        />
        <StatusDonutChart 
          data={statusData} 
          totalTasks={tasks.length} 
        />
      </div>

      <RecentActivity 
        tasks={tasks} 
        onViewAll={() => onNavigate && onNavigate('list')}
      />
    </div>
  );
};
</file>

<file path="src/components/KanbanBoard.tsx">
import React, { useState } from 'react';
import { KanbanBoardProps, TaskStatus, Priority } from '../types';
import { Plus, CheckSquare, Clock, Folder, CheckCircle2 } from 'lucide-react';
import { Badge } from './ui/Badge';
import { FilterBar } from './ui/FilterBar';
import { KANBAN_COLUMNS } from '../constants';
import { useApp } from '../context/AppContext';


export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks, 
  projects,
  filters,
  setFilters,
  users,
  onUpdateTaskStatus,
  onEditTask,
  onCreateTask 
}) => {
  const { state } = useApp();
  const { t } = state;
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50', 'scale-95');
  };

  
  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
    setDraggedTaskId(null);
  };

  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  
  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      onUpdateTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  
  const getProjectName = (projectId: string) => {
    return projects?.find(p => p.id === projectId)?.name;
  };

  return (
    <div className="flex flex-col h-full">
       <div className="mb-4">
          <FilterBar filters={filters} setFilters={setFilters} users={users} />
       </div>
       
       <div className="flex items-start overflow-x-auto pb-6 gap-6 custom-scrollbar px-1 min-h-[500px]">
        {KANBAN_COLUMNS.map((column) => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            
            return (
            <div 
                key={column.id}
                className={`
                    flex-shrink-0 w-[340px] flex flex-col rounded-xl ${column.bg} 
                    border border-slate-200 dark:border-stone-800 shadow-sm
                    transition-all relative overflow-hidden
                `}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
            >
                <div className={`p-5 flex items-center justify-between border-b ${column.headerBorder} bg-transparent z-10`}>
                  <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${column.dotColor} shadow-sm ring-1 ring-white dark:ring-stone-800`}></div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t(column.id as any)}</h3>
                      <span className="bg-slate-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-600 dark:text-stone-300">
                      {columnTasks.length}
                      </span>
                  </div>
                  <button 
                      onClick={() => onCreateTask(column.id)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-stone-800 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all"
                  >
                      <Plus size={18} />
                  </button>
                </div>

                <div 
                  className="p-4 space-y-3 flex-1 min-h-[600px] bg-transparent"
                >
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onEditTask(task)}
                      className={`
                          bg-white dark:bg-stone-800 p-5 rounded-lg
                          shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-stone-700
                          cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-0.5 
                          transition-all duration-200 group relative
                      `}
                    >
                      <div className="flex justify-between items-start mb-3">
                          <Badge variant={
                              task.priority === Priority.HIGH ? 'danger' : 
                              task.priority === Priority.MEDIUM ? 'warning' : 'secondary'
                          }>
                              {t(task.priority as any)}
                          </Badge>
                          {projects && getProjectName(task.projectId) && (
                          <span className="text-[10px] font-medium text-brand dark:text-brand-bright flex items-center gap-1 bg-slate-50 dark:bg-stone-900 px-2 py-1 rounded-md max-w-[120px] truncate border border-slate-100 dark:border-stone-700">
                              <Folder size={10} />
                              {getProjectName(task.projectId)}
                          </span>
                          )}
                      </div>
                      
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{task.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">{task.description}</p>
                      
                      <div className="flex items-center gap-3 mb-4">
                          {task.subtasks.length > 0 && (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-stone-900 px-2 py-1 rounded-md">
                                  <CheckCircle2 size={12} />
                                  <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
                              </div>
                          )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-stone-700/50">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <Clock size={14} />
                          <span className={new Date(task.dueDate) < new Date() ? 'text-rose-600 dark:text-rose-400' : ''}>
                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                          </span>
                          </div>
                          {task.assigneeId && (
                          <div className="relative">
                              <img src={`https://picsum.photos/seed/${task.assigneeId}/40/40`} alt="Avatar" className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-stone-800 shadow-sm object-cover" />
                          </div>
                          )}
                      </div>
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center opacity-30 pointer-events-none mt-10">
                          <div className="w-full border-b border-slate-200 dark:border-stone-800 mb-8"></div>
                          <div className="w-full border-b border-slate-200 dark:border-stone-800 mb-8"></div>
                          <div className="w-full border-b border-slate-200 dark:border-stone-800 mb-8"></div>
                          <p className="text-sm font-bold absolute text-slate-500 dark:text-slate-400">{t('noTasksFound')}</p>
                      </div>
                  )}
                </div>
            </div>
            );
        })}
       </div>
    </div>
  );
};
</file>

<file path="src/components/MemberDetailView.tsx">
import React, { useState, useMemo } from 'react';
import { MemberDetailViewProps, TaskStatus, FilterState } from '../types';
import { ArrowLeft, Edit, Mail, Briefcase, CheckCircle2, Clock, Calendar, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { TaskListView } from './TaskListView';
import { useApp } from '../context/AppContext';


export const MemberDetailView: React.FC<MemberDetailViewProps> = ({
  member, tasks, projects, onBack, onEditMember, onDeleteMember, onEditTask, onUpdateTaskStatus 
}) => {
  const { state } = useApp();
  const { t } = state;
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: 'ALL',
    assigneeId: 'ALL'
  });

  
  const memberTasks = useMemo(() => {
    
    return tasks.filter(t => {
        if (t.assigneeId !== member.id) return false;

        const searchMatch = 
          t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
          t.description.toLowerCase().includes(filters.search.toLowerCase());
        
        if (!searchMatch) return false;

        if (filters.priority !== 'ALL' && t.priority !== filters.priority) return false;

        return true;
    });
  }, [tasks, member.id, filters]);
  
  
  const allMemberTasks = tasks.filter(t => t.assigneeId === member.id);
  const totalTasks = allMemberTasks.length;
  const completedTasks = allMemberTasks.filter(t => t.status === TaskStatus.DONE).length;
  const inProgressTasks = allMemberTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const completedDurations = allMemberTasks
    .filter(task => task.status === TaskStatus.DONE && task.completedAt)
    .map(task => (new Date(task.completedAt!).getTime() - new Date(task.createdAt).getTime()) / 86_400_000)
    .filter(days => Number.isFinite(days) && days >= 0);
  const averageCompletionDays = completedDurations.length
    ? completedDurations.reduce((sum, days) => sum + days, 0) / completedDurations.length
    : null;
  
  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold mb-4 transition-colors">
            <ArrowLeft size={16} /> {t('backToTeam')}
        </button>
        
        <div className="flex flex-col xl:flex-row gap-8">
            <div className="xl:w-[350px] space-y-6 flex-shrink-0">
                <Card className="flex flex-col items-center text-center p-8">
                    <div className="relative mb-4">
                        <img src={member.avatar} alt={member.name} className="w-32 h-32 rounded-[2rem] object-cover shadow-lg border-4 border-white dark:border-slate-800 bg-white" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={16} className="text-white" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h1>
                    <p className="text-primary-600 font-semibold mb-4">{member.jobRole || t('member')}</p>
                    
                    <div className="flex gap-2 mb-6">
                        <Badge variant={member.role === 'ADMIN' ? 'primary' : 'secondary'}>{t(member.role === 'ADMIN' ? 'admin' : 'member')}</Badge>
                        <Badge variant="neutral">ID: {member.id.substring(0,6)}</Badge>
                    </div>

                    <div className="flex gap-3 mb-6 w-full">
                        <Button variant="secondary" className="flex-1" onClick={() => onEditMember(member)} icon={<Edit size={16} />}>
                            {t('editProfile')}
                        </Button>
                        <Button variant="danger" className="flex-1" onClick={() => { if(window.confirm(t('confirmDelete'))) onDeleteMember(member.id); }} icon={<Trash2 size={16} />}>
                            {t('delete')}
                        </Button>
                    </div>

                    <div className="w-full space-y-3 text-left">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                                <Mail size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">{t('emailAddress')}</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{member.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-500 flex items-center justify-center">
                                <Calendar size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase">{t('joined')}</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Oct 2023</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('performance')}</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm font-medium mb-1">
                                <span className="text-slate-600 dark:text-slate-300">{t('taskCompletion')}</span>
                                <span className="text-slate-900 dark:text-white">{completionRate}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{width: `${completionRate}%`}}></div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-2">
                             <div className="p-3 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/30">
                                 <span className="text-2xl font-bold text-primary-600 block">{totalTasks}</span>
                                 <span className="text-xs text-primary-500 font-semibold uppercase">{t('totalAssigned')}</span>
                             </div>
                             <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                 <span className="text-2xl font-bold text-emerald-600 block">{completedTasks}</span>
                                 <span className="text-xs text-emerald-500 font-semibold uppercase">{t('completedCount')}</span>
                             </div>
                             <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30">
                                 <span className="text-2xl font-bold text-amber-600 block">{inProgressTasks}</span>
                                 <span className="text-xs text-amber-500 font-semibold uppercase">{t('IN_PROGRESS')}</span>
                             </div>
                             <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                 <span className="text-2xl font-bold text-slate-600 dark:text-slate-400 block">{totalTasks - (completedTasks + inProgressTasks)}</span>
                                 <span className="text-xs text-slate-400 font-semibold uppercase">{t('pending')}</span>
                             </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="flex-1 space-y-6 min-w-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="flex items-center gap-4 bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-none">
                         <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Briefcase size={24} />
                         </div>
                         <div>
                            <p className="text-indigo-100 text-sm font-medium">{t('activeProjects')}</p>
                            <h3 className="text-3xl font-bold">
                                {projects.filter(p => p.members.includes(member.id)).length}
                            </h3>
                         </div>
                    </Card>
                    <Card className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                            <Clock size={24} />
                         </div>
                         <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('avgCompletionTime')}</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                              {averageCompletionDays === null ? '—' : averageCompletionDays.toFixed(1)}
                              {averageCompletionDays !== null && <span className="text-lg text-slate-400 font-normal ml-1">{t('days')}</span>}
                            </h3>
                         </div>
                    </Card>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-soft border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('assignedTasks')}</h3>
                        <Badge variant="neutral">{memberTasks.length} {t('tasks')}</Badge>
                    </div>
                    <div className="p-4">
                        <TaskListView 
                            tasks={memberTasks} 
                            users={[member]}
                            projects={projects}
                            filters={filters}
                            setFilters={setFilters} 
                            onEditTask={onEditTask}
                            onUpdateStatus={onUpdateTaskStatus}
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
</file>

<file path="src/components/MemberModal.tsx">
import React from 'react';
import { MemberModalProps } from '../types';
import { ModalHeader } from './ui/ModalHeader';
import { MemberForm } from './member-modal/MemberForm';
import { useApp } from '../context/AppContext';


export const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, member, onSave }) => {
  const { state } = useApp();
  const { t } = state;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        <ModalHeader 
            title={member ? t('editMember') : t('addTeamMember')}
            onClose={onClose}
        />
        
        <div className="p-8">
           <MemberForm 
             member={member}
             onSave={onSave}
             onClose={onClose}
           />
        </div>
      </div>
    </div>
  );
};
</file>

<file path="src/components/NotificationsPanel.tsx">
import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell } from 'lucide-react';
import { Card } from './ui/Card';
import { NotificationsHeader } from './notifications/NotificationsHeader';
import { NotificationsList } from './notifications/NotificationsList';
import { NotificationsFooter } from './notifications/NotificationsFooter';


export const NotificationsPanel: React.FC = () => {
  const { state, actions } = useApp();
  const { notifications } = state;

  if (notifications.length === 0) {
    return (
      <Card className="absolute top-20 right-6 w-96 z-50 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center justify-center py-10 text-slate-500 dark:text-slate-400">
          <Bell size={48} className="mb-4 opacity-20" />
          <p className="text-sm font-medium">No notifications yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card noPadding className="absolute top-20 right-6 w-96 z-50 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl border-slate-200 dark:border-slate-700 max-h-[80vh] flex flex-col">
      <NotificationsHeader 
          unreadCount={notifications.filter(n => !n.read).length}
          onMarkAllRead={actions.markAllNotificationsAsRead}
          onClose={() => actions.setShowNotifications(false)}
      />
      
      <NotificationsList 
          notifications={notifications}
          onMarkRead={actions.markNotificationAsRead}
      />
      
      <NotificationsFooter onViewAll={() => { }} />
    </Card>
  );
};
</file>

<file path="src/components/ProfileModal.tsx">
import React, { useState, useEffect, useRef } from 'react';
import { ProfileModalProps, User } from '../types';
import { X, Camera, Mail, Shield, User as UserIcon, Upload, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { useApp } from '../context/AppContext';


export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const { state } = useApp();
  const { t } = state;
  const [formData, setFormData] = useState<User>(user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  useEffect(() => {
    setFormData(user);
  }, [user, isOpen]);

  if (!isOpen) return null;

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  
  const handleRandomizeAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    setFormData(prev => ({ ...prev, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}` }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-primary-600 to-violet-600">
           <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white backdrop-blur-sm transition-colors"
           >
             <X size={20} />
           </button>
        </div>
        
        <div className="px-8 pb-8">
           <div className="relative -mt-16 mb-6 flex flex-col items-center">
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                 <img src={formData.avatar} alt="Profile" className="w-32 h-32 rounded-[2rem] border-4 border-white dark:border-slate-800 object-cover shadow-lg bg-white" />
                 <div className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={32} />
                 </div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />

              <div className="flex gap-4 mt-3">
                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                >
                    <Upload size={14} /> {t('upload')}
                </button>
                <button 
                    type="button" 
                    onClick={handleRandomizeAvatar}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                    <RefreshCw size={14} /> {t('randomize')}
                </button>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('editProfile')}</h2>
                 <p className="text-sm text-slate-600 dark:text-slate-300">{t('updateDetails')}</p>
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">{t('fullName')}</label>
                    <div className="relative">
                       <UserIcon size={18} className="absolute left-3.5 top-3.5 text-slate-500 dark:text-slate-400" />
                       <input 
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium text-slate-900 dark:text-white"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">{t('emailAddress')}</label>
                    <div className="relative">
                       <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-500 dark:text-slate-400" />
                       <input 
                          type="email" 
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium text-slate-900 dark:text-white"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">{t('role')}</label>
                    <div className="relative">
                       <Shield size={18} className="absolute left-3.5 top-3.5 text-slate-500 dark:text-slate-400" />
                       {user.role === 'ADMIN' ? (
                         <select 
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value as User['role']})}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium appearance-none text-slate-900 dark:text-white"
                         >
                            <option value="ADMIN">{t('administrator')}</option>
                            <option value="MEMBER">{t('teamMember')}</option>
                         </select>
                       ) : (
                         <input
                            type="text"
                            readOnly
                            value={formData.role === 'ADMIN' ? t('administrator') : t('teamMember')}
                            className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300"
                         />
                       )}
                    </div>
                 </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>{t('cancel')}</Button>
                 <Button type="submit" variant="primary" className="flex-1">{t('saveChanges')}</Button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
};
</file>

<file path="src/components/ProjectDetailView.tsx">
import React, { useState, useMemo } from 'react';
import { ProjectDetailViewProps, TaskStatus, FilterState } from '../types';
import { Layout, List, Users } from 'lucide-react';
import { KanbanBoard } from './KanbanBoard';
import { TaskListView } from './TaskListView';
import { Card } from './ui/Card';
import { ProjectHeader } from './project-detail/ProjectHeader';
import { ProjectStats } from './project-detail/ProjectStats';
import { useApp } from '../context/AppContext';


export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project, tasks, users, onBack, onEditProject, onDeleteProject,
  onUpdateTaskStatus, onEditTask, onCreateTask
}) => {
  const { state } = useApp();
  const { t } = state;
  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'team'>('board');
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: 'ALL',
    assigneeId: 'ALL'
  });

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  
  
  const filteredProjectTasks = useMemo(() => {
    return projectTasks.filter(t => {
       const searchMatch = 
        t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
        t.description.toLowerCase().includes(filters.search.toLowerCase());
       if (!searchMatch) return false;
       if (filters.priority !== 'ALL' && t.priority !== filters.priority) return false;
       if (filters.assigneeId !== 'ALL' && t.assigneeId !== filters.assigneeId) return false;
       return true;
    });
  }, [projectTasks, filters]);
  
  const projectMembers = users.filter(u => project.members?.includes(u.id));
  
  const completed = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
  const inProgress = projectTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const progress = projectTasks.length === 0 ? 0 : Math.round((completed / projectTasks.length) * 100);

  return (
    <div className="flex flex-col animate-fade-in pb-20">
      
      <ProjectHeader 
        project={project} 
        onBack={onBack}
        onEdit={() => onEditProject(project)}
        onDelete={() => { if(window.confirm(t('confirmDelete'))) onDeleteProject(project.id) }}
      />

      <ProjectStats 
        progress={progress}
        completed={completed}
        total={projectTasks.length}
        inProgress={inProgress}
        members={projectMembers}
      />

      <div className="mt-6 flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
         <button 
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'board' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
         >
            <Layout size={16} /> {t('board')}
         </button>
         <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
         >
            <List size={16} /> {t('list')}
         </button>
         <button 
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'team' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
         >
            <Users size={16} /> {t('team')}
         </button>
      </div>

      <div className="mt-2">
         {activeTab === 'board' && (
            <div className="h-[600px] lg:h-[calc(100vh-350px)] min-h-[500px]">
                <KanbanBoard 
                    tasks={filteredProjectTasks} 
                    filters={filters}
                    setFilters={setFilters}
                    users={users}
                    projects={[project]}
                    onUpdateTaskStatus={onUpdateTaskStatus}
                    onEditTask={onEditTask}
                    onCreateTask={onCreateTask}
                />
            </div>
         )}
         {activeTab === 'list' && (
            <div className="pb-10">
                <TaskListView 
                    tasks={filteredProjectTasks} 
                    users={users}
                    filters={filters}
                    setFilters={setFilters}
                    projects={[project]}
                    onEditTask={onEditTask}
                    onUpdateStatus={onUpdateTaskStatus}
                />
            </div>
         )}
         {activeTab === 'team' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                 {projectMembers.map(user => {
                     const userProjectTasks = projectTasks.filter(t => t.assigneeId === user.id);
                     return (
                        <Card key={user.id} className="flex items-center gap-4">
                            <img src={user.avatar} className="w-14 h-14 rounded-2xl" />
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{user.name}</h3>
                                <p className="text-sm text-slate-500">{user.email}</p>
                                <div className="mt-2 text-xs font-semibold bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-2 py-1 rounded-md w-fit">
                                    {userProjectTasks.length} {t('assignedTasks')}
                                </div>
                            </div>
                        </Card>
                     )
                 })}
                 {projectMembers.length === 0 && (
                     <div className="col-span-full text-center py-20 text-slate-400">
                         {t('noMembers')}
                     </div>
                 )}
             </div>
         )}
      </div>
    </div>
  );
};
</file>

<file path="src/components/ProjectModal.tsx">
import React from 'react';
import { ProjectModalProps } from '../types';
import { ModalHeader } from './ui/ModalHeader';
import { ProjectForm } from './project-modal/ProjectForm';
import { useApp } from '../context/AppContext';


export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen, onClose, project, users, onSave 
}) => {
  const { state } = useApp();
  const { t } = state;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        <ModalHeader 
            title={project ? t('editProject') : t('createProject')}
            subtitle={t('defineGoals')}
            onClose={onClose}
        />

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
           <ProjectForm 
              project={project}
              users={users}
              onSave={onSave}
              onClose={onClose}
           />
        </div>
      </div>
    </div>
  );
};
</file>

<file path="src/components/ProjectsView.tsx">
import React from 'react';
import { ProjectsViewProps, TaskStatus } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Plus } from 'lucide-react';
import { ProjectCardHeader } from './projects-view/ProjectCardHeader';
import { ProjectCardProgress } from './projects-view/ProjectCardProgress';
import { ProjectCardFooter } from './projects-view/ProjectCardFooter';
import { useApp } from '../context/AppContext';


export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects, tasks, users, onCreateProject, onEditProject, onDeleteProject, onProjectClick
}) => {
  const { state } = useApp();
  const { t } = state;
  
  
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, progress, tasks: projectTasks };
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('projects')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('manageProjects')}</p>
         </div>
         <Button onClick={onCreateProject} icon={<Plus size={18}/>}>
            {t('newProject')}
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(project => {
          const stats = getProjectStats(project.id);
          const members = users.filter(u => project.members?.includes(u.id));

          return (
            <Card 
              key={project.id} 
              onClick={() => onProjectClick(project)}
              className="flex flex-col h-full group hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 relative overflow-hidden cursor-pointer"
            >
               <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                 project.status === 'ACTIVE' ? 'bg-emerald-500' : 
                 project.status === 'COMPLETED' ? 'bg-primary-600' : 'bg-slate-300'
               }`} />

               <ProjectCardHeader 
                  status={project.status}
                  onEdit={() => onEditProject(project)}
                  onDelete={() => {
                     if(window.confirm(t('confirmDelete'))) {
                         onDeleteProject(project.id);
                     }
                  }}
               />

               <h3 className="text-xl font-bold text-brand dark:text-brand-bright mb-2">{project.name}</h3>
               <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-6 flex-1">{project.description}</p>

               <div className="space-y-5">
                  <ProjectCardProgress progress={stats.progress} />
                  
                  <ProjectCardFooter 
                      members={members}
                      completedTasks={stats.completed}
                      totalTasks={stats.total}
                  />
               </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
</file>

<file path="src/components/TaskListView.tsx">
import React from 'react';
import { TaskListViewProps, TaskStatus, Priority } from '../types';
import { Calendar, CheckCircle2, Circle, Clock, MoreHorizontal, Folder } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { FilterBar } from './ui/FilterBar';
import { useApp } from '../context/AppContext';


export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks, users, projects, filters, setFilters, onEditTask, onUpdateStatus 
}) => {
  const { state } = useApp();
  const { t } = state;
  
  
  const getStatusIcon = (s: TaskStatus) => {
      if (s === TaskStatus.DONE) return <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-50 dark:fill-emerald-900/20" />;
      if (s === TaskStatus.IN_PROGRESS) return <Clock size={20} className="text-primary-500" />;
      return <Circle size={20} className="text-slate-300 dark:text-slate-600" />;
  };

  
  const getStatusBadgeVariant = (s: TaskStatus) => {
      switch(s) {
          case TaskStatus.DONE: return 'success';
          case TaskStatus.IN_PROGRESS: return 'primary';
          case TaskStatus.REVIEW: return 'warning';
          default: return 'neutral';
      }
  };

  
  const getProjectName = (projectId: string) => {
      return projects?.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  return (
    <div className="animate-fade-in">
        <FilterBar filters={filters} setFilters={setFilters} users={users} />
        
        <Card noPadding className="overflow-hidden bg-white dark:bg-dark-surface shadow-soft border border-white/60 dark:border-white/5">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700/50">
                        <tr>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-14 text-center">#</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('taskDetails')}</th>
                            {projects && <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('projects')}</th>}
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('assignee')}</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('status')}</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('dueDate')}</th>
                            <th className="px-6 py-5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('priority')}</th>
                            <th className="px-6 py-5 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {tasks.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                    {t('noTasksFound')}
                                </td>
                            </tr>
                        ) : (
                            tasks.map((task, idx) => {
                                const assignee = users.find(u => u.id === task.assigneeId);
                                return (
                                    <tr 
                                        key={task.id} 
                                        onClick={() => onEditTask(task)}
                                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4 text-center text-xs text-slate-400 font-mono">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdateStatus(task.id, task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE);
                                                    }}
                                                    className="hover:scale-110 transition-transform focus:outline-none"
                                                >
                                                    {getStatusIcon(task.status)}
                                                </button>
                                                <div>
                                                    <span className={`font-semibold block text-sm ${task.status === TaskStatus.DONE ? 'line-through text-slate-400 dark:text-slate-500 decoration-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                        {task.title}
                                                    </span>
                                                    {task.subtasks && task.subtasks.length > 0 && (
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 block">
                                                            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} {t('subtasks')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {projects && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-brand dark:text-brand-bright text-sm font-medium">
                                                    <Folder size={14} />
                                                    <span className="truncate max-w-[150px]">{getProjectName(task.projectId)}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            {assignee ? (
                                                <div className="flex items-center gap-2.5">
                                                    <img src={assignee.avatar} alt={assignee.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover" />
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{assignee.name}</span>
                                                </div>
                                            ) : <span className="text-sm text-slate-500 dark:text-slate-400 italic">{t('unassigned')}</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusBadgeVariant(task.status)}>
                                                {t(task.status as any)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                                                <Calendar size={14} className={new Date(task.dueDate) < new Date() ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'} />
                                                <span className={new Date(task.dueDate) < new Date() ? 'text-rose-600 dark:text-rose-400' : ''}>
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                task.priority === Priority.HIGH ? 'danger' : 
                                                task.priority === Priority.MEDIUM ? 'warning' : 'secondary'
                                            }>
                                                {t(task.priority as any)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
  );
};
</file>

<file path="src/components/TaskModal.tsx">
import React from 'react';
import { TaskModalProps } from '../types';
import { useTaskForm } from '../hooks/useTaskForm';

import { TaskModalHeader } from './task-modal/TaskModalHeader';
import { TaskModalTabs } from './task-modal/TaskModalTabs';
import { TaskModalFooter } from './task-modal/TaskModalFooter';
import { TaskDetails } from './task-modal/TaskDetails';
import { TaskSubtasks } from './task-modal/TaskSubtasks';
import { TaskComments } from './task-modal/TaskComments';


export const TaskModal: React.FC<TaskModalProps> = (props) => {
  const { formState, uiState, handlers } = useTaskForm(props);

  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        <TaskModalHeader 
            task={props.task}
            onClose={props.onClose}
        />

        <TaskModalTabs 
            activeTab={uiState.activeTab}
            setActiveTab={uiState.setActiveTab}
            subtasksCount={formState.subtasks.length}
            commentsCount={formState.comments.length}
        />

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {uiState.activeTab === 'details' && (
            <TaskDetails 
              {...formState}
              projects={props.projects}
              users={props.users}
              isGenerating={uiState.isGenerating}
              onAutoPriority={handlers.handleAIPriority}
              onSuggestSubtasks={handlers.handleAISubtasks}
            />
          )}

          {uiState.activeTab === 'subtasks' && (
            <TaskSubtasks 
              subtasks={formState.subtasks}
              users={props.users}
              onAdd={handlers.addSubtask}
              onUpdate={handlers.updateSubtask}
              onDelete={handlers.deleteSubtask}
            />
          )}

          {uiState.activeTab === 'comments' && (
            <TaskComments 
              comments={formState.comments}
              users={props.users}
              newComment={formState.newComment}
              setNewComment={formState.setNewComment}
              onAdd={handlers.addComment}
            />
          )}
        </div>

        <TaskModalFooter 
            task={props.task}
            onDelete={props.onDelete ? handlers.handleDelete : undefined}
            onClose={props.onClose}
            onSave={handlers.handleSubmit}
        />
      </div>
    </div>
  );
};
</file>

<file path="src/components/TeamView.tsx">
import React from 'react';
import { TeamViewProps, TaskStatus } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Mail, Briefcase, CheckCircle2, Plus, Trash2, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';


export const TeamView: React.FC<TeamViewProps> = ({
  currentUser, users, tasks, onAddMember, onEditMember, onDeleteMember, onMemberClick
}) => {
  const { state } = useApp();
  const { t } = state;
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('team')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('manageTeam')}</p>
         </div>
         {isAdmin && (
            <Button onClick={onAddMember} icon={<Plus size={18}/>}>
               {t('addMember')}
            </Button>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {users.map(user => {
          
          const userTasks = tasks.filter(t => t.assigneeId === user.id);
          const completed = userTasks.filter(t => t.status === TaskStatus.DONE).length;
          const inProgress = userTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
          const isMe = user.id === currentUser.id;
          
          return (
            <Card 
                key={user.id} 
                className="flex flex-col gap-4 group hover:border-primary-200 dark:hover:border-primary-800 transition-colors cursor-pointer"
                onClick={() => onMemberClick(user)}
            >
               <div className="flex items-start justify-between">
                  <div className="relative">
                     <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-3xl object-cover border-2 border-white dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform duration-300 bg-white" />
                     <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                  </div>
                  <Badge variant={user.role === 'ADMIN' ? 'primary' : 'secondary'}>{t(user.role === 'ADMIN' ? 'admin' : 'member')}</Badge>
               </div>
               
               <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors flex items-center gap-2">
                      {user.name} 
                      {isMe && <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({t('you')})</span>}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-1">{user.jobRole || t('member')}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                     <Mail size={14} />
                     <span className="truncate">{user.email}</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl">
                     <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        <Briefcase size={12} /> {t('assigned')}
                     </div>
                     <span className="text-lg font-bold text-slate-900 dark:text-white">{userTasks.length}</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-2xl">
                     <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
                        <CheckCircle2 size={12} /> {t('done')}
                     </div>
                     <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{completed}</span>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-primary-500 rounded-full" 
                        style={{ width: `${userTasks.length > 0 ? (inProgress / userTasks.length) * 100 : 0}%` }}
                     ></div>
                  </div>
                  <span className="text-xs font-bold text-primary-600">{inProgress} {t('active')}</span>
               </div>

               {isAdmin && !isMe && (
                   <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto" onClick={e => e.stopPropagation()}>
                       <button 
                           onClick={() => onEditMember(user)} 
                           className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors"
                       >
                           <Edit size={14} /> {t('edit')}
                       </button>
                       <button 
                           onClick={() => {
                               
                               if (window.confirm(t('confirmDelete'))) {
                                   onDeleteMember(user.id);
                               }
                           }} 
                           className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors"
                       >
                           <Trash2 size={14} /> {t('remove')}
                       </button>
                   </div>
               )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
</file>

<file path="src/constants/demoUsers.ts">
import { User } from '../types';


export const DEMO_USER_IDS = {
  admin: 'a1111111-1111-4111-8111-111111111111',
  sarah: 'a2222222-2222-4222-8222-222222222222',
  mike: 'a3333333-3333-4333-8333-333333333333',
  emily: 'a4444444-4444-4444-8444-444444444444',
  lan: 'a5555555-5555-4555-8555-555555555555',
} as const;


export const GUEST_USER: User = {
  id: '',
  name: 'Guest',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
  role: 'MEMBER',
};


export const DEMO_USER_PROFILES: User[] = [
  {
    id: DEMO_USER_IDS.admin,
    name: 'Nguyễn Văn Admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    role: 'ADMIN',
    jobRole: 'Product Owner',
    email: 'admin@fastboard.com',
  },
  {
    id: DEMO_USER_IDS.sarah,
    name: 'Sarah Miller',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    role: 'MEMBER',
    jobRole: 'UI Designer',
    email: 'sarah@fastboard.com',
  },
  {
    id: DEMO_USER_IDS.mike,
    name: 'Mike Ross',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    role: 'MEMBER',
    jobRole: 'Backend Developer',
    email: 'mike@fastboard.com',
  },
  {
    id: DEMO_USER_IDS.emily,
    name: 'Emily Wong',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    role: 'MEMBER',
    jobRole: 'QA Engineer',
    email: 'emily@fastboard.com',
  },
  {
    id: DEMO_USER_IDS.lan,
    name: 'Trần Thị Lan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan',
    role: 'MEMBER',
    jobRole: 'Frontend Developer',
    email: 'lan@fastboard.com',
  },
];
</file>

<file path="src/context/AppContext.tsx">
import React, { createContext, useContext, ReactNode } from 'react';
import { useAppLogic } from '../hooks/useAppLogic';

type AppContextType = ReturnType<typeof useAppLogic>;

const AppContext = createContext<AppContextType | null>(null);


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const logic = useAppLogic();
  return (
    <AppContext.Provider value={logic}>
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
</file>

<file path="src/hooks/modules/useDataFetching.ts">
import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Task, Project, User, Notification } from '../../types';


export const useDataFetching = (
  isAuth: boolean, 
  user: User, 
  setUser: (u: User) => void,
  setIsLoading: (l: boolean) => void,
  addToast: (t: 'success' | 'error', m: string) => void
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.from('users').select('*');
      if (userData) {
          const mappedUsers = userData.map((u: any) => ({
              id: u.id,
              name: u.name,
              avatar: u.avatar,
              role: u.role,
              jobRole: u.job_role,
              email: u.email
          }));
          setUsers(mappedUsers as User[]);
          
          const currentUserData = mappedUsers.find((u: User) => u.id === user.id);
          if (currentUserData) {
            setUser(currentUserData);
          }
      }

      const { data: projectData } = await supabase.from('projects').select('*');
      const { data: memberRows } = await supabase.from('project_members').select('project_id, user_id');

      if (projectData) {
        const membersByProject = new Map<string, string[]>();
        (memberRows || []).forEach((row: any) => {
          const list = membersByProject.get(row.project_id) || [];
          list.push(row.user_id);
          membersByProject.set(row.project_id, list);
        });

        setProjects(projectData.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          progress: p.progress,
          members: membersByProject.get(p.id) || [],
        })) as Project[]);
      }

      const { data: taskData } = await supabase
        .from('tasks')
        .select(`*, subtasks (*), comments (*)`)
        .order('created_at', { ascending: false });

      if (taskData) {
        const formattedTasks: Task[] = taskData.map((t: any) => ({
          id: t.id,
          projectId: t.project_id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assignee_id,
          dueDate: t.due_date,
          tags: t.tags || [],
          subtasks: (t.subtasks || []).map((st: any) => ({
             id: st.id,
             title: st.title,
             completed: st.completed,
             assigneeId: st.assignee_id 
          })),
          comments: (t.comments || []).map((c: any) => ({
             id: c.id,
             userId: c.user_id,
             text: c.text,
             createdAt: c.created_at
          })),
          createdAt: t.created_at,
          completedAt: t.completed_at || undefined
        }));
        setTasks(formattedTasks);
      }
      
      if (user.id) {
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (notifData) {
          setNotifications(notifData.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.read,
            createdAt: n.created_at,
            taskId: n.task_id,
          })) as Notification[]);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      addToast('error', 'Failed to load initial data.');
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    if (isAuth && user.id) {
      fetchData();
    }
  }, [isAuth, user.id]);

  return {
    tasks, setTasks,
    projects, setProjects,
    users, setUsers,
    notifications, setNotifications,
    refetch: fetchData
  };
};
</file>

<file path="src/hooks/modules/useEntityOperations.ts">
import React from 'react';
import { supabase } from '../../services/supabaseClient';
import { Task, Project, User, TaskStatus } from '../../types';
import { canManageMembers, isAdmin, resolveRoleForProfileUpdate } from '../../utils/roles';


export const useEntityOperations = (
  user: User,
  refetchData: () => void,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setUser: React.Dispatch<React.SetStateAction<User>>,
  addToast: (t: 'success' | 'error' | 'info', m: string) => void
) => {

  
  const handleTaskSave = async (task: Task, isEdit: boolean) => {
    try {
      const completedAt = task.status === TaskStatus.DONE
        ? (task.completedAt || new Date().toISOString())
        : null;
      const taskPayload = {
        id: task.id,
        project_id: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assigneeId || null,
        due_date: task.dueDate,
        tags: task.tags,
        created_at: task.createdAt,
        completed_at: completedAt
      };
      
      const { error } = await supabase.from('tasks').upsert(taskPayload);
      if (error) throw error;

      await supabase.from('subtasks').delete().eq('task_id', task.id);
      if (task.subtasks.length > 0) {
        const subtasksToInsert = task.subtasks.map(s => ({
          id: s.id,
          task_id: task.id,
          title: s.title,
          completed: s.completed,
          assignee_id: s.assigneeId || null
        }));
        await supabase.from('subtasks').insert(subtasksToInsert);
      }

      if (task.comments.length > 0) {
        const commentsToUpsert = task.comments.map(c => ({
          id: c.id,
          task_id: task.id,
          user_id: c.userId,
          text: c.text,
          created_at: c.createdAt
        }));
        await supabase.from('comments').upsert(commentsToUpsert);
      }

      refetchData();
      addToast('success', isEdit ? 'Task updated successfully' : 'Task created successfully');
      return true;
    } catch (e) {
      console.error("Failed to save task", e);
      addToast('error', 'Failed to save task to database.');
      return false;
    }
  };

  
  const handleTaskDelete = async (taskId: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      addToast('success', 'Task deleted');
      return true;
    } catch (e) {
      console.error("Failed to delete task", e);
      addToast('error', 'Failed to delete task');
      return false;
    }
  };

  
  const handleUpdateTaskStatus = async (id: string, status: TaskStatus, completedAt?: string) => {
    try {
      const { error } = await supabase.from('tasks').update({
        status,
        completed_at: status === TaskStatus.DONE ? (completedAt || new Date().toISOString()) : null
      }).eq('id', id);
      if (error) throw error;
      addToast('info', `Status updated to ${status}`);
    } catch {
      addToast('error', 'Failed to update status');
      refetchData();
    }
  };

  
  const syncProjectMembers = async (projectId: string, memberIds: string[]) => {
    await supabase.from('project_members').delete().eq('project_id', projectId);
    if (memberIds.length === 0) return;
    const rows = memberIds.map((userId) => ({
      project_id: projectId,
      user_id: userId,
    }));
    const { error } = await supabase.from('project_members').insert(rows);
    if (error) throw error;
  };

  
  const handleProjectSave = async (project: Project, isEdit: boolean) => {
    try {
        const memberIds = Array.from(new Set([
          ...(project.members || []),
          ...(user.id ? [user.id] : []),
        ]));

        const projectPayload: Record<string, unknown> = {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          progress: project.progress,
        };
        if (!isEdit && user.id) {
          projectPayload.created_by = user.id;
        }

        const { error } = await supabase.from('projects').upsert(projectPayload);
        if (error) throw error;

        await syncProjectMembers(project.id, memberIds);
        const saved: Project = { ...project, members: memberIds };
        
        if (isEdit) {
            setProjects(prev => prev.map(p => p.id === project.id ? saved : p));
            addToast('success', 'Project updated');
        } else {
            setProjects(prev => [...prev, saved]);
            addToast('success', 'Project created');
        }
        return true;
    } catch (e) {
        console.error("Failed to save project", e);
        addToast('error', 'Failed to save project');
        return false;
    }
  };

  
  const handleProjectDelete = async (projectId: string) => {
    try {
        const { error } = await supabase.from('projects').delete().eq('id', projectId);
        if (error) throw error;
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setTasks(prev => prev.filter(t => t.projectId !== projectId));
        addToast('success', 'Project deleted');
        return true;
    } catch (e) {
        console.error("Failed to delete project", e);
        addToast('error', 'Failed to delete project');
        return false;
    }
  };

  
  const handleMemberSave = async (member: User, isEdit: boolean) => {
    if (!canManageMembers(user)) {
      addToast('error', 'Only admins can manage members');
      return false;
    }
    try {
       if (!isEdit) {
         const { data: existing } = await supabase
           .from('users')
           .select('id')
           .eq('email', member.email)
           .maybeSingle();
         if (!existing) {
           addToast('error', 'User must exist in Auth first. Invite via Supabase Dashboard, then edit profile.');
           return false;
         }
         member = { ...member, id: existing.id };
       }

       const dbMember = {
         id: member.id,
         name: member.name,
         email: member.email,
         role: member.role,
         avatar: member.avatar,
         job_role: member.jobRole
       };

       const { error } = await supabase.from('users').upsert(dbMember);
       if (error) throw error;
       if (isEdit) {
         setUsers(prev => prev.map(u => u.id === member.id ? member : u));
         addToast('success', 'Member updated');
       } else {
         setUsers(prev => {
           if (prev.some(u => u.id === member.id)) {
             return prev.map(u => u.id === member.id ? member : u);
           }
           return [...prev, member];
         });
         addToast('success', 'Member updated');
       }
       return true;
    } catch (e) { 
        console.error(e);
        addToast('error', 'Operation failed');
        return false;
    }
  };

  
  const handleDeleteMember = async (userId: string) => {
     if (!canManageMembers(user)) {
       addToast('error', 'Only admins can remove members');
       return;
     }
     if (userId === user.id) {
       addToast('error', 'You cannot delete yourself');
       return;
     }
     try {
       const { error } = await supabase.from('users').delete().eq('id', userId);
       if (error) throw error;
       setUsers(prev => prev.filter(u => u.id !== userId));
       addToast('success', 'Member removed');
     } catch (e) { 
         console.error(e); 
         addToast('error', 'Failed to remove member');
     }
  };

  
  const handleProfileUpdate = async (updatedUser: User) => {
    try {
      const role = resolveRoleForProfileUpdate(user, updatedUser);
      const safeUser: User = { ...updatedUser, role };

      if (!isAdmin(user) && updatedUser.id !== user.id) {
        addToast('error', 'Permission denied');
        return false;
      }

      const dbUser = {
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        role: safeUser.role,
        avatar: safeUser.avatar,
        job_role: safeUser.jobRole
      };

      const { error } = await supabase.from('users').upsert(dbUser);
      if (error) throw error;
      if (safeUser.id === user.id) setUser(safeUser);
      setUsers(prev => prev.map(u => u.id === safeUser.id ? safeUser : u));
      addToast('success', 'Profile updated');
      return true;
    } catch (e) {
       console.error("Failed to update profile", e);
       addToast('error', 'Update failed');
       return false;
    }
  };

  return {
    handleTaskSave, handleTaskDelete, handleUpdateTaskStatus,
    handleProjectSave, handleProjectDelete,
    handleMemberSave, handleDeleteMember, handleProfileUpdate
  };
};
</file>

<file path="src/hooks/modules/useSearchSystem.ts">
import { useState, useMemo } from 'react';
import { Task, FilterState } from '../../types';


export const useSearchSystem = (tasks: Task[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: 'ALL',
    assigneeId: 'ALL'
  });

  
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const searchMatch = 
        t.title.toLowerCase().includes(filters.search.toLowerCase()) || 
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      if (!searchMatch) return false;
      if (filters.priority !== 'ALL' && t.priority !== filters.priority) return false;
      if (filters.assigneeId !== 'ALL' && t.assigneeId !== filters.assigneeId) return false;

      return true;
    });
  }, [tasks, filters]);

  return {
    filters, setFilters,
    filteredTasks
  };
};
</file>

<file path="src/hooks/modules/useUIState.ts">
import { useState, useEffect } from 'react';
import { ViewMode, ToastMessage, Language, TaskStatus, Task, Project, User } from '../../types';
import { translations } from '../../translations';


export const useUIState = () => {
  const [activeTab, setActiveTab] = useState<ViewMode>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('FASTBOARD-theme') === 'dark'; } catch { return false; }
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('FASTBOARD-lang');
      if (stored === 'vi' || stored === 'en') return stored;
      return 'vi';
    } catch {
      return 'vi';
    }
  });

  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isMemberModalOpen, setMemberModalOpen] = useState(false); 
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>(TaskStatus.TODO);

  const [showNotifications, setShowNotifications] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  
  useEffect(() => {
    localStorage.setItem('FASTBOARD-theme', darkMode ? 'dark' : 'light');
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  
  useEffect(() => {
    localStorage.setItem('FASTBOARD-lang', language);
  }, [language]);

  
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  
  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key;
  };

  return {
    state: {
      activeTab, isLoading, isSidebarOpen, isDesktopSidebarOpen, darkMode, language,
      isTaskModalOpen, isProfileModalOpen, isMemberModalOpen, isProjectModalOpen,
      selectedProject, selectedMember, editingTask, editingMember, editingProject,
      newTaskStatus, showNotifications, toasts, t
    },
    actions: {
      setActiveTab, setIsLoading, setIsSidebarOpen, setIsDesktopSidebarOpen, setDarkMode, setLanguage,
      setTaskModalOpen, setProfileModalOpen, setMemberModalOpen, setProjectModalOpen,
      setSelectedProject, setSelectedMember, setEditingTask, setEditingMember, setEditingProject,
      setNewTaskStatus, setShowNotifications, addToast, removeToast
    }
  };
};
</file>

<file path="src/hooks/useAppLogic.ts">
import { useState, useEffect } from 'react';
import { User, TaskStatus, Task, Project, Notification } from '../types';
import { GUEST_USER } from '../constants';
import { supabase } from '../services/supabaseClient';

import { useUIState } from './modules/useUIState';
import { useDataFetching } from './modules/useDataFetching';
import { useSearchSystem } from './modules/useSearchSystem';
import { useEntityOperations } from './modules/useEntityOperations';


const mapProfile = (row: Record<string, unknown>): User => ({
  id: String(row.id),
  name: String(row.name ?? ''),
  avatar: String(row.avatar ?? ''),
  role: row.role as User['role'],
  jobRole: row.job_role ? String(row.job_role) : undefined,
  email: row.email ? String(row.email) : undefined,
});


const mapNotification = (row: Record<string, unknown>): Notification => ({
  id: String(row.id),
  userId: String(row.user_id),
  title: String(row.title),
  message: String(row.message),
  type: row.type as Notification['type'],
  read: Boolean(row.read),
  createdAt: String(row.created_at),
  taskId: row.task_id ? String(row.task_id) : undefined,
});


export const useAppLogic = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [user, setUser] = useState<User>(GUEST_USER);

  const ui = useUIState();
  const data = useDataFetching(isAuth, user, setUser, ui.actions.setIsLoading, ui.actions.addToast);
  const search = useSearchSystem(data.tasks);
  const ops = useEntityOperations(
    user, data.refetch,
    data.setTasks, data.setProjects, data.setUsers, setUser,
    ui.actions.addToast
  );

  
  const loadProfile = async (authUserId: string, email?: string | null) => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile', error);
    }

    if (profile) {
      setUser(mapProfile(profile));
    } else {
      setUser({
        ...GUEST_USER,
        id: authUserId,
        email: email || undefined,
        name: email?.split('@')[0] || 'User',
      });
    }
    setIsAuth(true);
  };

  
  useEffect(() => {
    let mounted = true;

    
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!mounted) return;
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email);
      } else {
        setIsAuth(false);
        setUser(GUEST_USER);
      }
      setAuthReady(true);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session?.user) {
        setIsAuth(false);
        setUser(GUEST_USER);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        await loadProfile(session.user.id, session.user.email);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  
  useEffect(() => {
    if (!isAuth || !user.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const n = mapNotification(payload.new as Record<string, unknown>);
            data.setNotifications((prev) => [n, ...prev.filter((x) => x.id !== n.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const n = mapNotification(payload.new as Record<string, unknown>);
            data.setNotifications((prev) => prev.map((x) => (x.id === n.id ? n : x)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = String((payload.old as Record<string, unknown>).id);
            data.setNotifications((prev) => prev.filter((x) => x.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuth, user.id]);

  
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !signInData.user) {
      console.error('Login failed', error);
      return false;
    }
    await loadProfile(signInData.user.id, signInData.user.email);
    return true;
  };

  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuth(false);
    setUser(GUEST_USER);
  };

  
  const handleTaskSaveWrapper = async (task: Task) => {
    const success = await ops.handleTaskSave(task, !!ui.state.editingTask);
    if (success) {
        ui.actions.setTaskModalOpen(false);
        ui.actions.setEditingTask(null);
    }
  };

  
  const handleTaskDeleteWrapper = async (taskId: string) => {
    const success = await ops.handleTaskDelete(taskId);
    if (success) {
        ui.actions.setTaskModalOpen(false);
        ui.actions.setEditingTask(null);
    }
  };

  
  const handleProjectSaveWrapper = async (project: Project) => {
    const success = await ops.handleProjectSave(project, !!ui.state.editingProject);
    if (success) {
        ui.actions.setProjectModalOpen(false);
        ui.actions.setEditingProject(null);
    }
  };

  
  const handleProjectDeleteWrapper = async (projectId: string) => {
    const success = await ops.handleProjectDelete(projectId);
    if (success && ui.state.selectedProject?.id === projectId) {
        ui.actions.setSelectedProject(null);
    }
  };

  
  const handleMemberSaveWrapper = async (member: User) => {
    const success = await ops.handleMemberSave(member, !!ui.state.editingMember);
    if (success) {
        ui.actions.setMemberModalOpen(false);
        ui.actions.setEditingMember(null);
    }
  };

  
  const markNotificationAsRead = async (id: string) => {
    data.setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  
  const markAllNotificationsAsRead = async () => {
    data.setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
  };

  return {
    state: {
      ...ui.state,
      user, isAuth, authReady,
      tasks: search.filteredTasks, rawTasks: data.tasks, projects: data.projects, users: data.users,
      notifications: data.notifications,
      filters: search.filters,
    },
    actions: {
      ...ui.actions,
      setIsAuth,
      handleLogin,
      handleLogout,

      handleTaskSave: handleTaskSaveWrapper,
      handleTaskDelete: handleTaskDeleteWrapper,
      
      handleUpdateTaskStatus: (id: string, s: TaskStatus) => {
          const existing = data.tasks.find(t => t.id === id);
          const completedAt = s === TaskStatus.DONE
            ? (existing?.completedAt || new Date().toISOString())
            : undefined;
          data.setTasks(prev => prev.map(t => t.id === id ? { ...t, status: s, completedAt } : t));
          ops.handleUpdateTaskStatus(id, s, completedAt);
      },
      
      openNewTaskModal: (status?: TaskStatus) => {
          ui.actions.setEditingTask(null);
          ui.actions.setNewTaskStatus(status || TaskStatus.TODO);
          ui.actions.setTaskModalOpen(true);
      },
      
      openEditTaskModal: (task: Task) => {
          ui.actions.setEditingTask(task);
          ui.actions.setTaskModalOpen(true);
      },

      handleProjectSave: handleProjectSaveWrapper,
      handleProjectDelete: handleProjectDeleteWrapper,
      openNewProjectModal: () => { ui.actions.setEditingProject(null); ui.actions.setProjectModalOpen(true); },
      openEditProjectModal: (p: Project) => { ui.actions.setEditingProject(p); ui.actions.setProjectModalOpen(true); },
      handleProjectClick: (p: Project) => { ui.actions.setSelectedProject(p); ui.actions.setActiveTab('projects'); },
      handleBackToProjects: () => ui.actions.setSelectedProject(null),

      handleProfileUpdate: (u: User) => ops.handleProfileUpdate(u),
      handleMemberSave: handleMemberSaveWrapper,
      handleDeleteMember: ops.handleDeleteMember,
      openNewMemberModal: () => { ui.actions.setEditingMember(null); ui.actions.setMemberModalOpen(true); },
      openEditMemberModal: (m: User) => { ui.actions.setEditingMember(m); ui.actions.setMemberModalOpen(true); },
      handleMemberClick: (m: User) => { ui.actions.setSelectedMember(m); ui.actions.setActiveTab('team'); },
      handleBackToTeam: () => ui.actions.setSelectedMember(null),

      setFilters: search.setFilters,

      markNotificationAsRead,
      markAllNotificationsAsRead
    }
  };
};
</file>

<file path="src/hooks/useDashboardData.ts">
import { useMemo, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { format } from 'date-fns';


const subDays = (date: Date, amount: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() - amount);
    return d;
};


const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};


const endOfWeek = (date: Date) => {
    const d = startOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
};


const parseISO = (str: string) => new Date(str);


const isWithinInterval = (date: Date, interval: { start: Date, end: Date }) => {
    return date.getTime() >= interval.start.getTime() && date.getTime() <= interval.end.getTime();
};


export const useDashboardData = (tasks: Task[]) => {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');
  
  
  const statusData = useMemo(() => {
    const counts = {
      [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO).length,
      [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      [TaskStatus.REVIEW]: tasks.filter(t => t.status === TaskStatus.REVIEW).length,
      [TaskStatus.DONE]: tasks.filter(t => t.status === TaskStatus.DONE).length,
    };
    
    return [
      { name: 'To Do', value: counts[TaskStatus.TODO], color: STATUS_COLORS[TaskStatus.TODO] },
      { name: 'In Progress', value: counts[TaskStatus.IN_PROGRESS], color: STATUS_COLORS[TaskStatus.IN_PROGRESS] },
      { name: 'Review', value: counts[TaskStatus.REVIEW], color: STATUS_COLORS[TaskStatus.REVIEW] },
      { name: 'Done', value: counts[TaskStatus.DONE], color: STATUS_COLORS[TaskStatus.DONE] },
    ];
  }, [tasks]);

  
  const chartData = useMemo(() => {
    const data = [];
    const days = timeRange === 'weekly' ? 7 : 30;
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const created = tasks.filter(t => {
        if (!t.createdAt) return false;
        try {
            return t.createdAt.startsWith(dateStr);
        } catch { return false; }
      }).length;

      const due = tasks.filter(t => {
        if (!t.dueDate) return false;
        try {
            return t.dueDate.startsWith(dateStr);
        } catch { return false; }
      }).length;

      data.push({
        day: format(date, timeRange === 'weekly' ? 'EEE' : 'dd MMM'),
        created,
        due
      });
    }
    return data;
  }, [tasks, timeRange]);

  
  const productivityStats = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now);
    const end = endOfWeek(now);
    
    const dueThisWeek = tasks.filter(t => {
      try {
        if (!t.dueDate) return false;
        const d = parseISO(t.dueDate);
        return isWithinInterval(d, { start, end });
      } catch (e) { return false; }
    });

    const completed = dueThisWeek.filter(t => t.status === TaskStatus.DONE).length;
    const total = dueThisWeek.length;
    
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    let label = "Keep going";
    if (percentage === 100 && total > 0) label = "Excellent 🚀";
    else if (percentage >= 75) label = "Great Job 🔥";
    else if (percentage >= 50) label = "On Track 👍";
    else if (percentage > 0) label = "Good Start";

    const completedDurations = tasks
      .filter(t => t.status === TaskStatus.DONE && t.completedAt && t.createdAt)
      .map(t => (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()) / 86_400_000)
      .filter(days => Number.isFinite(days) && days >= 0);
    const averageCompletionDays = completedDurations.length === 0
      ? null
      : completedDurations.reduce((sum, days) => sum + days, 0) / completedDurations.length;

    return { percentage, completed, total, label, averageCompletionDays };
  }, [tasks]);

  
  const completedCount = tasks.filter(t => t.status === TaskStatus.DONE).length;

  return {
    timeRange,
    setTimeRange,
    statusData,
    chartData,
    productivityStats,
    completedCount
  };
};
</file>

<file path="src/hooks/useTaskForm.ts">
import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus, Subtask, Comment, UseTaskFormProps } from '../types';
import { generateSubtasks, suggestPriority } from '../services/aiService';
import { useApp } from '../context/AppContext';


export const useTaskForm = ({
  isOpen, task, currentUser, projects, defaultStatus, onSave, onDelete
}: UseTaskFormProps) => {
  const { actions } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments'>('details');

  
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setPriority(task.priority);
        setProjectId(task.projectId);
        setAssigneeId(task.assigneeId || '');
        setDueDate(task.dueDate.split('T')[0]);
        setSubtasks(task.subtasks || []);
        setComments(task.comments || []);
      } else {
        setTitle('');
        setDescription('');
        setStatus(defaultStatus || TaskStatus.TODO);
        setPriority(Priority.MEDIUM);
        setProjectId(projects[0]?.id || '');
        setAssigneeId(currentUser.id);
        setDueDate(new Date().toISOString().split('T')[0]);
        setSubtasks([]);
        setComments([]);
      }
      setActiveTab('details');
      setNewComment('');
    }
  }, [isOpen, task, defaultStatus, projects, currentUser]);

  
  const handleSubmit = () => {
    const updatedTask: Task = {
      id: task?.id || Math.random().toString(36).substr(2, 9),
      title,
      description,
      status,
      priority,
      projectId,
      assigneeId,
      dueDate: new Date(dueDate).toISOString(),
      tags: [], 
      subtasks,
      comments,
      createdAt: task?.createdAt || new Date().toISOString(),
      completedAt: task?.completedAt
    };
    onSave(updatedTask);
  };

  
  const handleDelete = () => {
    if (task && onDelete && window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id);
    }
  };

  
  const addSubtask = () => {
    setSubtasks([...subtasks, { id: Math.random().toString(), title: 'New Subtask', completed: false }]);
  };

  
  const updateSubtask = (id: string, updates: Partial<Subtask>) => {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  
  const deleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  
  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Math.random().toString(),
      userId: currentUser.id,
      text: newComment,
      createdAt: new Date().toISOString()
    };
    setComments([...comments, comment]);
    setNewComment('');
  };

  
  const handleAISubtasks = async () => {
    if (!title.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const generated = await generateSubtasks(title, description);
      const suggestedSubtasks: Subtask[] = generated.map((subtaskTitle) => ({
        id: crypto.randomUUID(),
        title: subtaskTitle,
        completed: false,
      }));
      setSubtasks((current) => [...current, ...suggestedSubtasks]);
      setActiveTab('subtasks');
    } catch (error) {
      console.error('Failed to generate subtasks', error);
      actions.addToast('error', error instanceof Error ? error.message : 'Unable to generate subtasks');
    } finally {
      setIsGenerating(false);
    }
  };

  
  const handleAIPriority = async () => {
    if (!title.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      setPriority(await suggestPriority(title, description));
    } catch (error) {
      console.error('Failed to suggest priority', error);
      actions.addToast('error', error instanceof Error ? error.message : 'Unable to suggest priority');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    formState: {
      title, setTitle, description, setDescription, status, setStatus,
      priority, setPriority, projectId, setProjectId, assigneeId, setAssigneeId,
      dueDate, setDueDate, subtasks, comments, newComment, setNewComment
    },
    uiState: {
      isGenerating, activeTab, setActiveTab
    },
    handlers: {
      handleSubmit, handleDelete, addSubtask, updateSubtask, deleteSubtask,
      addComment, handleAISubtasks, handleAIPriority
    }
  };
};
</file>

<file path="src/services/supabaseClient.ts">
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}


const authLock = async <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => fn()


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: authLock,
  },
})
</file>

<file path="src/types/enums.ts">
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}


export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}


export type Language = 'en' | 'vi';
</file>

<file path="src/types/index.ts">
export * from './enums';
export * from './models';
export * from './ui';
export * from './props';
</file>

<file path="src/types/models.ts">
import { TaskStatus, Priority } from './enums';


export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'MEMBER';
  jobRole?: string;
  email?: string;
}


export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}


export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string; 
}


export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  dueDate: string;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  createdAt: string;
  completedAt?: string;
}


export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  progress: number;
  members: string[];
}


export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'STATUS_CHANGE' | 'COMMENT' | 'DUE_DATE';
  read: boolean;
  createdAt: string;
  taskId?: string;
}
</file>

<file path="src/types/props.ts">
import { ReactNode, ButtonHTMLAttributes, HTMLAttributes, FormEvent } from 'react';
import { TaskStatus, Priority } from './enums';
import { Task, Project, User, Comment, Subtask, Notification } from './models';
import { FilterState, ViewMode, ToastMessage } from './ui';


export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  noPadding?: boolean;
  hoverEffect?: boolean;
}


export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}


export interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}


export interface ModalHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
}


export interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}


export interface FilterBarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  users: User[];
}


export interface SkeletonProps {
  className?: string;
  count?: number; 
  variant?: 'rect' | 'circle' | 'text';
}


export interface ErrorBoundaryProps {
  children?: ReactNode;
}


export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}


export interface LoginScreenProps {
  onLogin: (email: string, password: string) => boolean | Promise<boolean>;
  language?: 'en' | 'vi';
}


export interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  onNavigate?: (mode: ViewMode) => void;
}


export interface DashboardStatsProps {
  projectsCount: number;
  completedTasksCount: number;
  onNavigateProjects?: () => void;
}


export interface ProductivityCardProps {
  stats: {
    percentage: number;
    completed: number;
    total: number;
    label: string;
    averageCompletionDays: number | null;
  };
}


export interface TaskTrendChartProps {
  data: Array<{ day: string; created: number; due: number }>;
  timeRange: 'weekly' | 'monthly';
  onRangeChange: (range: 'weekly' | 'monthly') => void;
}


export interface StatusDonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  totalTasks: number;
}


export interface RecentActivityProps {
  tasks: Task[];
  onViewAll?: () => void;
}


export interface KanbanBoardProps {
  tasks: Task[];
  projects?: Project[];
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  users: User[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
}


export interface TaskListViewProps {
  tasks: Task[];
  users: User[];
  projects?: Project[];
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onEditTask: (task: Task) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}


export interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onProjectClick: (project: Project) => void;
}


export interface ProjectCardHeaderProps {
    status: Project['status'];
    onEdit: () => void;
    onDelete: () => void;
}


export interface ProjectCardProgressProps {
    progress: number;
}


export interface ProjectCardFooterProps {
    members: User[];
    completedTasks: number;
    totalTasks: number;
}


export interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  users: User[];
  onBack: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
}


export interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}


export interface ProjectStatsProps {
  progress: number;
  completed: number;
  total: number;
  inProgress: number;
  members: User[];
}


export interface TeamViewProps {
  currentUser: User;
  users: User[];
  tasks: Task[];
  onAddMember: () => void;
  onEditMember: (user: User) => void;
  onDeleteMember: (userId: string) => void;
  onMemberClick: (user: User) => void;
}


export interface MemberDetailViewProps {
  member: User;
  tasks: Task[];
  projects: Project[];
  onBack: () => void;
  onEditMember: (user: User) => void;
  onDeleteMember: (userId: string) => void;
  onEditTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
}


export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  projects: Project[];
  users: User[];
  currentUser: User;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  defaultStatus?: TaskStatus;
}


export interface TaskModalHeaderProps {
  task?: Task | null;
  onClose: () => void;
}


export interface TaskModalFooterProps {
    task?: Task | null;
    onDelete?: () => void;
    onClose: () => void;
    onSave: () => void;
}


export interface TaskModalTabsProps {
    activeTab: 'details' | 'subtasks' | 'comments';
    setActiveTab: (tab: 'details' | 'subtasks' | 'comments') => void;
    subtasksCount: number;
    commentsCount: number;
}


export interface UseTaskFormProps {
  isOpen: boolean;
  task?: Task | null;
  currentUser: User;
  projects: Project[];
  defaultStatus?: TaskStatus;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onClose: () => void;
}


export interface TaskDetailsProps {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  status: TaskStatus;
  setStatus: (v: TaskStatus) => void;
  priority: Priority;
  setPriority: (v: Priority) => void;
  projectId: string;
  setProjectId: (v: string) => void;
  assigneeId: string;
  setAssigneeId: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  projects: Project[];
  users: User[];
  isGenerating: boolean;
  onAutoPriority: () => void;
  onSuggestSubtasks: () => void;
}


export interface TaskSubtasksProps {
  subtasks: Subtask[];
  users: User[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Subtask>) => void;
  onDelete: (id: string) => void;
}


export interface TaskCommentsProps {
  comments: Comment[];
  users: User[];
  newComment: string;
  setNewComment: (val: string) => void;
  onAdd: (e: FormEvent) => void;
}


export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (user: User) => void;
}


export interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: User | null; 
  onSave: (user: User) => void;
}


export interface MemberFormProps {
    member: User | null;
    onSave: (member: User) => void;
    onClose: () => void;
}


export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  users: User[];
  onSave: (project: Project) => void;
}


export interface ProjectFormProps {
    project: Project | null;
    users: User[];
    onSave: (project: Project) => void;
    onClose: () => void;
}


export interface NotificationsHeaderProps {
    unreadCount: number;
    onMarkAllRead: () => void;
    onClose: () => void;
}


export interface NotificationsListProps {
    notifications: Notification[];
    onMarkRead: (id: string) => void;
}


export interface NotificationsFooterProps {
    onViewAll: () => void;
}
</file>

<file path="src/types/ui.ts">
import { Priority } from './enums';


export type ViewMode = 'dashboard' | 'projects' | 'kanban' | 'list' | 'team';


export interface FilterState {
  search: string;
  priority: Priority | 'ALL';
  assigneeId: string | 'ALL';
}


export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}


export interface NavItemConfig {
  id: ViewMode;
  label: string;
  iconId: string;
}


export interface DashboardStatConfig {
  id: string;
  label: string;
  iconId: 'projects' | 'tasks' | 'productivity' | 'activity';
  trend?: number;
}
</file>

<file path="src/utils/commentMapping.test.ts">
import { describe, expect, it } from 'vitest';


const mapComment = (c: { id: string; user_id: string; text: string; created_at: string }) => ({
  id: c.id,
  userId: c.user_id,
  text: c.text,
  createdAt: c.created_at,
});


describe('comment mapping', () => {
  
  it('maps created_at to createdAt', () => {
    const mapped = mapComment({
      id: 'c1',
      user_id: 'u1',
      text: 'hello',
      created_at: '2026-09-08T10:00:00.000Z',
    });
    expect(mapped.createdAt).toBe('2026-09-08T10:00:00.000Z');
    expect('created_at' in mapped).toBe(false);
  });
});
</file>

<file path="src/utils/roles.test.ts">
import { describe, expect, it } from 'vitest';
import {
  canManageMembers,
  isAdmin,
  resolveRoleForProfileUpdate,
} from '../utils/roles';
import { User } from '../types';

const admin: User = {
  id: 'a1',
  name: 'Admin',
  avatar: '',
  role: 'ADMIN',
};

const member: User = {
  id: 'm1',
  name: 'Member',
  avatar: '',
  role: 'MEMBER',
};


describe('roles', () => {
  
  it('detects admin', () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(member)).toBe(false);
    expect(canManageMembers(member)).toBe(false);
    expect(canManageMembers(admin)).toBe(true);
  });

  
  it('prevents member from escalating role on profile update', () => {
    const attempted = { ...member, role: 'ADMIN' as const };
    expect(resolveRoleForProfileUpdate(member, attempted)).toBe('MEMBER');
  });

  
  it('allows admin to set roles', () => {
    const updated = { ...member, role: 'ADMIN' as const };
    expect(resolveRoleForProfileUpdate(admin, updated)).toBe('ADMIN');
  });
});
</file>

<file path="src/utils/roles.ts">
import { User } from '../types';


export const isAdmin = (user: Pick<User, 'role'> | null | undefined): boolean =>
  user?.role === 'ADMIN';


export const canManageMembers = (user: Pick<User, 'role'> | null | undefined): boolean =>
  isAdmin(user);


export const canChangeUserRole = (
  actor: Pick<User, 'id' | 'role'> | null | undefined,
  _targetId: string
): boolean => {
  if (!actor || !isAdmin(actor)) return false;
  return true;
};


export const resolveRoleForProfileUpdate = (
  actor: User,
  updated: User
): User['role'] => {
  if (!isAdmin(actor)) return actor.role;
  if (updated.id === actor.id) return updated.role;
  return updated.role;
};
</file>

<file path="src/App.tsx">
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationsPanel } from './components/NotificationsPanel';
import { LoginScreen } from './components/auth/LoginScreen';
import { ViewManager } from './components/views/ViewManager';
import { ModalManager } from './components/modals/ModalManager';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';


const AppLayout = () => {
  const { state, actions } = useApp();

  if (!state.authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-bg text-slate-500">
        Loading...
      </div>
    );
  }

  if (!state.isAuth) {
    return (
      <LoginScreen
        onLogin={actions.handleLogin}
        language={state.language}
      />
    );
  }
  return (
    <div className="flex h-screen bg-background dark:bg-dark-bg overflow-hidden text-slate-900 dark:text-slate-100 selection:bg-primary-500/30">

      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header />

        {state.showNotifications && <NotificationsPanel />}

        <div className="flex-1 p-4 md:p-6 lg:p-8 relative overflow-auto scroll-smooth custom-scrollbar">
          {state.isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary-100 overflow-hidden z-50">
              <div className="h-full bg-primary-500 animate-pulse w-full origin-left-right"></div>
            </div>
          )}

          <div className="mx-auto">
            <ErrorBoundary>
              <ViewManager />
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <ModalManager />
      <ToastContainer toasts={state.toasts} removeToast={actions.removeToast} />
    </div>
  );
};


export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
</file>

<file path="src/constants.ts">
import { NavItemConfig, TaskStatus, Task, Priority } from './types';
import { DEMO_USER_IDS } from './constants/demoUsers';


export { GUEST_USER, DEMO_USER_IDS, DEMO_USER_PROFILES } from './constants/demoUsers';


export { GUEST_USER as CURRENT_USER } from './constants/demoUsers';


export const NAV_CONFIG: NavItemConfig[] = [
  { id: 'dashboard', iconId: 'dashboard', label: 'Overview' },
  { id: 'projects', iconId: 'folder', label: 'Projects' },
  { id: 'kanban', iconId: 'kanban', label: 'Kanban Board' },
  { id: 'list', iconId: 'list', label: 'Task List' },
  { id: 'team', iconId: 'team', label: 'Team Members' },
];


export const KANBAN_COLUMNS = [
  { 
      id: TaskStatus.TODO, 
      title: 'New', 
      bg: 'bg-white dark:bg-dark-surface',
      headerBorder: 'border-slate-200 dark:border-slate-800',
      dotColor: 'bg-slate-400'
  },
  { 
      id: TaskStatus.IN_PROGRESS, 
      title: 'In Progress', 
      bg: 'bg-white dark:bg-dark-surface',
      headerBorder: 'border-primary-200 dark:border-primary-800',
      dotColor: 'bg-primary-500'
  },
  { 
      id: TaskStatus.REVIEW, 
      title: 'Pending Review', 
      bg: 'bg-white dark:bg-dark-surface',
      headerBorder: 'border-slate-800 dark:border-slate-200',
      dotColor: 'bg-slate-900 dark:bg-slate-100'
  },
  { 
      id: TaskStatus.DONE, 
      title: 'Done', 
      bg: 'bg-white dark:bg-dark-surface',
      headerBorder: 'border-secondary-200 dark:border-secondary-800',
      dotColor: 'bg-secondary-500'
  },
];


export const CHART_COLORS = {
  purple: '#EC4899',
  pink: '#10B981',
  orange: '#111827',
  blue: '#6B7280',
  teal: '#374151',
  slate: '#E5E7EB'
};


export const STATUS_COLORS = {
  [TaskStatus.TODO]: '#9CA3AF',
  [TaskStatus.IN_PROGRESS]: '#EC4899',
  [TaskStatus.REVIEW]: '#111827',
  [TaskStatus.DONE]: '#10B981',
};


export const DASHBOARD_TREND_DATA = [
  { day: 'Mon', tasks: 12 },
  { day: 'Tue', tasks: 18 },
  { day: 'Wed', tasks: 15 },
  { day: 'Thu', tasks: 25 },
  { day: 'Fri', tasks: 20 },
  { day: 'Sat', tasks: 8 },
  { day: 'Sun', tasks: 10 },
];


export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Design System Audit',
    description: 'Review current design system components for consistency.',
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    assigneeId: DEMO_USER_IDS.admin,
    dueDate: new Date().toISOString(),
    tags: ['Design', 'Audit'],
    subtasks: [],
    comments: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'API Integration',
    description: 'Integrate the new payment gateway API.',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    assigneeId: DEMO_USER_IDS.sarah,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    tags: ['Backend', 'API'],
    subtasks: [],
    comments: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 't3',
    projectId: 'p2',
    title: 'User Testing',
    description: 'Conduct user testing sessions for the new feature.',
    status: TaskStatus.REVIEW,
    priority: Priority.LOW,
    assigneeId: DEMO_USER_IDS.mike,
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    tags: ['QA', 'Testing'],
    subtasks: [],
    comments: [],
    createdAt: new Date().toISOString()
  }
];
</file>

<file path="src/index.css">
@import "tailwindcss";


@custom-variant dark (&:where(.dark, .dark *));


@theme {
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-logo: 'Outfit', sans-serif;

  
  --color-primary-50: #fdf2f8;
  --color-primary-100: #fce7f3;
  --color-primary-200: #fbcfe8;
  --color-primary-300: #f9a8d4;
  --color-primary-400: #f472b6;
  --color-primary-500: #EC4899;
  --color-primary-600: #db2777;
  --color-primary-700: #be185d;
  --color-primary-800: #9d174d;
  --color-primary-900: #831843;
  --color-primary-950: #500724;

  
  --color-secondary-50: #ecfdf5;
  --color-secondary-100: #d1fae5;
  --color-secondary-200: #a7f3d0;
  --color-secondary-300: #6ee7b7;
  --color-secondary-400: #34d399;
  --color-secondary-500: #10B981;
  --color-secondary-600: #059669;
  --color-secondary-700: #047857;
  --color-secondary-800: #065f46;
  --color-secondary-900: #064e3b;
  --color-secondary-950: #022c22;

  
  --color-slate-50: #F9FAFB;
  --color-slate-100: #F3F4F6;
  --color-slate-200: #E5E7EB;
  --color-slate-300: #D1D5DB;
  --color-slate-400: #9CA3AF;
  --color-slate-500: #6B7280;
  --color-slate-600: #4B5563;
  --color-slate-700: #374151;
  --color-slate-800: #1F2937;
  --color-slate-900: #111827;
  --color-slate-950: #030712;

  
  --color-dark-bg: #000000;
  --color-dark-surface: #121212;
  --color-dark-border: #333333;
  --color-background: #FFFFFF;

  
  --color-brand: #FF1A1A;
  --color-brand-bright: #FF3333;
}

@layer base {
  :root {
    --font-sans: 'Plus Jakarta Sans', sans-serif;
    --font-logo: 'Outfit', sans-serif;
    --dark-bg: #000000;
    --dark-surface: #121212;
    --dark-border: #333333;
  }

  body {
    font-family: var(--font-sans);
    background-color: #FFFFFF;
    color: var(--color-slate-900);
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
  }

  .dark body,
  html.dark body {
    background-color: var(--dark-bg);
    color: #f5f5f4;
  }
}


@layer utilities {
  .font-sans { font-family: var(--font-sans); }
  .font-logo { font-family: var(--font-logo); }

  .text-brand { color: var(--color-brand); }
  .text-brand-bright { color: var(--color-brand-bright); }

  .shadow-soft { box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); }
  .shadow-glow { box-shadow: 0 0 20px rgba(236, 72, 153, 0.25); }

  .animate-fade-in { animation: fade-in 0.3s ease-out; }
  .animate-slide-in { animation: slide-in 0.3s ease-out; }

  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes slide-in {
    0% { transform: translateY(10px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-slate-300);
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--color-slate-400);
  }

  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-slate-700);
  }
}
</file>

<file path="src/main.tsx">
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
</file>

<file path="src/supabase_schema.sql">
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


do $$ begin
  drop trigger if exists on_auth_user_created on auth.users;
exception
  when insufficient_privilege then
    raise notice 'Skip drop trigger on auth.users (not owner) — sẽ recreate nếu được phép.';
  when undefined_object then
    null;
end $$;

do $$ begin
  drop function if exists public.handle_new_user() cascade;
exception
  when insufficient_privilege then
    raise notice 'Skip drop handle_new_user (auth trigger vẫn giữ) — sẽ CREATE OR REPLACE.';
end $$;

drop function if exists public.is_admin() cascade;
drop function if exists public.is_project_member(uuid) cascade;
drop function if exists public.notify_task_assignment() cascade;
drop function if exists public.notify_task_status_change() cascade;
drop function if exists public.notify_new_comment() cascade;


drop table if exists messages cascade;
drop table if exists channels cascade;
drop table if exists time_entries cascade;
drop table if exists notifications cascade;
drop table if exists comments cascade;
drop table if exists subtasks cascade;
drop table if exists tasks cascade;
drop table if exists project_members cascade;
drop table if exists projects cascade;
drop table if exists users cascade;

drop type if exists task_status cascade;
drop type if exists priority cascade;
drop type if exists user_role cascade;
drop type if exists channel_type cascade;


create type task_status as enum ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');
create type priority as enum ('LOW', 'MEDIUM', 'HIGH');
create type user_role as enum ('ADMIN', 'MEMBER');





create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar text,
  role user_role default 'MEMBER',
  job_role text,
  email text
);

create table projects (
  id text primary key,
  name text not null,
  description text,
  status text default 'ACTIVE',
  progress integer default 0,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table project_members (
  project_id text not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text default 'MEMBER',
  joined_at timestamptz default now(),
  primary key (project_id, user_id)
);

create table tasks (
  id text primary key,
  project_id text references projects(id) on delete cascade,
  title text not null,
  description text,
  status task_status default 'TODO',
  priority priority default 'MEDIUM',
  assignee_id uuid references users(id) on delete set null,
  due_date timestamptz,
  tags text[],
  created_at timestamptz default now(),
  completed_at timestamptz
);

create table subtasks (
  id text primary key,
  task_id text references tasks(id) on delete cascade,
  title text not null,
  completed boolean default false,
  assignee_id uuid references users(id) on delete set null
);

create table comments (
  id text primary key,
  task_id text references tasks(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

create table notifications (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  read boolean default false,
  created_at timestamptz default now(),
  task_id text references tasks(id) on delete set null
);


create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'ADMIN'
  );
$$;

create or replace function public.is_project_member(p_project_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1 from public.project_members
      where project_id = p_project_id and user_id = auth.uid()
    );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, avatar, role, job_role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(
      new.raw_user_meta_data->>'avatar',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || coalesce(new.email, new.id::text)
    ),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'MEMBER'),
    new.raw_user_meta_data->>'job_role',
    new.email
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.users.name);
  return new;
end;
$$;




create or replace function public.notify_task_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assignee_id is not null
     and (tg_op = 'INSERT' or old.assignee_id is distinct from new.assignee_id)
     and new.assignee_id is distinct from auth.uid() then
    insert into public.notifications (user_id, title, message, type, task_id)
    values (
      new.assignee_id,
      'Task assigned',
      'You were assigned to: ' || new.title,
      'ASSIGNMENT',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_task_assignment
  after insert or update of assignee_id on public.tasks
  for each row execute function public.notify_task_assignment();

create or replace function public.notify_task_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and old.status is distinct from new.status
     and new.assignee_id is not null
     and new.assignee_id is distinct from auth.uid() then
    insert into public.notifications (user_id, title, message, type, task_id)
    values (
      new.assignee_id,
      'Status change',
      new.title || ' → ' || new.status::text,
      'STATUS_CHANGE',
      new.id
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_task_status_change
  after update of status on public.tasks
  for each row execute function public.notify_task_status_change();

create or replace function public.notify_new_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignee uuid;
  v_title text;
begin
  select assignee_id, title into v_assignee, v_title
  from public.tasks where id = new.task_id;

  if v_assignee is not null and v_assignee is distinct from new.user_id then
    insert into public.notifications (user_id, title, message, type, task_id)
    values (
      v_assignee,
      'New comment',
      'Comment on: ' || coalesce(v_title, new.task_id),
      'COMMENT',
      new.task_id
    );
  end if;
  return new;
end;
$$;

create trigger trg_notify_new_comment
  after insert on public.comments
  for each row execute function public.notify_new_comment();


grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;


alter table users enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;
alter table subtasks enable row level security;
alter table comments enable row level security;
alter table notifications enable row level security;


create policy users_select on users for select to authenticated using (true);
create policy users_update_self on users for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (
    (id = auth.uid() and role = (select u.role from public.users u where u.id = auth.uid()))
    or public.is_admin()
  );
create policy users_insert_admin on users for insert to authenticated
  with check (public.is_admin());
create policy users_delete_admin on users for delete to authenticated
  using (public.is_admin() and id <> auth.uid());


create policy projects_select on projects for select to authenticated
  using (public.is_admin() or public.is_project_member(id));
create policy projects_insert on projects for insert to authenticated
  with check (auth.uid() is not null);
create policy projects_update on projects for update to authenticated
  using (public.is_admin() or public.is_project_member(id))
  with check (public.is_admin() or public.is_project_member(id));
create policy projects_delete on projects for delete to authenticated
  using (public.is_admin());


create policy pm_select on project_members for select to authenticated
  using (public.is_admin() or public.is_project_member(project_id) or user_id = auth.uid());
create policy pm_insert on project_members for insert to authenticated
  with check (public.is_admin() or public.is_project_member(project_id) or user_id = auth.uid());
create policy pm_update on project_members for update to authenticated
  using (public.is_admin() or public.is_project_member(project_id));
create policy pm_delete on project_members for delete to authenticated
  using (public.is_admin() or public.is_project_member(project_id));


create policy tasks_select on tasks for select to authenticated
  using (public.is_project_member(project_id));
create policy tasks_insert on tasks for insert to authenticated
  with check (public.is_project_member(project_id));
create policy tasks_update on tasks for update to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
create policy tasks_delete on tasks for delete to authenticated
  using (public.is_project_member(project_id));


create policy subtasks_select on subtasks for select to authenticated
  using (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ));
create policy subtasks_write on subtasks for all to authenticated
  using (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ))
  with check (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ));


create policy comments_select on comments for select to authenticated
  using (exists (
    select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id)
  ));
create policy comments_insert on comments for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from tasks t where t.id = task_id and public.is_project_member(t.project_id))
  );
create policy comments_update on comments for update to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy comments_delete on comments for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());


create policy notif_select on notifications for select to authenticated
  using (user_id = auth.uid());
create policy notif_update on notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy notif_insert on notifications for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());
create policy notif_delete on notifications for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());





alter table tasks disable trigger trg_notify_task_assignment;
alter table tasks disable trigger trg_notify_task_status_change;
alter table comments disable trigger trg_notify_new_comment;


delete from auth.identities
where user_id in (
  'a1111111-1111-4111-8111-111111111111',
  'a2222222-2222-4222-8222-222222222222',
  'a3333333-3333-4333-8333-333333333333',
  'a4444444-4444-4444-8444-444444444444',
  'a5555555-5555-4555-8555-555555555555'
)
or provider_id in (
  'admin@fastboard.com',
  'sarah@fastboard.com',
  'mike@fastboard.com',
  'emily@fastboard.com',
  'lan@fastboard.com'
);

delete from auth.users
where id in (
  'a1111111-1111-4111-8111-111111111111',
  'a2222222-2222-4222-8222-222222222222',
  'a3333333-3333-4333-8333-333333333333',
  'a4444444-4444-4444-8444-444444444444',
  'a5555555-5555-4555-8555-555555555555'
)
or email in (
  'admin@fastboard.com',
  'sarah@fastboard.com',
  'mike@fastboard.com',
  'emily@fastboard.com',
  'lan@fastboard.com'
);


insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) values
(
  '00000000-0000-0000-0000-000000000000',
  'a1111111-1111-4111-8111-111111111111',
  'authenticated', 'authenticated', 'admin@fastboard.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Nguyễn Văn Admin","role":"ADMIN","job_role":"Product Owner","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a2222222-2222-4222-8222-222222222222',
  'authenticated', 'authenticated', 'sarah@fastboard.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Sarah Miller","role":"MEMBER","job_role":"UI Designer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a3333333-3333-4333-8333-333333333333',
  'authenticated', 'authenticated', 'mike@fastboard.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Mike Ross","role":"MEMBER","job_role":"Backend Developer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a4444444-4444-4444-8444-444444444444',
  'authenticated', 'authenticated', 'emily@fastboard.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Emily Wong","role":"MEMBER","job_role":"QA Engineer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"}'::jsonb,
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'a5555555-5555-4555-8555-555555555555',
  'authenticated', 'authenticated', 'lan@fastboard.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Trần Thị Lan","role":"MEMBER","job_role":"Frontend Developer","avatar":"https://api.dicebear.com/7.x/avataaars/svg?seed=Lan"}'::jsonb,
  now(), now(), '', '', '', ''
);


insert into auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) values
(
  gen_random_uuid(), 'a1111111-1111-4111-8111-111111111111',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a1111111-1111-4111-8111-111111111111', 'admin@fastboard.com')::jsonb,
  'email', 'a1111111-1111-4111-8111-111111111111', now(), now(), now()
),
(
  gen_random_uuid(), 'a2222222-2222-4222-8222-222222222222',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a2222222-2222-4222-8222-222222222222', 'sarah@fastboard.com')::jsonb,
  'email', 'a2222222-2222-4222-8222-222222222222', now(), now(), now()
),
(
  gen_random_uuid(), 'a3333333-3333-4333-8333-333333333333',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a3333333-3333-4333-8333-333333333333', 'mike@fastboard.com')::jsonb,
  'email', 'a3333333-3333-4333-8333-333333333333', now(), now(), now()
),
(
  gen_random_uuid(), 'a4444444-4444-4444-8444-444444444444',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a4444444-4444-4444-8444-444444444444', 'emily@fastboard.com')::jsonb,
  'email', 'a4444444-4444-4444-8444-444444444444', now(), now(), now()
),
(
  gen_random_uuid(), 'a5555555-5555-4555-8555-555555555555',
  format('{"sub":"%s","email":"%s","email_verified":true,"phone_verified":false}',
    'a5555555-5555-4555-8555-555555555555', 'lan@fastboard.com')::jsonb,
  'email', 'a5555555-5555-4555-8555-555555555555', now(), now(), now()
);

insert into public.users (id, name, avatar, role, job_role, email) values
('a1111111-1111-4111-8111-111111111111', 'Nguyễn Văn Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 'ADMIN', 'Product Owner', 'admin@fastboard.com'),
('a2222222-2222-4222-8222-222222222222', 'Sarah Miller', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'MEMBER', 'UI Designer', 'sarah@fastboard.com'),
('a3333333-3333-4333-8333-333333333333', 'Mike Ross', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 'MEMBER', 'Backend Developer', 'mike@fastboard.com'),
('a4444444-4444-4444-8444-444444444444', 'Emily Wong', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', 'MEMBER', 'QA Engineer', 'emily@fastboard.com'),
('a5555555-5555-4555-8555-555555555555', 'Trần Thị Lan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan', 'MEMBER', 'Frontend Developer', 'lan@fastboard.com')
on conflict (id) do update set
  name = excluded.name,
  avatar = excluded.avatar,
  role = excluded.role,
  job_role = excluded.job_role,
  email = excluded.email;

insert into projects (id, name, description, status, progress, created_by) values
('p1', 'Nova FinTech App', 'Ứng dụng ngân hàng thế hệ mới: bảo mật sinh trắc học và tích hợp crypto.', 'ACTIVE', 75, 'a1111111-1111-4111-8111-111111111111'),
('p2', 'AI Content Engine', 'Nền tảng SaaS dùng LLM để sinh nội dung marketing tự động.', 'ACTIVE', 45, 'a1111111-1111-4111-8111-111111111111'),
('p3', 'Website Marketing Q4', 'Làm mới website doanh nghiệp cho mùa lễ hội cuối năm.', 'COMPLETED', 100, 'a2222222-2222-4222-8222-222222222222'),
('p4', 'Mobile Redesign 2026', 'Thiết kế lại trải nghiệm app di động theo design system mới.', 'ACTIVE', 30, 'a1111111-1111-4111-8111-111111111111');

insert into project_members (project_id, user_id) values
('p1', 'a1111111-1111-4111-8111-111111111111'),
('p1', 'a2222222-2222-4222-8222-222222222222'),
('p1', 'a4444444-4444-4444-8444-444444444444'),
('p1', 'a5555555-5555-4555-8555-555555555555'),
('p2', 'a1111111-1111-4111-8111-111111111111'),
('p2', 'a3333333-3333-4333-8333-333333333333'),
('p2', 'a5555555-5555-4555-8555-555555555555'),
('p3', 'a2222222-2222-4222-8222-222222222222'),
('p3', 'a3333333-3333-4333-8333-333333333333'),
('p3', 'a4444444-4444-4444-8444-444444444444'),
('p4', 'a1111111-1111-4111-8111-111111111111'),
('p4', 'a2222222-2222-4222-8222-222222222222'),
('p4', 'a5555555-5555-4555-8555-555555555555');

insert into tasks (id, project_id, title, description, status, priority, assignee_id, due_date, tags, created_at) values
('t1', 'p1', 'Biometric Authentication', 'Implement FaceID and TouchID login using React Native Biometrics.', 'DONE', 'HIGH', 'a1111111-1111-4111-8111-111111111111', now() - interval '2 days', ARRAY['Security', 'Mobile'], now() - interval '10 days'),
('t2', 'p1', 'Transaction History API', 'Optimize the SQL query for retrieving last 1000 transactions.', 'REVIEW', 'HIGH', 'a4444444-4444-4444-8444-444444444444', now() + interval '1 day', ARRAY['Backend', 'Performance'], now() - interval '5 days'),
('t3', 'p1', 'Dark Mode UI Polish', 'Fix contrast issues on the settings screen in dark mode.', 'TODO', 'LOW', 'a2222222-2222-4222-8222-222222222222', now() + interval '5 days', ARRAY['Design', 'UI'], now() - interval '1 day'),
('t4', 'p1', 'Crypto Wallet Integration', 'Connect to Coinbase API for real-time balance updates.', 'IN_PROGRESS', 'MEDIUM', 'a5555555-5555-4555-8555-555555555555', now() + interval '7 days', ARRAY['Web3', 'API'], now() - interval '3 days'),
('t5', 'p2', 'Vector Database Setup', 'Initialize Pinecone index and create embedding generation pipeline.', 'DONE', 'HIGH', 'a1111111-1111-4111-8111-111111111111', now() - interval '5 days', ARRAY['AI', 'Infrastructure'], now() - interval '14 days'),
('t6', 'p2', 'Prompt Engineering', 'Refine system prompts for blog post generation.', 'IN_PROGRESS', 'HIGH', 'a3333333-3333-4333-8333-333333333333', now() + interval '3 days', ARRAY['AI', 'Product'], now() - interval '4 days'),
('t7', 'p2', 'Stripe Subscription Flow', 'Implement tiered pricing (Free, Pro, Enterprise) checkout.', 'TODO', 'HIGH', 'a1111111-1111-4111-8111-111111111111', now() + interval '10 days', ARRAY['Payments', 'SaaS'], now()),
('t8', 'p4', 'Design tokens sync', 'Đồng bộ design tokens giữa Figma và code.', 'IN_PROGRESS', 'MEDIUM', 'a2222222-2222-4222-8222-222222222222', now() + interval '4 days', ARRAY['Design', 'System'], now() - interval '2 days'),
('t9', 'p4', 'Onboarding flow', 'Xây dựng luồng onboarding 3 bước cho user mới.', 'TODO', 'HIGH', 'a5555555-5555-4555-8555-555555555555', now() + interval '8 days', ARRAY['Frontend', 'UX'], now() - interval '1 day');

update tasks
set completed_at = created_at + interval '4 days'
where status = 'DONE';

insert into subtasks (id, task_id, title, completed, assignee_id) values
('st1', 't1', 'Setup native modules', true, 'a1111111-1111-4111-8111-111111111111'),
('st2', 't1', 'Handle fallback to PIN', true, 'a1111111-1111-4111-8111-111111111111'),
('st3', 't1', 'UI Feedback animations', true, 'a2222222-2222-4222-8222-222222222222'),
('st4', 't2', 'Add database indexing', true, 'a4444444-4444-4444-8444-444444444444'),
('st5', 't2', 'Implement Redis caching', false, 'a4444444-4444-4444-8444-444444444444'),
('st6', 't4', 'Generate API Keys', true, 'a5555555-5555-4555-8555-555555555555'),
('st8', 't6', 'Test temperature settings', true, 'a3333333-3333-4333-8333-333333333333'),
('st9', 't6', 'Create few-shot examples', false, 'a3333333-3333-4333-8333-333333333333'),
('st10', 't6', 'Validate output quality', false, 'a1111111-1111-4111-8111-111111111111');

insert into comments (id, task_id, user_id, text, created_at) values
('c1', 't2', 'a1111111-1111-4111-8111-111111111111', 'Good catch on the index, query time dropped to 200ms.', now() - interval '1 hour'),
('c2', 't6', 'a3333333-3333-4333-8333-333333333333', 'The model is still struggling with tone consistency.', now() - interval '4 hours'),
('c3', 't8', 'a2222222-2222-4222-8222-222222222222', 'Tokens màu primary đã cập nhật trên Figma.', now() - interval '2 hours');

insert into notifications (id, user_id, title, message, type, read, created_at, task_id) values
('n1', 'a1111111-1111-4111-8111-111111111111', 'Task assigned', 'Bạn được nhắc về Crypto Wallet Integration', 'ASSIGNMENT', false, now() - interval '30 minutes', 't4'),
('n2', 'a1111111-1111-4111-8111-111111111111', 'Comment', 'Emily đã cập nhật Transaction History API', 'COMMENT', false, now() - interval '1 hour', 't2'),
('n3', 'a2222222-2222-4222-8222-222222222222', 'Status change', 'Design tokens sync đang In Progress', 'STATUS_CHANGE', true, now() - interval '3 hours', 't8');

alter table tasks enable trigger trg_notify_task_assignment;
alter table tasks enable trigger trg_notify_task_status_change;
alter table comments enable trigger trg_notify_new_comment;


do $$ begin
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
exception
  when duplicate_object then
    raise notice 'Trigger on_auth_user_created already exists.';
  when insufficient_privilege then
    raise notice 'Skip create trigger on auth.users (not owner). Demo seed vẫn dùng được; user mới có thể cần tạo profile thủ công hoặc chạy seed:auth.';
end $$;
</file>

<file path="src/translations.ts">
export type Language = 'en' | 'vi';


export const translations = {
  
  en: {
    appName: "FASTBOARD",
    searchPlaceholder: "Search anything...",
    newTask: "New Task",
    newProject: "New Project",
    addMember: "Add Member",
    edit: "Edit",
    delete: "Delete",
    remove: "Remove",
    cancel: "Cancel",
    save: "Save",
    saveChanges: "Save Changes",
    createTask: "Create Task",
    createProject: "Create Project",
    saveProject: "Save Project",
    editProject: "Edit Project",
    editMember: "Edit Member",
    addTeamMember: "Add Team Member",
    back: "Back",
    viewAll: "View All",
    upload: "Upload",
    uploadImage: "Upload Image",
    randomize: "Randomize",
    confirmDelete: "Are you sure you want to delete this?",
    
    dashboard: "Overview",
    projects: "Projects",
    kanban: "Kanban Board",
    list: "Task List",
    team: "Team Members",
    mainMenu: "Main Menu",
    logout: "Log Out",

    
    filterPlaceholder: "Filter by title, tag, or description...",
    allPriorities: "All Priorities",
    allMembers: "All Members",
    clearFilters: "Clear",

    projectsCount: "Projects",
    completedCount: "Completed",
    active: "Active",
    tasks: "Tasks",
    productivity: "Weekly Productivity",
    completionRate: "Completion Rate",
    taskCreation: "Task Analytics",
    newTasksOverTime: "Analyze task volume and deadlines over time",
    statusOverview: "Status Overview",
    realTimeStats: "Real-time stats",
    recentTasks: "Recent Tasks",
    latestUpdates: "Latest updates from your team",
    totalTasks: "Total Tasks",
    weekly: "Weekly",
    monthly: "Monthly",
    noTasksFound: "No tasks found.",
    
    created: "Created",
    due: "Due",
    comparison: "Comparison",
    areaChart: "Area",
    barChart: "Bar",
    lineChart: "Line",
    
    manageProjects: "Manage your team's initiatives and track progress.",
    progress: "Progress",
    noMembers: "No members",
    projectStatus_ACTIVE: "Active",
    projectStatus_COMPLETED: "Completed",
    projectStatus_ARCHIVED: "Archived",
    backToProjects: "Back to Projects",
    defineGoals: "Define project goals and team",
    activeProjects: "Active Projects",
    avgCompletionTime: "Avg. Completion Time",
    days: "days",
    assignedTasks: "Assigned Tasks",
    board: "Board",
    
    manageTeam: "Manage your team and workloads.",
    assigned: "Assigned",
    done: "Done",
    pending: "Pending",
    you: "You",
    admin: "Admin",
    member: "Member",
    editProfile: "Edit Profile",
    saveMember: "Save Member",
    backToTeam: "Back to Team",
    joined: "Joined",
    performance: "Performance",
    taskCompletion: "Task Completion",
    totalAssigned: "Total Assigned",
    
    monitorProductivity: "Monitor productivity and billable hours.",
    trackedToday: "Tracked Today",
    sessions: "Sessions",
    totalEntries: "Total Entries",
    trackedThisWeek: "Tracked This Week",
    recentActivity: "Recent Activity",
    duration: "Duration",

    taskDetails: "Task Details",
    taskTitle: "Task Title",
    autoPriority: "Suggest Priority",
    assignee: "Assignee",
    dueDate: "Due Date",
    priority: "Priority",
    status: "Status",
    subtasks: "Subtasks",
    comments: "Comments",
    details: "Details",
    description: "Description",
    suggestSubtasks: "Generate Subtasks",
    checklist: "Checklist",
    addItem: "Add Item",
    typeComment: "Type a comment...",
    noComments: "No comments yet.",
    noSubtasks: "No subtasks yet.",
    unassigned: "Unassigned",
    taskPlaceholder: "e.g. Redesign Landing Page",
    descPlaceholder: "Describe the task details...",
    newItemPlaceholder: "Create a new item for your team",
    
    TODO: "New",
    IN_PROGRESS: "In Progress",
    REVIEW: "Pending Review",
    DONE: "Done",
    
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",

    fullName: "Full Name",
    emailAddress: "Email Address",
    role: "Role",
    jobRole: "Job Role",
    accessLevel: "Access Level",
    avatarUrl: "Avatar URL (Optional)",
    projectName: "Project Name",
    projectDescription: "Description",
    assignTeamMembers: "Assign Team Members",
    updateDetails: "Update your personal details",
    administrator: "Administrator",
    teamMember: "Team Member",
    projectPlaceholder: "e.g. Mobile App Redesign",
    projectDescPlaceholder: "Briefly describe the project scope...",
    
    notifications: "Notifications",
    unread: "unread",
    markAllRead: "Mark all as read",
    viewAllActivity: "View All Activity",
    noNotifications: "No notifications yet",

    loginTitle: "Sign in",
    loginSubtitle: "Enter your demo account to continue",
    password: "Password",
    loginButton: "Sign in",
    loginError: "Invalid email or password",
    demoHint: "Demo product — use accounts from SETUP.md",
  },
  
  vi: {
    appName: "FASTBOARD",
    searchPlaceholder: "Tìm kiếm...",
    newTask: "Công việc mới",
    newProject: "Dự án mới",
    addMember: "Thêm thành viên",
    edit: "Sửa",
    delete: "Xóa",
    remove: "Gỡ",
    cancel: "Hủy",
    save: "Lưu",
    saveChanges: "Lưu thay đổi",
    createTask: "Tạo công việc",
    createProject: "Tạo dự án",
    saveProject: "Lưu dự án",
    editProject: "Sửa dự án",
    editMember: "Sửa thành viên",
    addTeamMember: "Thêm thành viên nhóm",
    back: "Quay lại",
    viewAll: "Xem tất cả",
    upload: "Tải lên",
    uploadImage: "Tải ảnh lên",
    randomize: "Ngẫu nhiên",
    confirmDelete: "Bạn có chắc muốn xóa mục này?",

    dashboard: "Tổng quan",
    projects: "Dự án",
    kanban: "Bảng Kanban",
    list: "Danh sách việc",
    team: "Thành viên",
    mainMenu: "Menu chính",
    logout: "Đăng xuất",


    filterPlaceholder: "Lọc theo tiêu đề, thẻ hoặc mô tả...",
    allPriorities: "Mọi mức ưu tiên",
    allMembers: "Mọi thành viên",
    clearFilters: "Xóa lọc",

    projectsCount: "Dự án",
    completedCount: "Hoàn thành",
    active: "Đang làm",
    tasks: "Công việc",
    productivity: "Năng suất tuần",
    completionRate: "Tỷ lệ hoàn thành",
    taskCreation: "Phân tích công việc",
    newTasksOverTime: "Phân tích khối lượng việc và hạn theo thời gian",
    statusOverview: "Tổng quan trạng thái",
    realTimeStats: "Thống kê thời gian thực",
    recentTasks: "Công việc gần đây",
    latestUpdates: "Cập nhật mới nhất từ nhóm",
    totalTasks: "Tổng công việc",
    weekly: "Theo tuần",
    monthly: "Theo tháng",
    noTasksFound: "Không tìm thấy công việc.",

    created: "Đã tạo",
    due: "Hạn",
    comparison: "So sánh",
    areaChart: "Vùng",
    barChart: "Cột",
    lineChart: "Đường",

    manageProjects: "Quản lý dự án nhóm và theo dõi tiến độ.",
    progress: "Tiến độ",
    noMembers: "Chưa có thành viên",
    projectStatus_ACTIVE: "Đang chạy",
    projectStatus_COMPLETED: "Hoàn thành",
    projectStatus_ARCHIVED: "Lưu trữ",
    backToProjects: "Về danh sách dự án",
    defineGoals: "Định nghĩa mục tiêu và nhóm dự án",
    activeProjects: "Dự án đang chạy",
    avgCompletionTime: "TG hoàn thành TB",
    days: "ngày",
    assignedTasks: "Việc được giao",
    board: "Bảng",

    manageTeam: "Quản lý thành viên và khối lượng công việc.",
    assigned: "Được giao",
    done: "Xong",
    pending: "Đang chờ",
    you: "Bạn",
    admin: "Quản trị",
    member: "Thành viên",
    editProfile: "Sửa hồ sơ",
    saveMember: "Lưu thành viên",
    backToTeam: "Về danh sách nhóm",
    joined: "Tham gia",
    performance: "Hiệu suất",
    taskCompletion: "Hoàn thành việc",
    totalAssigned: "Tổng được giao",

    monitorProductivity: "Theo dõi năng suất và giờ làm việc.",
    trackedToday: "Đã ghi hôm nay",
    sessions: "Phiên",
    totalEntries: "Tổng bản ghi",
    trackedThisWeek: "Đã ghi tuần này",
    recentActivity: "Hoạt động gần đây",
    duration: "Thời lượng",

    taskDetails: "Chi tiết công việc",
    taskTitle: "Tiêu đề",
    autoPriority: "Gợi ý mức ưu tiên",
    assignee: "Người phụ trách",
    dueDate: "Hạn hoàn thành",
    priority: "Ưu tiên",
    status: "Trạng thái",
    subtasks: "Việc con",
    comments: "Bình luận",
    details: "Chi tiết",
    description: "Mô tả",
    suggestSubtasks: "Sinh việc con",
    checklist: "Checklist",
    addItem: "Thêm mục",
    typeComment: "Viết bình luận...",
    noComments: "Chưa có bình luận.",
    noSubtasks: "Chưa có việc con.",
    unassigned: "Chưa giao",
    taskPlaceholder: "vd: Thiết kế lại trang chủ",
    descPlaceholder: "Mô tả chi tiết công việc...",
    newItemPlaceholder: "Tạo mục mới cho nhóm",

    TODO: "Mới tạo",
    IN_PROGRESS: "Đang xử lý",
    REVIEW: "Chờ kiểm tra",
    DONE: "Đã hoàn thành",

    LOW: "Thấp",
    MEDIUM: "Trung bình",
    HIGH: "Cao",

    fullName: "Họ và tên",
    emailAddress: "Email",
    role: "Vai trò",
    jobRole: "Chức danh",
    accessLevel: "Quyền truy cập",
    avatarUrl: "URL ảnh đại diện (tuỳ chọn)",
    projectName: "Tên dự án",
    projectDescription: "Mô tả",
    assignTeamMembers: "Gán thành viên",
    updateDetails: "Cập nhật thông tin cá nhân",
    administrator: "Quản trị viên",
    teamMember: "Thành viên nhóm",
    projectPlaceholder: "vd: Thiết kế lại app di động",
    projectDescPlaceholder: "Mô tả ngắn phạm vi dự án...",

    notifications: "Thông báo",
    unread: "chưa đọc",
    markAllRead: "Đánh dấu đã đọc hết",
    viewAllActivity: "Xem mọi hoạt động",
    noNotifications: "Chưa có thông báo",

    loginTitle: "Đăng nhập",
    loginSubtitle: "Nhập tài khoản demo để tiếp tục",
    password: "Mật khẩu",
    loginButton: "Đăng nhập",
    loginError: "Email hoặc mật khẩu không đúng",
    demoHint: "Sản phẩm demo — dùng tài khoản trong SETUP.md",
  }
};
</file>

<file path=".env.example">
# Copy to .env and fill in real values. Never commit .env.

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
# Chỉ cần cho: npm run seed:auth (Admin API). Lấy ở Project Settings → API → service_role.
# KHÔNG đưa key này vào frontend / Vite.
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# GROQ_API_KEY is an Edge Function secret. Configure it with:
# supabase secrets set GROQ_API_KEY=your_key
# Never expose this secret through Vite or frontend environment variables.
</file>

<file path=".gitignore">
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.*
!.env.example
.env.local
.env.*.local
.env.development
.env.production
</file>

<file path="eslint.config.js">
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
])
</file>

<file path="index.html">
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/assets/f.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FASTBOARD</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
</file>

<file path="package.json">
{
  "name": "fastboard",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "seed:auth": "node scripts/seed-auth-users.mjs"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.90.1",
    "@tailwindcss/vite": "^4.1.18",
    "clsx": "^2.1.0",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "recharts": "^3.6.0",
    "tailwind-merge": "^2.2.1",
    "tailwindcss": "^4.1.18"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4",
    "vitest": "^3.2.4"
  }
}
</file>

<file path="tailwind.config.js">
module.exports = {
  content: [
    "./index.html",
    "./main.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
    }
  },
  plugins: [],
}
</file>

<file path="tsconfig.app.json">
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["node", "vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": false,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": false,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
</file>

<file path="tsconfig.json">
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
</file>

<file path="tsconfig.node.json">
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
</file>

<file path="vite.config.ts">
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [tailwindcss(), react()],
    define: {
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
    },
    test: {
      environment: 'node',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }
})
</file>

</files>
