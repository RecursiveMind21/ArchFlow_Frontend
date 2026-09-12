"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    Circle,
    Clock3,
    Download,
    Filter,
    ListTodo,
    Search,
    Target,
    Timer,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    deleteTask,
    getTasks,
    getTaskStats,
    updateTaskStatus,
} from "@/lib/api/tasks";

import type {
    Task,
    TaskStatus,
    TaskStats,
} from "@/types/task";

const statusOptions: TaskStatus[] = [
    "Planned",
    "In Progress",
    "Review",
    "Completed",
];

const getStatusStyles = (status: string) => {
    switch (status) {
        case "Completed":
            return {
                wrapper:
                    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                icon: CheckCircle2,
            };

        case "In Progress":
            return {
                wrapper:
                    "border-amber-500/30 bg-amber-500/10 text-amber-400",
                icon: Clock3,
            };

        case "Review":
            return {
                wrapper:
                    "border-blue-500/30 bg-blue-500/10 text-blue-400",
                icon: Clock3,
            };

        default:
            return {
                wrapper:
                    "border-border bg-secondary/40 text-muted-foreground",
                icon: Circle,
            };
    }
};

const getPriorityStyles = (priority: string) => {
    switch (priority) {
        case "Critical":
            return "border-rose-500/30 bg-rose-500/10 text-rose-400";

        case "High":
            return "border-orange-500/30 bg-orange-500/10 text-orange-400";

        case "Medium":
            return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

        case "Low":
            return "border-border bg-secondary/40 text-muted-foreground";

        default:
            return "border-border bg-secondary/40 text-muted-foreground";
    }
};

const getEstimate = (durationHours: number | null) => {
    if (durationHours === null || durationHours === undefined) {
        return "Not estimated";
    }

    return `${durationHours}h`;
};

export default function AllTasksPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<TaskStats | null>(null);

    const [query, setQuery] = useState("");
    const [openStatus, setOpenStatus] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
    const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTasks() {
            try {
                setLoading(true);
                setError(null);

                const [tasksData, statsData] = await Promise.all([
                    getTasks(projectId),
                    getTaskStats(projectId),
                ]);

                setTasks(tasksData);
                setStats(statsData);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load tasks.",
                );
            } finally {
                setLoading(false);
            }
        }

        if (projectId) {
            loadTasks();
        }
    }, [projectId]);

    const filteredTasks = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return tasks;
        }

        return tasks.filter((task) =>
            `${task.title} ${task.type} ${task.owner ?? ""}`
                .toLowerCase()
                .includes(normalizedQuery),
        );
    }, [tasks, query]);

    async function handleStatusChange(
        taskId: number,
        status: TaskStatus,
    ) {
        try {
            setUpdatingTaskId(taskId);
            setError(null);

            const updatedTask = await updateTaskStatus(
                projectId,
                taskId,
                { status },
            );

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task.id === taskId ? updatedTask : task,
                ),
            );

            const updatedStats = await getTaskStats(projectId);
            setStats(updatedStats);

            setOpenStatus(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update task status.",
            );
        } finally {
            setUpdatingTaskId(null);
        }
    }

    async function handleDeleteTask(taskId: number) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?",
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingTaskId(taskId);
            setError(null);

            await deleteTask(projectId, taskId);

            setTasks((currentTasks) =>
                currentTasks.filter((task) => task.id !== taskId),
            );

            const updatedStats = await getTaskStats(projectId);
            setStats(updatedStats);

            if (openStatus === taskId) {
                setOpenStatus(null);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete task.",
            );
        } finally {
            setDeletingTaskId(null);
        }
    }

    function exportTasks() {
        if (tasks.length === 0) {
            return;
        }

        const header = [
            "Title",
            "Description",
            "Type",
            "Priority",
            "Status",
            "Owner",
            "Duration (Hours)",
            "Source",
        ];

        const rows = tasks.map((task) => [
            task.title,
            task.description ?? "",
            task.type,
            task.priority,
            task.status,
            task.owner ?? "",
            task.durationHours ?? "",
            task.source,
        ]);

        const csv = [header, ...rows]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value).replace(/"/g, '""')}"`,
                    )
                    .join(","),
            )
            .join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `project-${projectId}-tasks.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 text-foreground">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
                        <Link href={`/projects/${projectId}/tasks`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Tasks
                            </Button>
                        </Link>

                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div className="max-w-2xl">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                    Task Workspace
                                </p>

                                <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                                    All Tasks
                                </h1>

                                <p className="text-lg text-muted-foreground">
                                    Review every generated and manually created
                                    task in one consistent workspace.
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportTasks}
                                disabled={loading || tasks.length === 0}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Tasks
                            </Button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in duration-500">
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="space-y-8">

                            {/* Stats Skeleton */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[1, 2, 3, 4].map((item) => (
                                    <div
                                        key={item}
                                        className="bg-card border border-border rounded-lg p-4 animate-pulse"
                                    >
                                        <div className="h-4 w-24 rounded bg-secondary mb-3" />
                                        <div className="h-8 w-12 rounded bg-secondary" />
                                    </div>
                                ))}
                            </div>

                            {/* Workspace Skeleton */}
                            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 animate-pulse">
                                <div className="flex justify-between mb-6">
                                    <div>
                                        <div className="h-3 w-28 rounded bg-secondary mb-3" />
                                        <div className="h-6 w-44 rounded bg-secondary" />
                                    </div>

                                    <div className="h-10 w-48 rounded bg-secondary" />
                                </div>

                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <div
                                            key={item}
                                            className="h-20 rounded-xl bg-secondary/50"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-700"
                                style={{ animationDelay: "100ms" }}
                            >
                                {[
                                    {
                                        label: "Total Tasks",
                                        value: stats?.totalTasks ?? 0,
                                        icon: ListTodo,
                                    },
                                    {
                                        label: "High Priority",
                                        value: stats?.highPriority ?? 0,
                                        icon: Target,
                                    },
                                    {
                                        label: "In Progress",
                                        value: stats?.inProgress ?? 0,
                                        icon: Timer,
                                    },
                                    {
                                        label: "Completed",
                                        value: stats?.completed ?? 0,
                                        icon: CheckCircle2,
                                    },
                                ].map((stat, index) => {
                                    const Icon = stat.icon;

                                    return (
                                        <div
                                            key={stat.label}
                                            className="bg-card border border-border rounded-lg p-4 animate-in fade-in zoom-in duration-500"
                                            style={{
                                                animationDelay: `${150 + index * 50}ms`,
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icon className="w-4 h-4 text-primary" />

                                                <p className="text-xs text-muted-foreground">
                                                    {stat.label}
                                                </p>
                                            </div>

                                            <p className="text-2xl font-bold text-foreground">
                                                {stat.value}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Tasks Workspace */}
                            <section
                                className="rounded-2xl border border-border bg-card p-5 sm:p-6 animate-in fade-in slide-in-from-bottom duration-700"
                                style={{ animationDelay: "300ms" }}
                            >
                                {/* Workspace Header */}
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                                            Workspace Overview
                                        </p>

                                        <h2 className="mt-2 text-xl font-bold text-foreground">
                                            Every project task
                                        </h2>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3">
                                            <Search className="h-4 w-4 text-muted-foreground" />

                                            <input
                                                value={query}
                                                onChange={(event) =>
                                                    setQuery(event.target.value)
                                                }
                                                placeholder="Search tasks"
                                                className="w-32 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                                            />
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            aria-label="Filter tasks"
                                        >
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Task List */}
                                <div className="space-y-3">
                                    {filteredTasks.map((task, index) => {
                                        const statusStyles =
                                            getStatusStyles(task.status);

                                        const StatusIcon =
                                            statusStyles.icon;

                                        const isOpen =
                                            openStatus === task.id;

                                        const isUpdating =
                                            updatingTaskId === task.id;

                                        const isDeleting =
                                            deletingTaskId === task.id;

                                        return (
                                            <div
                                                key={task.id}
                                                className={`
                                                    group relative flex flex-col gap-4
                                                    rounded-xl border border-border
                                                    bg-background/40 p-4
                                                    transition-all duration-500
                                                    animate-in fade-in zoom-in
                                                    sm:flex-row sm:items-center
                                                    ${isOpen
                                                        ? "z-50"
                                                        : "z-0"
                                                    }
                                                    ${!isOpen
                                                        ? "hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                                                        : ""
                                                    }
                                                `}
                                                style={{
                                                    animationDelay: `${400 + index * 75
                                                        }ms`,
                                                }}
                                            >
                                                {/* Task Info */}
                                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                                    <StatusIcon
                                                        className={`
                                                            h-5 w-5 shrink-0
                                                            transition-transform
                                                            duration-300
                                                            group-hover:scale-110
                                                            ${task.status ===
                                                                "Completed"
                                                                ? "text-emerald-400"
                                                                : task.status ===
                                                                    "In Progress"
                                                                    ? "text-amber-400"
                                                                    : task.status ===
                                                                        "Review"
                                                                        ? "text-blue-400"
                                                                        : "text-muted-foreground"
                                                            }
                                                        `}
                                                    />

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                                                            {index + 1}.{" "}
                                                            {task.title}
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {task.owner ??
                                                                "Unassigned"}{" "}
                                                            · {task.type}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Task Controls */}
                                                <div className="flex flex-wrap items-center gap-3 sm:justify-end">

                                                    {/* Status Dropdown */}
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isUpdating ||
                                                                isDeleting
                                                            }
                                                            onClick={() =>
                                                                setOpenStatus(
                                                                    isOpen
                                                                        ? null
                                                                        : task.id,
                                                                )
                                                            }
                                                            className={`
                                                                flex min-w-[135px]
                                                                items-center
                                                                justify-between
                                                                gap-2 rounded-full
                                                                border px-3 py-1.5
                                                                text-xs font-medium
                                                                transition-all
                                                                duration-200
                                                                hover:shadow-sm
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-60
                                                                ${statusStyles.wrapper}
                                                            `}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <StatusIcon className="h-3.5 w-3.5" />

                                                                {isUpdating
                                                                    ? "Updating..."
                                                                    : task.status}
                                                            </span>

                                                            <ChevronDown
                                                                className={`
                                                                    h-3.5 w-3.5
                                                                    transition-transform
                                                                    duration-200
                                                                    ${isOpen
                                                                        ? "rotate-180"
                                                                        : ""
                                                                    }
                                                                `}
                                                            />
                                                        </button>

                                                        {/* Dropdown */}
                                                        {isOpen && (
                                                            <div
                                                                className="
                                                                    absolute right-0
                                                                    top-[calc(100%+8px)]
                                                                    z-[9999]
                                                                    w-44
                                                                    overflow-hidden
                                                                    rounded-xl
                                                                    border
                                                                    border-border
                                                                    bg-card
                                                                    p-1.5
                                                                    shadow-2xl
                                                                    animate-in
                                                                    fade-in
                                                                    zoom-in-95
                                                                    duration-200
                                                                "
                                                            >
                                                                {statusOptions.map(
                                                                    (option) => {
                                                                        const optionStyles =
                                                                            getStatusStyles(
                                                                                option,
                                                                            );

                                                                        const OptionIcon =
                                                                            optionStyles.icon;

                                                                        const isSelected =
                                                                            task.status ===
                                                                            option;

                                                                        return (
                                                                            <button
                                                                                key={
                                                                                    option
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleStatusChange(
                                                                                        task.id,
                                                                                        option,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    isUpdating ||
                                                                                    isDeleting
                                                                                }
                                                                                className={`
                                                                                    flex
                                                                                    w-full
                                                                                    items-center
                                                                                    gap-2
                                                                                    rounded-lg
                                                                                    px-3
                                                                                    py-2.5
                                                                                    text-left
                                                                                    text-xs
                                                                                    font-medium
                                                                                    transition-colors
                                                                                    disabled:opacity-50
                                                                                    ${isSelected
                                                                                        ? "bg-primary/10 text-primary"
                                                                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                                                    }
                                                                                `}
                                                                            >
                                                                                <OptionIcon
                                                                                    className={`
                                                                                        h-3.5
                                                                                        w-3.5
                                                                                        ${isSelected
                                                                                            ? "text-primary"
                                                                                            : ""
                                                                                        }
                                                                                    `}
                                                                                />

                                                                                <span>
                                                                                    {
                                                                                        option
                                                                                    }
                                                                                </span>

                                                                                {isSelected && (
                                                                                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-primary" />
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Priority */}
                                                    <span
                                                        className={`
                                                            rounded-full
                                                            border px-2.5 py-1
                                                            text-[11px]
                                                            font-medium
                                                            ${getPriorityStyles(
                                                            task.priority,
                                                        )}
                                                        `}
                                                    >
                                                        {task.priority}
                                                    </span>

                                                    {/* Estimate */}
                                                    <span
                                                        className="
                                                            rounded-full
                                                            border border-border
                                                            bg-secondary/30
                                                            px-2.5 py-1
                                                            text-[11px]
                                                            font-medium
                                                            text-muted-foreground
                                                        "
                                                    >
                                                        {getEstimate(
                                                            task.durationHours,
                                                        )}
                                                    </span>

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteTask(
                                                                task.id,
                                                            )
                                                        }
                                                        disabled={
                                                            isDeleting ||
                                                            isUpdating
                                                        }
                                                        aria-label={`Delete ${task.title}`}
                                                        title="Delete task"
                                                        className="
                                                            flex h-8 w-8
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            border
                                                            border-rose-500/20
                                                            bg-rose-500/5
                                                            text-rose-400
                                                            transition-all
                                                            duration-200
                                                            hover:border-rose-500/40
                                                            hover:bg-rose-500/10
                                                            hover:text-rose-300
                                                            hover:shadow-sm
                                                            disabled:cursor-not-allowed
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        <Trash2
                                                            className={`
                                                                h-3.5 w-3.5
                                                                transition-transform
                                                                duration-200
                                                                ${isDeleting
                                                                    ? "animate-pulse"
                                                                    : "group-hover:scale-110"
                                                                }
                                                            `}
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {filteredTasks.length === 0 && (
                                        <p className="py-8 text-center text-sm text-muted-foreground">
                                            {query
                                                ? "No tasks match your search."
                                                : "No tasks found for this project."}
                                        </p>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}