export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
}

export type NewTask = Omit<Task, 'id' | 'userId' | 'createdAt'>;

export interface Category {
  id: string;
  name: string;
  color: string;
  description: string;
  count: number;
}
