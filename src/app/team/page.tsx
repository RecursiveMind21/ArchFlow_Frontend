'use client';

import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Users,
    Loader2,
    AlertCircle,
    Crown,
    Shield,
    User,
    FolderOpen,
    ArrowRight,
    Clock,
    CheckCircle2,
    RefreshCw,
    Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserTeam {
    teamId: number;
    projectId: number;
    teamName: string;
    teamDescription: string | null;
    projectName: string;
    role: 'owner' | 'admin' | 'member';
    memberCount: number;
    setupComplete: boolean;
    joinedAt: string;
}

type PageState = 'loading' | 'ready' | 'error';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TeamPortalPage() {
    const [state, setState] = useState<PageState>('loading');
    const [teams, setTeams] = useState<UserTeam[]>([]);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setState('loading');
        setError(null);
        try {
            const res = await fetchWithAuth('/teams', { method: 'GET' });
            if (!res.ok) throw new Error('Failed to load your teams');
            const data: UserTeam[] = await res.json();
            setTeams(data);
            setState('ready');
        } catch (err: any) {
            setError(err.message || 'Failed to load your teams');
            setState('error');
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const roleIcon = (role: string) => {
        if (role === 'owner') return <Crown className="w-3.5 h-3.5" />;
        if (role === 'admin') return <Shield className="w-3.5 h-3.5" />;
        return <User className="w-3.5 h-3.5" />;
    };

    const roleColor = (role: string) => {
        if (role === 'owner') return 'border-amber-500/40 bg-amber-500/10 text-amber-400';
        if (role === 'admin') return 'border-purple-500/40 bg-purple-500/10 text-purple-400';
        return 'border-border bg-background text-muted-foreground';
    };

    // ── Loading ─────────────────────────────────────────────────────────────

    if (state === 'loading') {
        return (
            <Shell>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading your teams...</p>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Error ───────────────────────────────────────────────────────────────

    if (state === 'error') {
        return (
            <Shell>
                <BackHome />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md px-4">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={load}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                            <Link href="/">
                                <Button>Back to Home</Button>
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
            <BackHome />

            {/* Header */}
            <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <h1 className="text-5xl sm:text-6xl font-bold text-foreground">
                                Team Portal
                            </h1>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Every team you're a part of — owned or joined.
                        </p>
                    </div>
                    <Link href="/create-project">
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Project
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Empty state */}
            {teams.length === 0 ? (
                <div className="max-w-2xl mx-auto text-center pt-16">
                    <div className="inline-flex p-5 bg-primary/15 border-2 border-primary/40 rounded-2xl mb-6">
                        <Users className="w-14 h-14 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-foreground mb-3">
                        No teams yet
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                        You're not a member of any team. Create a project to
                        start one, or ask a team leader to send you an invite
                        link.
                    </p>
                    <Link href="/create-project">
                        <Button size="lg">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Project
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    {/* Count summary */}
                    <div className="mb-6 text-sm text-muted-foreground">
                        {teams.length} team{teams.length !== 1 ? 's' : ''}
                    </div>

                    {/* Team grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {teams.map((team, index) => (
                            <div
                                key={team.teamId}
                                className="group relative animate-in fade-in zoom-in duration-500"
                                style={{ animationDelay: `${100 + index * 60}ms` }}
                            >
                                {/* Glow */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

                                {/* Card */}
                                <div className="relative bg-card border-2 border-border rounded-2xl p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-2xl h-full flex flex-col">

                                    {/* Top row — role + status */}
                                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border capitalize ${roleColor(team.role)}`}>
                                            {roleIcon(team.role)}
                                            {team.role}
                                        </span>

                                        {team.setupComplete ? (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Ready
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-orange-500/40 bg-orange-500/10 text-orange-400">
                                                <Clock className="w-3 h-3" />
                                                Setup in progress
                                            </span>
                                        )}
                                    </div>

                                    {/* Team name */}
                                    <h2 className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors break-words">
                                        {team.teamName}
                                    </h2>

                                    {/* Project name */}
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                                        <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{team.projectName}</span>
                                    </div>

                                    {/* Description */}
                                    {team.teamDescription && (
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                                            {team.teamDescription}
                                        </p>
                                    )}

                                    {/* Footer stats */}
                                    <div className="flex items-center justify-between pt-4 border-t border-border mb-4">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Users className="w-3.5 h-3.5" />
                                            {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Joined {new Date(team.joinedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {team.setupComplete ? (
                                            <Link href={`/projects/${team.projectId}`} className="flex-1">
                                                <Button className="w-full">
                                                    Open Project
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href={`/projects/${team.projectId}/team`} className="flex-1">
                                                <Button className="w-full">
                                                    {team.role === 'owner' ? 'Continue Setup' : 'View Setup'}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </Link>
                                        )}

                                        {(team.role === 'owner' || team.role === 'admin') && team.setupComplete && (
                                            <Link href={`/projects/${team.projectId}/team`}>
                                                <Button variant="outline">
                                                    Manage
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Shell>
    );
}

// ─── Shared ──────────────────────────────────────────────────────────────────

function BackHome() {
    return (
        <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
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