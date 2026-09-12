"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";

import {
    CheckCircle2,
    Circle,
    Clock3,
    Flag,
    Link2,
    Sparkles,
} from "lucide-react";

import type { Task } from "@/types/task";

interface GenerateTasksDiagramProps {
    tasks: Task[];
}

const tones = [
    "border-blue-500/30 bg-blue-500/10 text-blue-300",
    "border-violet-500/30 bg-violet-500/10 text-violet-300",
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    "border-amber-500/30 bg-amber-500/10 text-amber-300",
    "border-rose-500/30 bg-rose-500/10 text-rose-300",
];

function getEstimate(durationHours: number | null) {
    if (durationHours === null || durationHours === undefined) {
        return "Not estimated";
    }

    return `${durationHours}h`;
}

function getTaskTone(index: number) {
    return tones[index % tones.length];
}

export function GenerateTasksDiagram({
    tasks,
}: GenerateTasksDiagramProps) {
    const [selectedId, setSelectedId] = useState<number | null>(
        tasks[0]?.id ?? null,
    );

    useEffect(() => {
        if (
            selectedId === null ||
            !tasks.some((task) => task.id === selectedId)
        ) {
            setSelectedId(tasks[0]?.id ?? null);
        }
    }, [tasks, selectedId]);

    const selected =
        tasks.find((task) => task.id === selectedId) ?? tasks[0];

    if (!selected) {
        return (
            <div className="rounded-2xl border border-border bg-card p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-bold text-foreground">
                    No tasks generated
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    The project does not have any generated tasks yet.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

            {/* Generated Workflow */}
            <section
                className="rounded-2xl border border-border bg-card p-5 sm:p-6 animate-in fade-in slide-in-from-left duration-700"
                style={{ animationDelay: "350ms" }}
            >
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                            Generated workflow
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-foreground">
                            Project task structure
                        </h2>
                    </div>

                    <Badge variant="outline">
                        {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                    </Badge>
                </div>

                <div className="space-y-3">
                    {tasks.map((task, index) => (
                        <button
                            key={task.id}
                            type="button"
                            onClick={() => setSelectedId(task.id)}
                            className={`
                                group w-full rounded-xl border p-4 text-left
                                transition-all duration-500
                                animate-in fade-in zoom-in
                                ${selected.id === task.id
                                    ? "border-primary/60 bg-primary/5 shadow-lg"
                                    : "border-border bg-background/40 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg"
                                }
                            `}
                            style={{
                                animationDuration: "500ms",
                                animationDelay: `${400 + index * 75}ms`,
                            }}
                        >
                            <div className="flex items-start gap-3">

                                {/* Status Icon */}
                                {task.status === "Completed" ? (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400 transition-transform duration-500 group-hover:scale-110" />
                                ) : task.status === "In Progress" ? (
                                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400 transition-transform duration-500 group-hover:scale-110" />
                                ) : task.status === "Review" ? (
                                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400 transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-500 group-hover:scale-110" />
                                )}

                                <div className="min-w-0 flex-1">

                                    {/* Title + Type */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                                            {index + 1}. {task.title}
                                        </span>

                                        <span
                                            className={`
                                                rounded-full border px-2 py-0.5
                                                text-[10px] font-medium
                                                ${getTaskTone(index)}
                                            `}
                                        >
                                            {task.type}
                                        </span>
                                    </div>

                                    {/* Task Metadata */}
                                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                        <span>{task.status}</span>

                                        <span>
                                            {getEstimate(task.durationHours)}
                                        </span>

                                        <span>
                                            {task.priority} priority
                                        </span>

                                        {task.owner && (
                                            <span>
                                                {task.owner}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Selected Task */}
            <aside
                className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-6 animate-in fade-in slide-in-from-right duration-700"
                style={{ animationDelay: "450ms" }}
            >
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-500 hover:scale-110">
                    <Sparkles className="h-5 w-5" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Selected task
                </p>

                <h2 className="mt-2 text-2xl font-bold text-foreground">
                    {selected.title}
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {selected.description || "No description provided."}
                </p>

                <div className="mt-6 space-y-4 border-t border-border pt-5 text-sm">

                    {/* Priority */}
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                            Priority
                        </span>

                        <span className="flex items-center gap-2 font-medium text-foreground">
                            <Flag className="h-4 w-4 text-amber-400" />
                            {selected.priority}
                        </span>
                    </div>

                    {/* Estimate */}
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                            Estimate
                        </span>

                        <span className="font-medium text-foreground">
                            {getEstimate(selected.durationHours)}
                        </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                            Status
                        </span>

                        <span className="font-medium text-foreground">
                            {selected.status}
                        </span>
                    </div>

                    {/* Type */}
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                            Type
                        </span>

                        <span className="font-medium text-foreground">
                            {selected.type}
                        </span>
                    </div>

                    {/* Owner */}
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                            Owner
                        </span>

                        <span className="font-medium text-foreground">
                            {selected.owner || "Unassigned"}
                        </span>
                    </div>

                    {/* Dependency */}
                    <div>
                        <span className="text-muted-foreground">
                            Dependency
                        </span>

                        <p className="mt-2 flex items-center gap-2 text-foreground">
                            <Link2 className="h-4 w-4 text-primary" />
                            Not specified
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}