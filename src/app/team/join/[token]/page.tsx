'use client';

import React, { useState, useEffect } from 'react';
import {
    Loader2,
    AlertCircle,
    Users,
    CheckCircle2,
    ArrowRight,
    Crown,
    LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface JoinPreview {
    teamId: number;
    teamName: string;
    teamDescription: string | null;
    ownerName: string;
    projectName: string | null;
    memberCount: number;
    alreadyMember: boolean;
    memberNames: string[];
}

interface TeamResponse {
    id: number;
    projectId: number;
    name: string;
    // ...other fields we don't need here
}

type JoinState = 'loading' | 'preview' | 'joined' | 'error';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function JoinTeamPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [state, setState] = useState<JoinState>('loading');
    const [preview, setPreview] = useState<JoinPreview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUnauthenticated, setIsUnauthenticated] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    // ── Load preview ────────────────────────────────────────────────────────

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            setState('loading');
            setError(null);

            try {
                const res = await fetchWithAuth(`/team/join/${token}`, {
                    method: 'GET',
                });

                if (res.status === 404) {
                    throw new Error(
                        'This invite link is invalid or has been regenerated'
                    );
                }
                if (!res.ok) {
                    throw new Error('Failed to load invite');
                }

                const data: JoinPreview = await res.json();
                setPreview(data);

                // Detect unauthenticated: hit /auth/me in parallel.
                try {
                    const meRes = await fetchWithAuth('/auth/me', { method: 'GET' });
                    setIsUnauthenticated(!meRes.ok);
                } catch {
                    setIsUnauthenticated(true);
                }

                setState('preview');
            } catch (err: any) {
                setError(err.message || 'Failed to load invite');
                setState('error');
            }
        };

        load();
    }, [token]);

    // ── Join ────────────────────────────────────────────────────────────────

    const handleJoin = async () => {
        setIsJoining(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`/team/join/${token}`, {
                method: 'POST',
            });

            if (res.status === 401) {
                // Not logged in — send to login, come back to this page after
                router.push(`/login?redirect=/team/join/${token}`);
                return;
            }
            if (!res.ok) throw new Error('Failed to join team');

            const data: TeamResponse = await res.json();
            setState('joined');
            setTimeout(() => {
                router.push(`/projects/${data.projectId}/team`);
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to join team');
            setIsJoining(false);
        }
    };

    const handleLoginFirst = () => {
        router.push(`/login?redirect=/team/join/${token}`);
    };

    // ── Loading ─────────────────────────────────────────────────────────────

    if (state === 'loading') {
        return (
            <Shell>
                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading invite...</p>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Error ───────────────────────────────────────────────────────────────

    if (state === 'error') {
        return (
            <Shell>
                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="text-center max-w-md px-4">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Invalid Invite
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            {error || 'This invite link is no longer valid.'}
                        </p>
                        <Link href="/projects">
                            <Button>Go to Projects</Button>
                        </Link>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Joined ──────────────────────────────────────────────────────────────

    if (state === 'joined') {
        return (
            <Shell>
                <div className="flex items-center justify-center min-h-[70vh]">
                    <div className="text-center max-w-md px-4">
                        <div className="inline-flex p-4 bg-emerald-500/15 border-2 border-emerald-500/40 rounded-full mb-6">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            You're in!
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Redirecting to the team dashboard...
                        </p>
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Preview ─────────────────────────────────────────────────────────────

    if (state === 'preview' && preview) {
        return (
            <Shell>
                <div className="max-w-2xl mx-auto pt-16">
                    <div className="bg-card border-2 border-primary/30 rounded-2xl p-8 text-center">

                        {/* Icon */}
                        <div className="inline-flex p-4 bg-primary/15 border-2 border-primary/40 rounded-2xl mb-6">
                            <Users className="w-12 h-12 text-primary" />
                        </div>

                        {/* Inviter + team name */}
                        <p className="text-sm text-muted-foreground mb-2">
                            <span className="text-foreground font-medium">
                                {preview.ownerName}
                            </span>{' '}
                            invited you to join
                        </p>

                        <h1 className="text-4xl font-bold text-foreground mb-3 break-words">
                            {preview.teamName}
                        </h1>

                        {preview.teamDescription && (
                            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                                {preview.teamDescription}
                            </p>
                        )}

                        {preview.projectName && (
                            <p className="text-sm text-muted-foreground mb-6">
                                for{' '}
                                <span className="text-foreground font-medium">
                                    {preview.projectName}
                                </span>
                            </p>
                        )}

                        {/* Member chip */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/60 border border-border rounded-full text-sm text-muted-foreground mb-8 flex-wrap justify-center">
                            <Crown className="w-3.5 h-3.5" />
                            <span>
                                {preview.memberCount} member
                                {preview.memberCount !== 1 ? 's' : ''}
                            </span>
                            {preview.memberNames.length > 0 && (
                                <>
                                    <span className="opacity-40">·</span>
                                    <span className="text-foreground">
                                        {preview.memberNames.slice(0, 3).join(', ')}
                                        {preview.memberCount > 3 &&
                                            ` +${preview.memberCount - 3} more`}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Error banner */}
                        {error && (
                            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2 text-left">
                                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        {/* CTA */}
                        {preview.alreadyMember ? (
                            <div className="space-y-4">
                                <p className="text-sm text-emerald-400 flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    You're already a member of this team
                                </p>
                                <Button
                                    size="lg"
                                    onClick={() => router.push('/projects')}
                                >
                                    Go to Projects
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        ) : isUnauthenticated ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    You need to sign in to join this team
                                </p>
                                <Button size="lg" onClick={handleLoginFirst}>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Sign in to Join
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="lg"
                                onClick={handleJoin}
                                disabled={isJoining}
                                className="min-w-48"
                            >
                                {isJoining ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    <>
                                        Join Team
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Footer hint */}
                    <p className="text-center text-xs text-muted-foreground mt-6">
                        Not sure about this invite?{' '}
                        <Link href="/projects" className="text-primary hover:underline">
                            Go to your projects
                        </Link>
                    </p>
                </div>
            </Shell>
        );
    }

    return null;
}

// ─── Shell ───────────────────────────────────────────────────────────────────

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