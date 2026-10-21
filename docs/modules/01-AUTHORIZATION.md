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
