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
