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
