# Cách tìm logic xử lý trong FASTBOARD

Tài liệu này chỉ liệt kê logic nghiệp vụ và hàm xử lý. Các component hiển thị trong `src/components` không được đưa vào đây.

## Điểm bắt đầu

Luồng gọi chính:

```text
useAppLogic
├── useUIState             trạng thái dùng chung, ngôn ngữ, thông báo tạm
├── useDataFetching        đọc dữ liệu từ Supabase
├── useSearchSystem        tìm kiếm và lọc công việc
└── useEntityOperations    ghi, sửa và xóa dữ liệu
```

Khi chưa biết chức năng nằm ở đâu, bắt đầu tại `src/hooks/useAppLogic.ts`. Object `actions` ở cuối hook cho biết tên hàm mà phần còn lại của ứng dụng có thể gọi.

## Tìm theo tên chức năng

Chạy tại thư mục gốc dự án:

```powershell
# Tìm chính xác tên hàm xử lý
rg -n "handleTaskSave|handleProjectSave" src/hooks src/services src/utils

# Tìm mọi handler liên quan đến công việc
rg -n "handle.*Task|Task.*=" src/hooks src/services src/utils

# Tìm nơi đọc/ghi một bảng Supabase
rg -n "from\('tasks'\)|from\('projects'\)" src/hooks src/services

# Tìm logic theo từ khóa nghiệp vụ
rg -n -i "login|notification|priority|member|project|task" src/hooks src/services src/utils

# Chỉ liệt kê khai báo hàm, không quét component giao diện
rg -n "^(export )?(const|function)|^\s+const\s+handle" src/hooks src/services src/utils
```

Trong VS Code/Codex có thể dùng `Ctrl+Shift+F`, nhập tên hàm hoặc tên bảng, rồi giới hạn **files to include** thành:

```text
src/hooks/**, src/services/**, src/utils/**
```

## Bản đồ chức năng

### Xác thực và điều phối

- `src/hooks/useAppLogic.ts`
  - `loadProfile`: tải hồ sơ sau khi có session Auth.
  - `handleLogin`, `handleLogout`: đăng nhập và đăng xuất.
  - `markNotificationAsRead`, `markAllNotificationsAsRead`: cập nhật trạng thái thông báo.
  - Các hàm `*Wrapper`: gọi logic ghi dữ liệu rồi dọn trạng thái biểu mẫu.

### Đọc dữ liệu

- `src/hooks/modules/useDataFetching.ts`
  - `fetchData`: tải người dùng, dự án, thành viên dự án, công việc, công việc con, bình luận và thông báo.
  - Đây cũng là nơi chuyển tên cột kiểu `snake_case` trong database sang `camelCase` của TypeScript.

### Ghi, sửa và xóa dữ liệu

- `src/hooks/modules/useEntityOperations.ts`
  - `handleTaskSave`, `handleTaskDelete`, `handleUpdateTaskStatus`.
  - `handleProjectSave`, `handleProjectDelete`, `syncProjectMembers`.
  - `handleMemberSave`, `handleDeleteMember`, `handleProfileUpdate`.

### Tìm kiếm và lọc

- `src/hooks/modules/useSearchSystem.ts`
  - `filteredTasks`: lọc theo từ khóa, mức ưu tiên và người phụ trách.

### Logic biểu mẫu công việc

- `src/hooks/useTaskForm.ts`
  - `handleSubmit`, `handleDelete`: gửi hoặc xóa công việc.
  - `addSubtask`, `updateSubtask`, `deleteSubtask`: xử lý công việc con.
  - `addComment`: tạo bình luận trong biểu mẫu.
  - `handleAISubtasks`, `handleAIPriority`: gọi chức năng AI.

### Thống kê Dashboard

- `src/hooks/useDashboardData.ts`
  - `statusData`: thống kê theo trạng thái.
  - `chartData`: số việc được tạo và đến hạn theo ngày.
  - `productivityStats`: năng suất tuần và thời gian hoàn thành trung bình.

### Dịch vụ và phân quyền

- `src/services/aiService.ts`: gọi các Supabase Edge Function AI.
- `src/services/supabaseClient.ts`: cấu hình client Supabase dùng chung.
- `src/utils/roles.ts`: kiểm tra quyền quản trị và bảo vệ thay đổi vai trò.

## Lần ngược một chức năng

Ví dụ với chức năng lưu công việc:

1. Tìm `handleTaskSave` trong `src/hooks/useAppLogic.ts` để thấy action được công khai.
2. Theo `handleTaskSaveWrapper` tới `ops.handleTaskSave`.
3. Mở `src/hooks/modules/useEntityOperations.ts` để xem payload ghi vào `tasks`, `subtasks` và `comments`.
4. Nếu cần biết cấu trúc dữ liệu, mở `src/types/models.ts` và `src/supabase_schema.sql`.

Theo cách này có thể đọc trọn logic mà không cần mở các file giao diện trong `src/components`.
