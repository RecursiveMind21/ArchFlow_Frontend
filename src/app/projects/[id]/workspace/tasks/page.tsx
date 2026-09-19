'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft,
    ListTodo,
    Users,
    Loader2,
    AlertCircle,
    Search,
    CheckCircle2,
    User,
    RefreshCw,
    Filter,
    ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Task {
    id: number;
    projectId: number;
    title: string;
    description: string | null;
    type: string;
    priority: string;
    status: string;
    owner: string | null;
    durationHours: number | null;
    source: string;
    position: number;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
    assignedToUserId: number | null;
    assignedToName: string | null;
}

interface TeamMember {
    id: number;
    userId: number;
    name: string;
    email: string | null;
    role: 'owner' | 'admin' | 'member';
    isYou: boolean;
}

interface Team {
    id: number;
    name: string;
    members: TeamMember[];
    currentUserRole: 'owner' | 'admin' | 'member' | null;
    setupComplete: boolean;
}

type PageState = 'loading' | 'ready' | 'no-access' | 'error';

const STATUSES = ['Planned', 'In Progress', 'Review', 'Completed'] as const;

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WorkspaceTasksPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [state, setState] = useState<PageState>('loading');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [team, setTeam] = useState<Team | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<number | null>(null);

    const [search, setSearch] = useState('');
    const [filterAssignee, setFilterAssignee] = useState<'all' | 'unassigned' | 'mine'>('all');

    const isManager =
        team?.currentUserRole === 'owner' || team?.currentUserRole === 'admin';
    const myUserId = team?.members.find((m) => m.isYou)?.userId ?? null;

    // ── Load ────────────────────────────────────────────────────────────────

    const loadAll = async () => {
        setState('loading');
        setError(null);
        try {
            const teamRes = await fetchWithAuth(
                `/projects/${projectId}/team`,
                { method: 'GET' }
            );

            if (teamRes.status === 204) {
                throw new Error('No team exists for this project yet');
            }
            if (!teamRes.ok) throw new Error('Failed to load team');

            const teamData: Team = await teamRes.json();
            setTeam(teamData);

            const role = teamData.currentUserRole;
            if (role !== 'owner' && role !== 'admin' && role !== 'member') {
                setState('no-access');
                return;
            }

            const tasksRes = await fetchWithAuth(
                `/projects/${projectId}/tasks`,
                { method: 'GET' }
            );

            if (!tasksRes.ok) throw new Error('Failed to load tasks');

            const tasksData: Task[] = await tasksRes.json();
            setTasks(tasksData);
            setState('ready');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setState('error');
        }
    };

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // ── Assign (leaders only) ───────────────────────────────────────────────

    const handleAssign = async (taskId: number, newUserId: number | null) => {
        setSavingId(taskId);
        setError(null);
        try {
            const res = await fetchWithAuth(
                `/projects/${projectId}/tasks/${taskId}/assign`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assignedToUserId: newUserId }),
                }
            );
            if (!res.ok) throw new Error('Failed to assign task');

            const updated: Task = await res.json();
            setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        } catch (err: any) {
            setError(err.message || 'Failed to assign task');
        } finally {
            setSavingId(null);
        }
    };

    // ── Update status (leaders on any task, members on their own) ───────────

    const handleStatusChange = async (taskId: number, newStatus: string) => {
        setSavingId(taskId);
        setError(null);
        try {
            const res = await fetchWithAuth(
                `/projects/${projectId}/tasks/${taskId}/status`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                }
            );
            if (!res.ok) throw new Error('Failed to update status');

            const updated: Task = await res.json();
            setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        } catch (err: any) {
            setError(err.message || 'Failed to update status');
        } finally {
            setSavingId(null);
        }
    };

    // ── Derived ─────────────────────────────────────────────────────────────

    // Members see ONLY tasks assigned to them.
    // Managers see every task.
    const visibleTasks = useMemo(() => {
        if (!myUserId) return [];
        if (isManager) return tasks;
        return tasks.filter((t) => t.assignedToUserId === myUserId);
    }, [tasks, isManager, myUserId]);

    const filteredTasks = useMemo(() => {
        const q = search.trim().toLowerCase();

        return visibleTasks.filter((task) => {
            const matchesSearch =
                !q ||
                task.title.toLowerCase().includes(q) ||
                (task.description ?? '').toLowerCase().includes(q) ||
                task.type.toLowerCase().includes(q);

            const matchesAssignee =
                filterAssignee === 'all' ||
                (filterAssignee === 'unassigned' && task.assignedToUserId === null) ||
                (filterAssignee === 'mine' && task.assignedToUserId === myUserId);

            return matchesSearch && matchesAssignee;
        });
    }, [visibleTasks, search, filterAssignee, myUserId]);

    const unassignedCount = visibleTasks.filter((t) => t.assignedToUserId === null).length;
    const mineCount = visibleTasks.filter((t) => t.assignedToUserId === myUserId).length;

    // ── Helpers ─────────────────────────────────────────────────────────────

    const priorityColor = (p: string) => {
        if (p === 'Critical') return 'border-red-500/40 bg-red-500/10 text-red-400';
        if (p === 'High') return 'border-orange-500/40 bg-orange-500/10 text-orange-400';
        if (p === 'Medium') return 'border-blue-500/40 bg-blue-500/10 text-blue-400';
        return 'border-border bg-background text-muted-foreground';
    };

    const statusColor = (s: string) => {
        if (s === 'Completed') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
        if (s === 'In Progress') return 'border-blue-500/40 bg-blue-500/10 text-blue-400';
        if (s === 'Review') return 'border-purple-500/40 bg-purple-500/10 text-purple-400';
        return 'border-border bg-background text-muted-foreground';
    };

    // Can the caller change status of this specific task?
    const canChangeStatus = (task: Task) => {
        if (isManager) return true;
        return task.assignedToUserId === myUserId;
    };

    // ── Loading ─────────────────────────────────────────────────────────────

    if (state === 'loading') {
        return (
            <Shell>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading tasks...</p>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── No access ───────────────────────────────────────────────────────────

    if (state === 'no-access') {
        return (
            <Shell>
                <BackToWorkspace />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md px-4">
                        <div className="inline-flex p-5 bg-destructive/15 border-2 border-destructive/40 rounded-2xl mb-6">
                            <ShieldAlert className="w-14 h-14 text-destructive" />
                        </div>
                        <h1 className="text-3xl font-bold text-foreground mb-3">
                            Access Restricted
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            You don't have access to this project's tasks.
                        </p>
                        <Link href={`/projects/${projectId}/workspace`}>
                            <Button>Back to Workspace</Button>
                        </Link>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Error ───────────────────────────────────────────────────────────────

    if (state === 'error' || !team) {
        return (
            <Shell>
                <BackToWorkspace />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md px-4">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={loadAll}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                            <Link href={`/projects/${projectId}/workspace`}>
                                <Button>Back to Workspace</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Ready ───────────────────────────────────────────────────────────────

    return (
        <Shell>
            <BackToWorkspace />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-500/15 rounded-xl text-blue-400">
                        <ListTodo className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                        {isManager ? 'Task Assignment' : 'My Tasks'}
                    </h1>
                </div>
                <p className="text-lg text-muted-foreground">
                    {isManager
                        ? 'Assign existing tasks to your team members and track progress.'
                        : 'Tasks assigned to you. Update status as you make progress.'}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ListTodo className="w-4 h-4 text-blue-400" />
                        <p className="text-xs text-muted-foreground">
                            {isManager ? 'Total' : 'Assigned to Me'}
                        </p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{visibleTasks.length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-orange-400" />
                        <p className="text-xs text-muted-foreground">Unassigned</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{unassignedCount}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <p className="text-xs text-muted-foreground">Mine</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{mineCount}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-purple-400" />
                        <p className="text-xs text-muted-foreground">Members</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{team.members.length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6">
                <div className="flex gap-4 flex-wrap items-center">
                    <div className="relative flex-1 min-w-48">
                        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        {(['all', 'unassigned', 'mine'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilterAssignee(f)}
                                className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors ${filterAssignee === f
                                        ? 'bg-primary/15 border-primary/40 text-primary'
                                        : 'border-border text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {f === 'all'
                                    ? 'All'
                                    : f === 'unassigned'
                                        ? `Unassigned (${unassignedCount})`
                                        : `Mine (${mineCount})`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Task list */}
            {filteredTasks.length === 0 ? (
                <div className="text-center py-16 bg-card border border-border rounded-xl">
                    <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                        {visibleTasks.length === 0
                            ? isManager
                                ? 'No tasks yet. Create or generate them from the Tasks dashboard first.'
                                : 'No tasks assigned to you yet.'
                            : 'No tasks match your filters.'}
                    </p>
                    {visibleTasks.length === 0 && isManager && (
                        <Link href={`/projects/${projectId}/tasks`}>
                            <Button>Go to Tasks Dashboard</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    {/* Header row — desktop */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-secondary/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <div className="col-span-4">Task</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-2">Priority</div>
                        <div className="col-span-2">
                            {isManager ? 'Assigned To' : 'Status'}
                        </div>
                        <div className="col-span-2">{isManager ? 'Status' : 'Update'}</div>
                    </div>

                    <div className="divide-y divide-border">
                        {filteredTasks.map((task) => {
                            const editable = canChangeStatus(task);
                            return (
                                <div
                                    key={task.id}
                                    className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-4 py-4 hover:bg-secondary/20 transition-colors"
                                >
                                    {/* Title + meta */}
                                    <div className="lg:col-span-4 min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                            {task.title}
                                        </p>
                                        {task.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                                {task.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {task.source === 'AI_GENERATED' && (
                                                <span className="text-xs px-2 py-0.5 rounded border border-purple-500/40 bg-purple-500/10 text-purple-400">
                                                    AI
                                                </span>
                                            )}
                                            {task.durationHours != null && (
                                                <span className="text-xs text-muted-foreground">
                                                    {task.durationHours}h
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Type */}
                                    <div className="lg:col-span-2 flex items-center">
                                        <span className="text-xs px-2 py-1 rounded border border-border bg-background text-muted-foreground">
                                            {task.type}
                                        </span>
                                    </div>

                                    {/* Priority */}
                                    <div className="lg:col-span-2 flex items-center">
                                        <span className={`text-xs px-2 py-1 rounded border ${priorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </div>

                                    {/* Assigned to (manager) OR status (member) */}
                                    <div className="lg:col-span-2 flex items-center gap-2">
                                        {isManager ? (
                                            <>
                                                <select
                                                    value={task.assignedToUserId ?? ''}
                                                    onChange={(e) =>
                                                        handleAssign(
                                                            task.id,
                                                            e.target.value ? Number(e.target.value) : null
                                                        )
                                                    }
                                                    disabled={savingId === task.id}
                                                    className="w-full text-sm px-2 py-1.5 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                                                >
                                                    <option value="">— Unassigned —</option>
                                                    {team.members.map((m) => (
                                                        <option key={m.userId} value={m.userId}>
                                                            {m.name}
                                                            {m.isYou ? ' (you)' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                {savingId === task.id && (
                                                    <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                                                )}
                                            </>
                                        ) : (
                                            <span className={`text-xs px-2 py-1 rounded border ${statusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                        )}
                                    </div>

                                    {/* Status dropdown — editable for manager or assignee */}
                                    <div className="lg:col-span-2 flex items-center gap-2">
                                        {editable ? (
                                            <>
                                                <select
                                                    value={task.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(task.id, e.target.value)
                                                    }
                                                    disabled={savingId === task.id}
                                                    className="w-full text-sm px-2 py-1.5 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </select>
                                                {savingId === task.id && !isManager && (
                                                    <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                                                )}
                                            </>
                                        ) : (
                                            <span className={`text-xs px-2 py-1 rounded border ${statusColor(task.status)}`}>
                                                {task.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </Shell>
    );
}

// ─── Shared ──────────────────────────────────────────────────────────────────

function BackToWorkspace() {
    const params = useParams();
    const projectId = params.id as string;
    return (
        <Link href={`/projects/${projectId}/workspace`}>
            <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workspace
            </Button>
        </Link>
    );
}

function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-6xl mx-auto">{children}</div>
            </div>
        </div>
    );
}