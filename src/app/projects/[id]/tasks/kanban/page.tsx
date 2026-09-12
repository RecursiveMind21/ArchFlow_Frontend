"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Circle,
    Clock3,
    Download,
    LayoutDashboard,
    Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
    getTasks,
    moveTask,
} from "@/lib/api/tasks";

import type {
    Task,
    TaskStatus,
} from "@/types/task";

const columns: {
    status: TaskStatus;
    label: string;
    tone: string;
    dot: string;
}[] = [
        {
            status: "Planned",
            label: "Planned",
            tone: "text-slate-400",
            dot: "bg-slate-400",
        },
        {
            status: "In Progress",
            label: "In Progress",
            tone: "text-amber-400",
            dot: "bg-amber-400",
        },
        {
            status: "Review",
            label: "Review",
            tone: "text-violet-400",
            dot: "bg-violet-400",
        },
        {
            status: "Completed",
            label: "Completed",
            tone: "text-emerald-400",
            dot: "bg-emerald-400",
        },
    ];

function StatusIcon({ status }: { status: TaskStatus }) {
    if (status === "Completed") {
        return (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        );
    }

    if (status === "In Progress") {
        return (
            <Clock3 className="h-4 w-4 text-amber-400" />
        );
    }

    if (status === "Review") {
        return (
            <Clock3 className="h-4 w-4 text-violet-400" />
        );
    }

    return (
        <Circle className="h-4 w-4 text-muted-foreground" />
    );
}

function getPriorityStyles(priority: string) {
    switch (priority) {
        case "Critical":
            return "border-rose-500/30 bg-rose-500/10 text-rose-400";

        case "High":
            return "border-orange-500/30 bg-orange-500/10 text-orange-400";

        case "Medium":
            return "border-border bg-secondary/40 text-muted-foreground";

        case "Low":
            return "border-border bg-secondary/40 text-muted-foreground";

        default:
            return "border-border bg-secondary/40 text-muted-foreground";
    }
}

function getEstimate(durationHours: number | null) {
    if (durationHours === null || durationHours === undefined) {
        return "Not estimated";
    }

    return `${durationHours}h`;
}

export default function KanbanPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [tasks, setTasks] = useState<Task[]>([]);
    const [draggedTaskId, setDraggedTaskId] = useState<number | null>(
        null,
    );

    const [loading, setLoading] = useState(true);
    const [movingTaskId, setMovingTaskId] = useState<number | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTasks() {
            try {
                setLoading(true);
                setError(null);

                const data = await getTasks(projectId);

                setTasks(data);
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

    async function handleDrop(targetStatus: TaskStatus) {
        if (draggedTaskId === null) {
            return;
        }

        const draggedTask = tasks.find(
            (task) => task.id === draggedTaskId,
        );

        if (!draggedTask) {
            setDraggedTaskId(null);
            return;
        }

        const targetColumnTasks = tasks
            .filter(
                (task) =>
                    task.status === targetStatus &&
                    task.id !== draggedTaskId,
            )
            .sort(
                (a, b) => a.position - b.position,
            );

        const newPosition =
            targetColumnTasks.length > 0
                ? Math.max(
                    ...targetColumnTasks.map(
                        (task) => task.position,
                    ),
                ) + 1
                : 0;

        if (draggedTask.status === targetStatus) {
            setDraggedTaskId(null);
            return;
        }

        const previousTasks = tasks;

        /*
         * Optimistic UI update.
         */
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === draggedTaskId
                    ? {
                        ...task,
                        status: targetStatus,
                        position: newPosition,
                    }
                    : task,
            ),
        );

        setDraggedTaskId(null);

        try {
            setMovingTaskId(draggedTaskId);
            setError(null);

            const updatedTask = await moveTask(
                projectId,
                draggedTaskId,
                {
                    status: targetStatus,
                    position: newPosition,
                },
            );

            setTasks((currentTasks) =>
                currentTasks.map((task) =>
                    task.id === draggedTaskId
                        ? updatedTask
                        : task,
                ),
            );
        } catch (err) {
            setTasks(previousTasks);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to move task.",
            );
        } finally {
            setMovingTaskId(null);
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
                <div className="max-w-[1800px] mx-auto">

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

                                <div className="mb-3 flex items-center gap-2">
                                    <LayoutDashboard className="h-4 w-4 text-primary" />

                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                                        Task Workspace
                                    </p>
                                </div>

                                <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                                    Kanban Board
                                </h1>

                                <p className="text-lg text-muted-foreground">
                                    Move the same project tasks through each
                                    stage of delivery.
                                </p>

                            </div>

                            <div
                                className="flex gap-2 animate-in fade-in duration-700"
                                style={{
                                    animationDelay: "100ms",
                                }}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportTasks}
                                    disabled={
                                        loading ||
                                        tasks.length === 0
                                    }
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Tasks
                                </Button>

                                <Link
                                    href={`/projects/${projectId}/tasks/create`}
                                >
                                    <Button size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Task
                                    </Button>
                                </Link>
                            </div>
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
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">

                            {[1, 2, 3, 4].map((column) => (
                                <section
                                    key={column}
                                    className="h-[calc(100vh-330px)] min-h-[500px] rounded-2xl border border-border bg-card/80 p-4 animate-pulse"
                                >
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="h-5 w-24 rounded bg-secondary" />

                                        <div className="h-5 w-8 rounded-full bg-secondary" />
                                    </div>

                                    <div className="space-y-3">
                                        {[1, 2, 3, 4].map((task) => (
                                            <div
                                                key={task}
                                                className="h-32 rounded-xl bg-secondary/50"
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}

                        </div>
                    ) : (

                        /* Kanban Board */
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr]">

                            {columns.map(
                                (column, columnIndex) => {

                                    const columnTasks = tasks
                                        .filter(
                                            (task) =>
                                                task.status ===
                                                column.status,
                                        )
                                        .sort(
                                            (a, b) =>
                                                a.position -
                                                b.position,
                                        );

                                    const isPlanned =
                                        column.status ===
                                        "Planned";

                                    return (
                                        <section
                                            key={column.status}
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                            }}
                                            onDrop={() =>
                                                handleDrop(
                                                    column.status,
                                                )
                                            }
                                            className={`
                                                h-[calc(100vh-330px)]
                                                min-h-[500px]
                                                rounded-2xl
                                                border
                                                border-border
                                                bg-card/80
                                                p-4
                                                transition-all
                                                duration-500
                                                animate-in
                                                fade-in
                                                zoom-in
                                                ${draggedTaskId !==
                                                    null
                                                    ? "hover:border-primary/50 hover:bg-card"
                                                    : ""
                                                }
                                            `}
                                            style={{
                                                animationDelay: `${200 +
                                                    columnIndex *
                                                    75
                                                    }ms`,
                                            }}
                                        >

                                            {/* Column Header */}
                                            <div className="mb-4 flex shrink-0 items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${column.dot}`}
                                                    />

                                                    <h2
                                                        className={`font-semibold ${column.tone}`}
                                                    >
                                                        {
                                                            column.label
                                                        }
                                                    </h2>
                                                </div>

                                                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                                                    {
                                                        columnTasks.length
                                                    }
                                                </span>
                                            </div>

                                            {/* Scrollable Column Content */}
                                            <div className="h-[calc(100%-48px)] overflow-y-auto pr-1 scrollbar-thin">

                                                <div
                                                    className={
                                                        isPlanned
                                                            ? "grid grid-cols-2 gap-4"
                                                            : "space-y-3"
                                                    }
                                                >

                                                    {columnTasks.map(
                                                        (
                                                            task,
                                                            taskIndex,
                                                        ) => {

                                                            const isMoving =
                                                                movingTaskId ===
                                                                task.id;

                                                            return (
                                                                <article
                                                                    key={
                                                                        task.id
                                                                    }
                                                                    draggable={
                                                                        !isMoving
                                                                    }
                                                                    onDragStart={() =>
                                                                        setDraggedTaskId(
                                                                            task.id,
                                                                        )
                                                                    }
                                                                    onDragEnd={() =>
                                                                        setDraggedTaskId(
                                                                            null,
                                                                        )
                                                                    }
                                                                    className={`
                                                                        group
                                                                        cursor-grab
                                                                        rounded-xl
                                                                        border
                                                                        border-border
                                                                        bg-background/70
                                                                        p-5
                                                                        shadow-sm
                                                                        transition-all
                                                                        duration-500
                                                                        hover:-translate-y-1
                                                                        hover:border-primary/40
                                                                        hover:shadow-xl
                                                                        active:cursor-grabbing
                                                                        animate-in
                                                                        fade-in
                                                                        zoom-in
                                                                        ${isMoving
                                                                            ? "opacity-60"
                                                                            : ""
                                                                        }
                                                                    `}
                                                                    style={{
                                                                        animationDelay: `${350 +
                                                                            columnIndex *
                                                                            75 +
                                                                            taskIndex *
                                                                            50
                                                                            }ms`,
                                                                    }}
                                                                >

                                                                    {/* Task Header */}
                                                                    <div className="mb-3 flex items-start justify-between gap-2">

                                                                        <div className="flex min-w-0 items-center gap-2">

                                                                            <div className="transition-transform duration-300 group-hover:scale-110">
                                                                                <StatusIcon
                                                                                    status={
                                                                                        task.status
                                                                                    }
                                                                                />
                                                                            </div>

                                                                            <p className="min-w-0 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                                                                                {
                                                                                    task.title
                                                                                }
                                                                            </p>

                                                                        </div>

                                                                        <span
                                                                            className={`
                                                                                shrink-0
                                                                                rounded-full
                                                                                border
                                                                                px-2
                                                                                py-0.5
                                                                                text-[10px]
                                                                                font-semibold
                                                                                uppercase
                                                                                tracking-wide
                                                                                ${getPriorityStyles(
                                                                                task.priority,
                                                                            )}
                                                                            `}
                                                                        >
                                                                            {
                                                                                task.priority
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                    {/* Task Info */}
                                                                    <p className="mb-4 text-xs text-muted-foreground">
                                                                        {task.owner ??
                                                                            "Unassigned"}{" "}
                                                                        ·{" "}
                                                                        {
                                                                            task.type
                                                                        }
                                                                    </p>

                                                                    {/* Task Footer */}
                                                                    <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">

                                                                        <span>
                                                                            {getEstimate(
                                                                                task.durationHours,
                                                                            )}
                                                                        </span>

                                                                        <span
                                                                            className={`
                                                                                transition-colors
                                                                                ${task.status ===
                                                                                    "Completed"
                                                                                    ? "text-emerald-400"
                                                                                    : task.status ===
                                                                                        "In Progress"
                                                                                        ? "text-amber-400"
                                                                                        : task.status ===
                                                                                            "Review"
                                                                                            ? "text-violet-400"
                                                                                            : "text-muted-foreground"
                                                                                }
                                                                            `}
                                                                        >
                                                                            {
                                                                                task.status
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                    {/* Hover Hint */}
                                                                    <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                                        Drag
                                                                        to
                                                                        move

                                                                        <ArrowRight className="h-3 w-3" />
                                                                    </div>

                                                                </article>
                                                            );
                                                        },
                                                    )}

                                                    {/* Empty Column */}
                                                    {columnTasks.length ===
                                                        0 && (
                                                            <div
                                                                className={`
                                                                flex
                                                                min-h-[120px]
                                                                items-center
                                                                justify-center
                                                                rounded-xl
                                                                border
                                                                border-dashed
                                                                border-border
                                                                text-center
                                                                animate-in
                                                                fade-in
                                                                duration-500
                                                                ${isPlanned
                                                                        ? "col-span-2"
                                                                        : ""
                                                                    }
                                                            `}
                                                            >
                                                                <p className="text-xs text-muted-foreground">
                                                                    Drop tasks
                                                                    here
                                                                </p>
                                                            </div>
                                                        )}

                                                </div>

                                            </div>
                                        </section>
                                    );
                                },
                            )}

                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}