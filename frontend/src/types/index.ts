export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdBy: User;
  assignedTo?: User;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  todo: number;
  'in-progress': number;
  done: number;
  total: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
