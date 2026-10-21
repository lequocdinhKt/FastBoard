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
