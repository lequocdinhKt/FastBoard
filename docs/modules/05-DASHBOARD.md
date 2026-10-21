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
