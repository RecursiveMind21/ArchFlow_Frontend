"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useParams } from "next/navigation";

import {
    ArrowRight,
    ArrowLeft,
    CheckSquare,
    ClipboardList,
    LayoutDashboard,
    Plus,
    Sparkles,
    Target,
    Timer,
    ListTodo,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { getTaskStats } from "@/lib/api/tasks";
import type { TaskStats } from "@/types/task";

export default function TasksDashboardPage() {
    const pathname = usePathname();
    const params = useParams();

    const projectId = params.id as string;

    const [stats, setStats] = useState<TaskStats | null>(null);
    const [loading, setLoading] = useState(true);

    const taskOptions = [
        {
            title: "Kanban Board",
            description:
                "Organize work visually across your workflow and keep every task moving forward.",
            href: `${pathname}/kanban`,
            icon: LayoutDashboard,
            tone: "text-blue-500 bg-blue-500/10 border-blue-500/20",
            color: "from-blue-500/20 to-blue-500/5",
            borderColor: "border-blue-500/20",
        },
        {
            title: "All Tasks",
            description:
                "Browse, filter, and manage every task across your projects in one place.",
            href: `${pathname}/all`,
            icon: ClipboardList,
            tone: "text-violet-500 bg-violet-500/10 border-violet-500/20",
            color: "from-violet-500/20 to-violet-500/5",
            borderColor: "border-violet-500/20",
        },
        {
            title: "Create New Task",
            description:
                "Add a task with an owner, priority, duration, and clear implementation details.",
            href: `${pathname}/create`,
            icon: Plus,
            tone: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
            color: "from-emerald-500/20 to-emerald-500/5",
            borderColor: "border-emerald-500/20",
        },
        {
            title: "Generate Tasks",
            description:
                "Turn your project requirements into a structured, actionable task list with AI.",
            href: `${pathname}/generate`,
            icon: Sparkles,
            tone: "text-amber-500 bg-amber-500/10 border-amber-500/20",
            color: "from-amber-500/20 to-amber-500/5",
            borderColor: "border-amber-500/20",
        },
    ];

    useEffect(() => {
        async function loadStats() {
            try {
                setLoading(true);

                const data = await getTaskStats(projectId);

                setStats(data);
            } catch (error) {
                console.error("Failed to load task stats:", error);
            } finally {
                setLoading(false);
            }
        }

        if (projectId) {
            loadStats();
        }
    }, [projectId]);

    const taskStats = [
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
            icon: CheckSquare,
        },
    ];

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

                        <Link href={`/projects/${projectId}`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mb-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>

                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                                    Tasks Dashboard
                                </h1>

                                <p className="text-lg text-muted-foreground">
                                    Plan, organize, and generate the work that
                                    moves your projects forward.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Task Stats */}
                    <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-700"
                        style={{ animationDelay: "100ms" }}
                    >
                        {taskStats.map((stat, index) => {
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
                                        {loading ? "—" : stat.value}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Task Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {taskOptions.map((option, index) => {
                            const Icon = option.icon;

                            return (
                                <Link
                                    key={option.title}
                                    href={option.href}
                                    className="group relative animate-in fade-in zoom-in duration-500"
                                    style={{
                                        animationDelay: `${300 + index * 50}ms`,
                                    }}
                                >
                                    {/* Glow */}
                                    <div
                                        className={`absolute -inset-1 bg-gradient-to-r ${option.color} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}
                                    />

                                    {/* Card */}
                                    <article
                                        className={`relative bg-card border-2 ${option.borderColor} rounded-xl p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col`}
                                    >
                                        <div
                                            className={`mb-4 inline-flex p-3 rounded-xl ${option.tone} group-hover:scale-110 transition-transform duration-500 self-start`}
                                        >
                                            <Icon className="w-7 h-7" />
                                        </div>

                                        <div className="flex items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                                    {option.title}
                                                </h2>

                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {option.description}
                                                </p>
                                            </div>

                                            <ArrowRight className="w-5 h-5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                                        </div>

                                        <div className="mt-4 text-sm text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            View Details
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </article>
                                </Link>
                            );
                        })}
                    </div>

                </div>
            </div>
        </main>
    );
}