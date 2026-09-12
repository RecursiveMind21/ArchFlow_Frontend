export type TaskStatus = "Planned" | "In Progress" | "Review" | "Completed";

export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  type: string;
  priority: TaskPriority;
  status: TaskStatus;
  owner: string | null;
  durationHours: number | null;
  source: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: string;
  priority: TaskPriority;
  owner?: string;
  durationHours?: number;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  type: string;
  priority: TaskPriority;
  owner?: string;
  durationHours?: number;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface MoveTaskRequest {
  status: TaskStatus;
  position: number;
}

export interface TaskStats {
  totalTasks: number;
  highPriority: number;
  inProgress: number;
  completed: number;
}

export interface GeneratedTask {
  title: string;
  description: string;
  type: string;
  priority: TaskPriority;
  status: TaskStatus;
  owner: string;
  durationHours: number;
}

export interface GeneratedTasksResponse {
  tasks: GeneratedTask[];
}
