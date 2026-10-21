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
