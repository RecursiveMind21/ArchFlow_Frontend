"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
    ArrowLeft,
    CheckSquare,
    Download,
    ListTodo,
    Target,
    Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GenerateTasksDiagram } from "@/components/tasks/generate-tasks-diagram";

import { generateTasks } from "@/lib/api/tasks";
import type { Task } from "@/types/task";

export default function GenerateTasksPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadGeneratedTasks() {
            try {
                setLoading(true);
                setError(null);

                const generatedTasks = await generateTasks(projectId);

                setTasks(generatedTasks);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to generate tasks.",
                );
            } finally {
                setLoading(false);
            }
        }

        if (projectId) {
            loadGeneratedTasks();
        }
    }, [projectId]);

    const stats = useMemo(() => {
        return [
            {
                label: "Total Tasks",
                value: tasks.length,
                icon: ListTodo,
            },
            {
                label: "High Priority",
                value: tasks.filter(
                    (task) =>
                        task.priority === "High" ||
                        task.priority === "Critical",
                ).length,
                icon: Target,
            },
            {
                label: "In Progress",
                value: tasks.filter(
                    (task) => task.status === "In Progress",
                ).length,
                icon: Timer,
            },
            {
                label: "Completed",
                value: tasks.filter(
                    (task) => task.status === "Completed",
                ).length,
                icon: CheckSquare,
            },
        ];
    }, [tasks]);

    function exportTasks() {
        if (tasks.length === 0) return;

        const csvHeader = [
            "Title",
            "Description",
            "Type",
            "Priority",
            "Status",
            "Owner",
            "Duration (Hours)",
        ];

        const csvRows = tasks.map((task) => [
            task.title,
            task.description ?? "",
            task.type,
            task.priority,
            task.status,
            task.owner ?? "",
            task.durationHours ?? "",
        ]);

        const csvContent = [
            csvHeader,
            ...csvRows,
        ]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value).replace(/"/g, '""')}"`,
                    )
                    .join(","),
            )
            .join("\n");

        const blob = new Blob([csvContent], {
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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
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
                                Back to Dashboard
                            </Button>
                        </Link>

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                                    Generated project tasks
                                </h1>

                                <p className="text-lg text-muted-foreground">
                                    A structured implementation plan generated
                                    from your project requirements.
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportTasks}
                                disabled={loading || tasks.length === 0}
                                className="animate-in fade-in duration-700"
                                style={{ animationDelay: "100ms" }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export Tasks
                            </Button>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="space-y-8">
                            <div
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-700"
                                style={{ animationDelay: "100ms" }}
                            >
                                {[1, 2, 3, 4].map((item) => (
                                    <div
                                        key={item}
                                        className="bg-card border border-border rounded-lg p-4 animate-pulse"
                                    >
                                        <div className="h-4 w-24 bg-secondary rounded mb-3" />
                                        <div className="h-8 w-12 bg-secondary rounded" />
                                    </div>
                                ))}
                            </div>

                            <div className="bg-card border border-border rounded-xl p-8 animate-pulse">
                                <div className="h-6 w-48 bg-secondary rounded mb-6" />

                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <div
                                            key={item}
                                            className="h-20 bg-secondary/60 rounded-lg"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div
                            className="bg-card border border-destructive/30 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-500"
                        >
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                Failed to generate tasks
                            </h2>

                            <p className="text-muted-foreground mb-6">
                                {error}
                            </p>

                            <Button
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {/* Generated Tasks */}
                    {!loading && !error && (
                        <>
                            {/* Task Stats */}
                            <div
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-700"
                                style={{ animationDelay: "100ms" }}
                            >
                                {stats.map((stat, index) => {
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

                            <div
                                className="animate-in fade-in slide-in-from-bottom duration-700"
                                style={{ animationDelay: "300ms" }}
                            >
                                <GenerateTasksDiagram tasks={tasks} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}