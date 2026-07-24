

import { TaskStatus, Priority } from './enums';


export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'MEMBER';
  jobRole?: string;
  email?: string;
}


export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}


export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assigneeId?: string; 
}


export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  dueDate: string;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  createdAt: string;
  completedAt?: string;
}


export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  progress: number;
  members: string[];
}


export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'STATUS_CHANGE' | 'COMMENT' | 'DUE_DATE';
  read: boolean;
  createdAt: string;
  taskId?: string;
}
