'use client';

import { useState, useEffect } from 'react';
import {
    ArrowLeft, Server, Layout, Database, Network, FileText, Users,
    MessageSquare, GitBranch, Settings, Download, Eye, CheckCircle2,
    Clock, Zap, ListTodo, Sparkles, Loader2, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TeamMember {
    id: number;
    userId: number;
    name: string;
    role: string;
    isYou: boolean;
}

interface Team {
    id: number;
    name: string;
    description: string | null;
    setupComplete: boolean;
    members: TeamMember[];
    currentUserRole: 'owner' | 'admin' | 'member' | null;
}

type ViewState = 'loading' | 'owner' | 'member' | 'error';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProjectDashboardPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [view, setView] = useState<ViewState>('loading');
    const [team, setTeam] = useState<Team | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setView('loading');
            setError(null);
            try {
                const res = await fetchWithAuth(`/projects/${projectId}/team`, {
                    method: 'GET',
                });

                // 204 = no team yet → caller must be the owner (members always have a team)
                if (res.status === 204) {
                    setView('owner');
                    return;
                }

                if (!res.ok) throw new Error('Failed to load project');

                const data: Team = await res.json();
                setTeam(data);

                if (data.currentUserRole === 'owner' || data.currentUserRole === 'admin') {
                    setView('owner');
                } else {
                    setView('member');
                }
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
                setView('error');
            }
        };
        load();
    }, [projectId]);

    // ── Loading ─────────────────────────────────────────────────────────────

    if (view === 'loading') {
        return (
            <Shell>
                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading project...</p>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Error ───────────────────────────────────────────────────────────────

    if (view === 'error') {
        return (
            <Shell>
                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="text-center max-w-md px-4">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <Link href="/projects">
                            <Button>Back to Projects</Button>
                        </Link>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── MEMBER VIEW — new dashboard, no Leader Tools ────────────────────────

    if (view === 'member' && team) {
        return <NewDashboard team={team} projectId={projectId} isLeader={false} />;
    }

    // ── OWNER VIEW — original 8-card dashboard ──────────────────────────────

    const dashboardCards = [
        {
            id: 'backend-arch',
            icon: <Server className="w-8 h-8" />,
            title: 'Backend Architecture',
            description: 'View and manage backend services, APIs, and microservices architecture',
            href: `/projects/${projectId}/backend-architecture`,
            color: 'from-blue-500/20 to-blue-500/5',
            borderColor: 'border-blue-500/20',
        },
        {
            id: 'frontend-arch',
            icon: <Layout className="w-8 h-8" />,
            title: 'Frontend Architecture',
            description: 'Explore UI components, state management, and frontend structure',
            href: `/projects/${projectId}/frontend-architecture`,
            color: 'from-purple-500/20 to-purple-500/5',
            borderColor: 'border-purple-500/20',
        },
        {
            id: 'database-arch',
            icon: <Database className="w-8 h-8" />,
            title: 'Database Architecture',
            description: 'Design database schema, relationships, and data models',
            href: `/projects/${projectId}/database-architecture`,
            color: 'from-green-500/20 to-green-500/5',
            borderColor: 'border-green-500/20',
        },
        {
            id: 'api-design',
            icon: <Network className="w-8 h-8" />,
            title: 'API Design',
            description: 'Define REST/GraphQL endpoints, request/response schemas',
            href: `/projects/${projectId}/api-design`,
            color: 'from-orange-500/20 to-orange-500/5',
            borderColor: 'border-orange-500/20',
        },
        {
            id: 'requirements',
            icon: <FileText className="w-8 h-8" />,
            title: 'Requirements Document',
            description: 'View complete requirements, user stories, and acceptance criteria',
            href: `/projects/${projectId}/requirements`,
            color: 'from-indigo-500/20 to-indigo-500/5',
            borderColor: 'border-indigo-500/20',
        },
        {
            id: 'tasks',
            icon: <GitBranch className="w-8 h-8" />,
            title: 'Task Management',
            description: 'Generate and manage tasks with modern board',
            href: `/projects/${projectId}/tasks`,
            color: 'from-pink-500/20 to-pink-500/5',
            borderColor: 'border-pink-500/20',
        },
        {
            id: 'track-repository',
            icon: <GitBranch className="w-8 h-8" />,
            title: 'Track Repository',
            description: 'Link a GitHub repository to sync code, commits, and project activity',
            href: `/projects/${projectId}/track-repository`,
            color: 'from-emerald-500/20 to-emerald-500/5',
            borderColor: 'border-emerald-500/20',
        },
        {
            id: 'manage-team',
            icon: <Users className="w-8 h-8" />,
            title: 'Manage Team',
            description: team
                ? 'Open the team workspace — tasks, chat, AI, and member management'
                : 'Set up a team to collaborate on this project',
            href: `/projects/${projectId}/workspace`,
            color: 'from-emerald-500/20 to-emerald-500/5',
            borderColor: 'border-emerald-500/20',
        },
    ];

    return (
        <Shell>
            <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
                <Link href="/projects">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Button>
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                            Project Dashboard
                        </h1>
                        <p className="text-lg text-muted-foreground mb-4">
                            Manage and explore all aspects of your project architecture
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in duration-700"
                style={{ animationDelay: '100ms' }}
            >
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm mb-1">Total Modules</p>
                            <p className="text-3xl font-bold text-foreground">8</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <Zap className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm mb-1">Status</p>
                            <p className="text-xl font-bold text-foreground flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Active
                            </p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
                            <Eye className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-muted-foreground text-sm mb-1">Last Updated</p>
                            <p className="text-xl font-bold text-foreground">Today</p>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Project Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardCards.map((card, index) => (
                        <Link
                            key={card.id}
                            href={card.href}
                            className="group relative animate-in fade-in zoom-in duration-500"
                            style={{ animationDelay: `${200 + index * 50}ms` }}
                        >
                            <div className={`absolute -inset-1 bg-gradient-to-r ${card.color} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                            <div className={`relative bg-card border-2 ${card.borderColor} rounded-xl p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col`}>
                                <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 self-start">
                                    {card.icon}
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                                    {card.description}
                                </p>
                                <div className="mt-4 text-sm text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    View Details
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </Shell>
    );
}

// ─── New dashboard component (used by members here, and by workspace for leader)

export function NewDashboard({
    team,
    projectId,
    isLeader,
}: {
    team: Team;
    projectId: string;
    isLeader: boolean;
}) {
    const primaryOptions = [
        {
            id: 'tasks',
            icon: <ListTodo className="w-10 h-10" />,
            title: 'Tasks',
            description: isLeader
                ? 'Assign existing tasks to team members and track who\'s doing what.'
                : 'Tasks assigned to you. Update status as you make progress.',
            href: `/projects/${projectId}/workspace/tasks`,
            color: 'from-blue-500/20 to-blue-500/5',
            borderColor: 'border-blue-500/30',
            accentColor: 'text-blue-400',
        },
        {
            id: 'ai',
            icon: <Sparkles className="w-10 h-10" />,
            title: 'AI Assistant',
            description: 'Build with an AI that knows your project. Ask anything, get answers.',
            href: `/projects/${projectId}/workspace/ai`, 
            color: 'from-purple-500/20 to-purple-500/5',
            borderColor: 'border-purple-500/30',
            accentColor: 'text-purple-400',
        },
        {
            id: 'team-chat',
            icon: <MessageSquare className="w-10 h-10" />,
            title: 'Team Chat',
            description: 'Talk with your team. Leaders get extra tools to manage members.',
            href: `/projects/${projectId}/workspace/chat`,
            color: 'from-emerald-500/20 to-emerald-500/5',
            borderColor: 'border-emerald-500/30',
            accentColor: 'text-emerald-400',
        },
    ];

    const architectureModules = [
        { label: 'Backend Architecture', icon: <Server className="w-4 h-4" />, href: `/projects/${projectId}/backend-architecture` },
        { label: 'Frontend Architecture', icon: <Layout className="w-4 h-4" />, href: `/projects/${projectId}/frontend-architecture` },
        { label: 'Database Architecture', icon: <Database className="w-4 h-4" />, href: `/projects/${projectId}/database-architecture` },
        { label: 'API Design', icon: <Network className="w-4 h-4" />, href: `/projects/${projectId}/api-design` },
        { label: 'Requirements', icon: <FileText className="w-4 h-4" />, href: `/projects/${projectId}/requirements` },
        { label: 'Track Repository', icon: <GitBranch className="w-4 h-4" />, href: `/projects/${projectId}/track-repository` },
    ];

    return (
        <Shell>
            <Link href="/projects">
                <Button variant="ghost" size="sm" className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                </Button>
            </Link>

            <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                                <Users className="w-3.5 h-3.5" />
                                {team.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                            Project Dashboard
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Build, track, and ship — with AI at your side.
                        </p>
                    </div>
                    {isLeader && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Link href={`/projects/${projectId}/team`}>
                                <Button variant="outline" size="sm">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Manage Team
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {primaryOptions.map((opt, index) => (
                    <Link
                        key={opt.id}
                        href={opt.href}
                        className="group relative animate-in fade-in zoom-in duration-500"
                        style={{ animationDelay: `${100 + index * 80}ms` }}
                    >
                        <div className={`absolute -inset-1 bg-gradient-to-r ${opt.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                        <div className={`relative bg-card border-2 ${opt.borderColor} rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col`}>
                            <div className={`mb-6 inline-flex p-4 rounded-2xl bg-primary/10 ${opt.accentColor} group-hover:scale-110 transition-transform duration-500 self-start`}>
                                {opt.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">{opt.title}</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{opt.description}</p>
                            <div className={`mt-6 text-sm font-medium flex items-center gap-1 ${opt.accentColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                Open
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {isLeader && (
                <div className="mb-12">
                    <Link
                        href={`/projects/${projectId}/team`}
                        className="block bg-card border-2 border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/50 hover:-translate-y-1 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/15 rounded-xl text-amber-400 shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-amber-400 mb-1">Leader Tools</p>
                                <p className="font-bold text-foreground mb-1">Manage Team</p>
                                <p className="text-sm text-muted-foreground">
                                    Invite new members, change roles, or remove people
                                </p>
                            </div>
                            <ArrowLeft className="w-5 h-5 text-muted-foreground shrink-0 rotate-180" />
                        </div>
                    </Link>
                </div>
            )}

            <div>
                <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Architecture &amp; Documents
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {architectureModules.map((mod) => (
                        <Link
                            key={mod.href}
                            href={mod.href}
                            className="bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col items-center gap-2 text-center"
                        >
                            <span className="text-primary">{mod.icon}</span>
                            <p className="text-xs font-medium text-foreground">{mod.label}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </Shell>
    );
}

// ─── Shared ──────────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-7xl mx-auto">{children}</div>
            </div>
        </div>
    );
}