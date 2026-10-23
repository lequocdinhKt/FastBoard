

import { useState, useEffect } from 'react';
import { User, TaskStatus, Task, Project, Notification } from '../types';
import { GUEST_USER } from '../constants';
import { supabase } from '../services/supabaseClient';

import { useUIState } from './modules/useUIState';
import { useDataFetching } from './modules/useDataFetching';
import { useSearchSystem } from './modules/useSearchSystem';
import { useEntityOperations } from './modules/useEntityOperations';


/** Chuyển một bản ghi `users` từ Supabase sang kiểu User dùng trong ứng dụng. */
const mapProfile = (row: Record<string, unknown>): User => ({
  id: String(row.id),
  name: String(row.name ?? ''),
  avatar: String(row.avatar ?? ''),
  role: row.role as User['role'],
  jobRole: row.job_role ? String(row.job_role) : undefined,
  email: row.email ? String(row.email) : undefined,
});


/** Chuyển một bản ghi `notifications` từ Supabase sang kiểu Notification của ứng dụng. */
const mapNotification = (row: Record<string, unknown>): Notification => ({
  id: String(row.id),
  userId: String(row.user_id),
  title: String(row.title),
  message: String(row.message),
  type: row.type as Notification['type'],
  read: Boolean(row.read),
  createdAt: String(row.created_at),
  taskId: row.task_id ? String(row.task_id) : undefined,
});


/** Ghép trạng thái, dữ liệu, xác thực và các thao tác nghiệp vụ thành API chung của ứng dụng. */
export const useAppLogic = () => {
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [user, setUser] = useState<User>(GUEST_USER);

  const ui = useUIState();
  const data = useDataFetching(isAuth, user, setUser, ui.actions.setIsLoading, ui.actions.addToast);
  const search = useSearchSystem(data.tasks);
  const ops = useEntityOperations(
    user, data.refetch,
    data.setTasks, data.setProjects, data.setUsers, setUser,
    ui.actions.addToast
  );

  
  /** Tải hồ sơ public của tài khoản Auth và cập nhật người dùng hiện tại. */
  const loadProfile = async (authUserId: string, email?: string | null) => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile', error);
    }

    if (profile) {
      setUser(mapProfile(profile));
    } else {
      setUser({
        ...GUEST_USER,
        id: authUserId,
        email: email || undefined,
        name: email?.split('@')[0] || 'User',
      });
    }
    setIsAuth(true);
  };

  
  /** Khôi phục phiên đăng nhập và lắng nghe các thay đổi trạng thái Auth. */
  useEffect(() => {
    let mounted = true;

    
    /** Khởi tạo trạng thái xác thực từ session đang được lưu. */
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!mounted) return;
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email);
      } else {
        setIsAuth(false);
        setUser(GUEST_USER);
      }
      setAuthReady(true);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session?.user) {
        setIsAuth(false);
        setUser(GUEST_USER);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        await loadProfile(session.user.id, session.user.email);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  
  /** Đồng bộ thông báo thời gian thực của người dùng hiện tại từ Supabase Realtime. */
  useEffect(() => {
    if (!isAuth || !user.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const n = mapNotification(payload.new as Record<string, unknown>);
            data.setNotifications((prev) => [n, ...prev.filter((x) => x.id !== n.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const n = mapNotification(payload.new as Record<string, unknown>);
            data.setNotifications((prev) => prev.map((x) => (x.id === n.id ? n : x)));
          } else if (payload.eventType === 'DELETE') {
            const oldId = String((payload.old as Record<string, unknown>).id);
            data.setNotifications((prev) => prev.filter((x) => x.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuth, user.id]);

  
  /** Đăng nhập bằng email/mật khẩu rồi tải hồ sơ tương ứng. */
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !signInData.user) {
      console.error('Login failed', error);
      return false;
    }
    await loadProfile(signInData.user.id, signInData.user.email);
    return true;
  };

  
  /** Đăng xuất và đưa trạng thái ứng dụng về người dùng khách. */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuth(false);
    setUser(GUEST_USER);
  };

  
  /** Lưu công việc và đóng biểu mẫu khi thao tác thành công. */
  const handleTaskSaveWrapper = async (task: Task) => {
    const success = await ops.handleTaskSave(task, !!ui.state.editingTask);
    if (success) {
        ui.actions.setTaskModalOpen(false);
        ui.actions.setEditingTask(null);
    }
  };

  
  /** Xóa công việc và đóng biểu mẫu khi thao tác thành công. */
  const handleTaskDeleteWrapper = async (taskId: string) => {
    const success = await ops.handleTaskDelete(taskId);
    if (success) {
        ui.actions.setTaskModalOpen(false);
        ui.actions.setEditingTask(null);
    }
  };

  
  /** Lưu dự án và đặt lại trạng thái chỉnh sửa khi thành công. */
  const handleProjectSaveWrapper = async (project: Project) => {
    const success = await ops.handleProjectSave(project, !!ui.state.editingProject);
    if (success) {
        ui.actions.setProjectModalOpen(false);
        ui.actions.setEditingProject(null);
    }
  };

  
  /** Xóa dự án và bỏ lựa chọn hiện tại nếu dự án đang mở bị xóa. */
  const handleProjectDeleteWrapper = async (projectId: string) => {
    const success = await ops.handleProjectDelete(projectId);
    if (success && ui.state.selectedProject?.id === projectId) {
        ui.actions.setSelectedProject(null);
    }
  };

  
  /** Lưu thông tin thành viên và đóng biểu mẫu khi thành công. */
  const handleMemberSaveWrapper = async (member: User) => {
    const success = await ops.handleMemberSave(member, !!ui.state.editingMember);
    if (success) {
        ui.actions.setMemberModalOpen(false);
        ui.actions.setEditingMember(null);
    }
  };

  
  /** Đánh dấu một thông báo đã đọc ở local state và database. */
  const markNotificationAsRead = async (id: string) => {
    data.setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  };

  
  /** Đánh dấu toàn bộ thông báo của người dùng hiện tại đã đọc. */
  const markAllNotificationsAsRead = async () => {
    data.setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
  };

  return {
    state: {
      ...ui.state,
      user, isAuth, authReady,
      tasks: search.filteredTasks, rawTasks: data.tasks, projects: data.projects, users: data.users,
      notifications: data.notifications,
      filters: search.filters,
    },
    actions: {
      ...ui.actions,
      setIsAuth,
      handleLogin,
      handleLogout,

      handleTaskSave: handleTaskSaveWrapper,
      handleTaskDelete: handleTaskDeleteWrapper,
      
      /** Cập nhật trạng thái công việc theo kiểu optimistic rồi đồng bộ xuống database. */
      handleUpdateTaskStatus: (id: string, s: TaskStatus) => {
          const existing = data.tasks.find(t => t.id === id);
          const completedAt = s === TaskStatus.DONE
            ? (existing?.completedAt || new Date().toISOString())
            : undefined;
          data.setTasks(prev => prev.map(t => t.id === id ? { ...t, status: s, completedAt } : t));
          ops.handleUpdateTaskStatus(id, s, completedAt);
      },
      
      /** Chuẩn bị trạng thái để tạo công việc mới với cột Kanban mặc định. */
      openNewTaskModal: (status?: TaskStatus) => {
          ui.actions.setEditingTask(null);
          ui.actions.setNewTaskStatus(status || TaskStatus.TODO);
          ui.actions.setTaskModalOpen(true);
      },
      
      /** Chọn công việc cần sửa và mở biểu mẫu chỉnh sửa. */
      openEditTaskModal: (task: Task) => {
          ui.actions.setEditingTask(task);
          ui.actions.setTaskModalOpen(true);
      },

      handleProjectSave: handleProjectSaveWrapper,
      handleProjectDelete: handleProjectDeleteWrapper,
      /** Xóa dự án đang chỉnh sửa và mở biểu mẫu tạo dự án mới. */
      openNewProjectModal: () => { ui.actions.setEditingProject(null); ui.actions.setProjectModalOpen(true); },
      /** Chọn dự án cần sửa và mở biểu mẫu chỉnh sửa. */
      openEditProjectModal: (p: Project) => { ui.actions.setEditingProject(p); ui.actions.setProjectModalOpen(true); },
      /** Mở trang chi tiết của dự án được chọn. */
      handleProjectClick: (p: Project) => { ui.actions.setSelectedProject(p); ui.actions.setActiveTab('projects'); },
      /** Bỏ dự án đang chọn để quay về danh sách dự án. */
      handleBackToProjects: () => ui.actions.setSelectedProject(null),

      /** Chuyển yêu cầu cập nhật hồ sơ tới lớp thao tác dữ liệu. */
      handleProfileUpdate: (u: User) => ops.handleProfileUpdate(u),
      handleMemberSave: handleMemberSaveWrapper,
      handleDeleteMember: ops.handleDeleteMember,
      /** Xóa thành viên đang chỉnh sửa và mở biểu mẫu thêm thành viên. */
      openNewMemberModal: () => { ui.actions.setEditingMember(null); ui.actions.setMemberModalOpen(true); },
      /** Chọn thành viên cần sửa và mở biểu mẫu chỉnh sửa. */
      openEditMemberModal: (m: User) => { ui.actions.setEditingMember(m); ui.actions.setMemberModalOpen(true); },
      /** Mở trang chi tiết của thành viên được chọn. */
      handleMemberClick: (m: User) => { ui.actions.setSelectedMember(m); ui.actions.setActiveTab('team'); },
      /** Bỏ thành viên đang chọn để quay về danh sách nhóm. */
      handleBackToTeam: () => ui.actions.setSelectedMember(null),

      setFilters: search.setFilters,

      markNotificationAsRead,
      markAllNotificationsAsRead
    }
  };
};
