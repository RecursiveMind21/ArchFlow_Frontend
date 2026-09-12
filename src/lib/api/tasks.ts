import { fetchWithAuth } from "./fetchWithAuth";

import type {
  Task,
  TaskStats,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  MoveTaskRequest,
  GeneratedTasksResponse,
} from "@/types/task";

function getTasksPath(projectId: number | string) {
  return `/projects/${projectId}/tasks`;
}

/**
 * Get all tasks for a project.
 *
 * Optional filters are sent as query parameters.
 */
export async function getTasks(
  projectId: number | string,
  filters?: {
    search?: string;
    status?: string;
    priority?: string;
    owner?: string;
  },
): Promise<Task[]> {
  const params = new URLSearchParams();

  if (filters?.search) {
    params.set("search", filters.search);
  }

  if (filters?.status) {
    params.set("status", filters.status);
  }

  if (filters?.priority) {
    params.set("priority", filters.priority);
  }

  if (filters?.owner) {
    params.set("owner", filters.owner);
  }

  const query = params.toString();

  const res = await fetchWithAuth(
    `${getTasksPath(projectId)}${query ? `?${query}` : ""}`,
    {
      method: "GET",
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.message ?? "Failed to fetch tasks");
  }

  return res.json() as Promise<Task[]>;
}

/**
 * Get task statistics for a project.
 */
export async function getTaskStats(
  projectId: number | string,
): Promise<TaskStats> {
  const res = await fetchWithAuth(`${getTasksPath(projectId)}/stats`, {
    method: "GET",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.message ?? "Failed to fetch task statistics");
  }

  return res.json() as Promise<TaskStats>;
}

/**
 * Get one task.
 */
export async function getTask(
  projectId: number | string,
  taskId: number | string,
): Promise<Task> {
  const res = await fetchWithAuth(`${getTasksPath(projectId)}/${taskId}`, {
    method: "GET",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.message ?? "Failed to fetch task");
  }

  return res.json() as Promise<Task>;
}

/**
 * Create a manual task.
 */
export async function createTask(
  projectId: number | string,
  payload: CreateTaskRequest,
): Promise<Task> {
  const res = await fetchWithAuth(getTasksPath(projectId), {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.message ?? "Failed to create task");
  }

  return res.json() as Promise<Task>;
}

/**
 * Update task details.
 */
export async function updateTask(
  projectId: number | string,
  taskId: number | string,
  payload: UpdateTaskRequest,
): Promise<Task> {
  const res = await fetchWithAuth(`${getTasksPath(projectId)}/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.message ?? "Failed to update task");
  }

  return res.json() as Promise<Task>;
}

/**
 * Update task status.
 */
export async function updateTaskStatus(
  projectId: number | string,
  taskId: number | string,
  payload: UpdateTaskStatusRequest,
): Promise<Task> {
  const res = await fetchWithAuth(
    `${getTasksPath(projectId)}/${taskId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.message ?? "Failed to update task status");
  }

  return res.json() as Promise<Task>;
}

/**
 * Move task inside the Kanban board.
 */
export async function moveTask(
  projectId: number | string,
  taskId: number | string,
  payload: MoveTaskRequest,
): Promise<Task> {
  const res = await fetchWithAuth(
    `${getTasksPath(projectId)}/${taskId}/position`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.message ?? "Failed to move task");
  }

  return res.json() as Promise<Task>;
}

/**
 * Delete one task.
 */
export async function deleteTask(
  projectId: number | string,
  taskId: number | string,
): Promise<void> {
  const res = await fetchWithAuth(`${getTasksPath(projectId)}/${taskId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.message ?? "Failed to delete task");
  }
}

/**
 * Delete all tasks in a project.
 */
export async function deleteAllTasks(
  projectId: number | string,
): Promise<void> {
  const res = await fetchWithAuth(getTasksPath(projectId), {
    method: "DELETE",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.message ?? "Failed to delete tasks");
  }
}

/**
 * Generate AI tasks for the project.
 *
 * Backend returns the generated/saved tasks.
 */
export async function generateTasks(
  projectId: number | string,
): Promise<Task[]> {
  const res = await fetchWithAuth(`${getTasksPath(projectId)}/generate`, {
    method: "POST",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.message ?? "Failed to generate tasks");
  }

  return res.json() as Promise<Task[]>;
}
