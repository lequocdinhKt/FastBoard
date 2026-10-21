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
