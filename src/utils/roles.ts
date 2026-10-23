

import { User } from '../types';


/** Kiểm tra người dùng có vai trò quản trị hay không. */
export const isAdmin = (user: Pick<User, 'role'> | null | undefined): boolean =>
  user?.role === 'ADMIN';


/** Kiểm tra người dùng có quyền quản lý thành viên hay không. */
export const canManageMembers = (user: Pick<User, 'role'> | null | undefined): boolean =>
  isAdmin(user);


/** Kiểm tra tác nhân có quyền thay đổi vai trò của một người dùng hay không. */
export const canChangeUserRole = (
  actor: Pick<User, 'id' | 'role'> | null | undefined,
  _targetId: string
): boolean => {
  if (!actor || !isAdmin(actor)) return false;
  return true;
};


/** Chọn vai trò hợp lệ khi cập nhật hồ sơ, ngăn thành viên tự nâng quyền. */
export const resolveRoleForProfileUpdate = (
  actor: User,
  updated: User
): User['role'] => {
  if (!isAdmin(actor)) return actor.role;
  if (updated.id === actor.id) return updated.role;
  return updated.role;
};
