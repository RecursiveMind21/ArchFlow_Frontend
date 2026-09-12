"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { useParams } from "next/navigation";

import {
    ArrowLeft,
    CalendarClock,
    CheckCircle2,
    ClipboardPlus,
    FileText,
    UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { createTask } from "@/lib/api/tasks";

import type {
    CreateTaskRequest,
} from "@/types/task";

export default function CreateTaskPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [created, setCreated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const form = event.currentTarget;

        try {
            setLoading(true);
            setError(null);

            const formData = new FormData(form);

            const durationValue = String(
                formData.get("duration") ?? "",
            ).trim();

            const payload: CreateTaskRequest = {
                title: String(
                    formData.get("title") ?? "",
                ).trim(),

                description: String(
                    formData.get("description") ?? "",
                ).trim(),

                type: String(
                    formData.get("type") ?? "Feature",
                ),

                priority: String(
                    formData.get("priority") ?? "Medium",
                ) as CreateTaskRequest["priority"],

                owner: String(
                    formData.get("owner") ?? "",
                ),

                durationHours: Number(durationValue),
            };

            await createTask(projectId, payload);

            form.reset();
            setCreated(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create task.",
            );
        } finally {
            setLoading(false);
        }
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

                        <Link
                            href={`/projects/${projectId}/tasks`}
                        >
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

                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                    Task Workspace
                                </p>

                                <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                                    Create a New Task
                                </h1>

                                <p className="text-lg text-muted-foreground">
                                    Add a focused piece of work to the same
                                    workflow used by your generated tasks.
                                </p>

                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in duration-500">
                            {error}
                        </div>
                    )}

                    {/* Form + Checklist */}
                    <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr]">

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-left duration-700 sm:p-8"
                            style={{
                                animationDelay: "150ms",
                            }}
                        >

                            {/* Form Header */}
                            <div className="mb-8 flex items-center gap-3 border-b border-border pb-5">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                    <ClipboardPlus className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="font-bold text-foreground">
                                        Task Details
                                    </h2>

                                    <p className="text-sm text-muted-foreground">
                                        Describe the work clearly.
                                    </p>
                                </div>

                            </div>

                            <div className="space-y-5">

                                {/* Title */}
                                <div>
                                    <label
                                        htmlFor="title"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Task Title
                                    </label>

                                    <input
                                        id="title"
                                        name="title"
                                        required
                                        placeholder="e.g. Build task API routes"
                                        className="w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label
                                        htmlFor="description"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="description"
                                        name="description"
                                        required
                                        rows={5}
                                        placeholder="What needs to be completed?"
                                        className="w-full resize-none rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {/* Type + Priority */}
                                <div className="grid gap-5 sm:grid-cols-2">

                                    {/* Type */}
                                    <div>
                                        <label
                                            htmlFor="type"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Type
                                        </label>

                                        <select
                                            id="type"
                                            name="type"
                                            defaultValue="Feature"
                                            className="w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option>
                                                Feature
                                            </option>

                                            <option>
                                                Planning
                                            </option>

                                            <option>
                                                Backend
                                            </option>

                                            <option>
                                                Interface
                                            </option>

                                            <option>
                                                Testing
                                            </option>
                                        </select>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label
                                            htmlFor="priority"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Priority
                                        </label>

                                        <select
                                            id="priority"
                                            name="priority"
                                            defaultValue="Medium"
                                            className="w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option>
                                                Medium
                                            </option>

                                            <option>
                                                High
                                            </option>

                                            <option>
                                                Critical
                                            </option>

                                            <option>
                                                Low
                                            </option>
                                        </select>
                                    </div>

                                </div>

                                {/* Owner + Duration */}
                                <div className="grid gap-5 sm:grid-cols-2">

                                    {/* Owner */}
                                    <div>
                                        <label
                                            htmlFor="owner"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Owner
                                        </label>

                                        <select
                                            id="owner"
                                            name="owner"
                                            defaultValue="Engineering"
                                            className="w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option>
                                                Engineering
                                            </option>

                                            <option>
                                                Frontend
                                            </option>

                                            <option>
                                                Platform
                                            </option>

                                            <option>
                                                Product
                                            </option>

                                            <option>
                                                QA
                                            </option>
                                        </select>
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <label
                                            htmlFor="duration"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Task Duration
                                        </label>

                                        <div className="relative">
                                            <input
                                                id="duration"
                                                name="duration"
                                                type="number"
                                                min="0.5"
                                                step="0.5"
                                                required
                                                placeholder="e.g. 4"
                                                className="w-full rounded-lg border border-border bg-background/40 px-3 py-2.5 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />

                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                                hrs
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex justify-end gap-3">

                                <Link
                                    href={`/projects/${projectId}/tasks`}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </Link>

                                <Button
                                    type="submit"
                                    className="gap-2"
                                    disabled={loading}
                                >
                                    <FileText className="h-4 w-4" />

                                    {loading
                                        ? "Creating..."
                                        : "Create Task"}
                                </Button>

                            </div>
                        </form>

                        {/* Checklist / Success */}
                        <aside
                            className="h-fit rounded-2xl border border-border bg-card p-6 animate-in fade-in slide-in-from-right duration-700 sm:p-7"
                            style={{
                                animationDelay: "250ms",
                            }}
                        >

                            {created ? (
                                <div className="py-8 text-center animate-in fade-in zoom-in duration-500">

                                    <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-400" />

                                    <h2 className="text-xl font-bold text-foreground">
                                        Task Created
                                    </h2>

                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        Your task has been added to the
                                        workspace and is ready for planning.
                                    </p>

                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">

                                        <Link
                                            href={`/projects/${projectId}/tasks/all`}
                                            className="inline-flex rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                                        >
                                            View All Tasks
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCreated(false)
                                            }
                                            className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                        >
                                            Create Another
                                        </button>

                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                                        Task Checklist
                                    </p>

                                    <h2 className="mt-3 text-xl font-bold text-foreground">
                                        Keep work actionable
                                    </h2>

                                    <div className="mt-6 space-y-5 text-sm text-muted-foreground">

                                        <div className="flex gap-3">
                                            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                                            <p>
                                                Assign a clear owner so
                                                responsibility is visible.
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                                            <p>
                                                Estimate the task duration in
                                                hours so the workload is easy
                                                to plan.
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <ClipboardPlus className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                                            <p>
                                                Use one focused title and
                                                description per task.
                                            </p>
                                        </div>

                                    </div>
                                </>
                            )}

                        </aside>
                    </div>
                </div>
            </div>
        </main>
    );
}