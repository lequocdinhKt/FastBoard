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
