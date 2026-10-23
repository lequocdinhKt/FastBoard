

import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Task, Project, User, Notification } from '../../types';


/** Quản lý local state và tải dữ liệu nghiệp vụ sau khi người dùng đăng nhập. */
export const useDataFetching = (
  isAuth: boolean, 
  user: User, 
  setUser: (u: User) => void,
  setIsLoading: (l: boolean) => void,
  addToast: (t: 'success' | 'error', m: string) => void
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  
  /** Tải người dùng, dự án, thành viên dự án, công việc và thông báo từ Supabase. */
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.from('users').select('*');
      if (userData) {
          const mappedUsers = userData.map((u: any) => ({
              id: u.id,
              name: u.name,
              avatar: u.avatar,
              role: u.role,
              jobRole: u.job_role,
              email: u.email
          }));
          setUsers(mappedUsers as User[]);
          
          const currentUserData = mappedUsers.find((u: User) => u.id === user.id);
          if (currentUserData) {
            setUser(currentUserData);
          }
      }

      const { data: projectData } = await supabase.from('projects').select('*');
      const { data: memberRows } = await supabase.from('project_members').select('project_id, user_id');

      if (projectData) {
        const membersByProject = new Map<string, string[]>();
        (memberRows || []).forEach((row: any) => {
          const list = membersByProject.get(row.project_id) || [];
          list.push(row.user_id);
          membersByProject.set(row.project_id, list);
        });

        setProjects(projectData.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          progress: p.progress,
          members: membersByProject.get(p.id) || [],
        })) as Project[]);
      }

      const { data: taskData } = await supabase
        .from('tasks')
        .select(`*, subtasks (*), comments (*)`)
        .order('created_at', { ascending: false });

      if (taskData) {
        const formattedTasks: Task[] = taskData.map((t: any) => ({
          id: t.id,
          projectId: t.project_id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assignee_id,
          dueDate: t.due_date,
          tags: t.tags || [],
          subtasks: (t.subtasks || []).map((st: any) => ({
             id: st.id,
             title: st.title,
             completed: st.completed,
             assigneeId: st.assignee_id 
          })),
          comments: (t.comments || []).map((c: any) => ({
             id: c.id,
             userId: c.user_id,
             text: c.text,
             createdAt: c.created_at
          })),
          createdAt: t.created_at,
          completedAt: t.completed_at || undefined
        }));
        setTasks(formattedTasks);
      }
      
      if (user.id) {
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (notifData) {
          setNotifications(notifData.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.read,
            createdAt: n.created_at,
            taskId: n.task_id,
          })) as Notification[]);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      addToast('error', 'Failed to load initial data.');
    } finally {
      setIsLoading(false);
    }
  };

  
  /** Tự động tải lại dữ liệu khi phiên đăng nhập hoặc người dùng hiện tại thay đổi. */
  useEffect(() => {
    if (isAuth && user.id) {
      fetchData();
    }
  }, [isAuth, user.id]);

  return {
    tasks, setTasks,
    projects, setProjects,
    users, setUsers,
    notifications, setNotifications,
    refetch: fetchData
  };
};
