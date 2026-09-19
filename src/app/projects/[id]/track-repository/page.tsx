'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft,
    GitBranch,
    Github,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Search,
    Lock,
    Globe,
    Star,
    GitFork,
    ExternalLink,
    X,
    RefreshCw,
    Link2,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LinkStatus {
    linked: boolean;
    username?: string;
    avatarUrl?: string;
}

interface Repo {
    id: number;
    name: string;
    fullName: string;
    description: string | null;
    private: boolean;
    defaultBranch: string;
    stars: number;
    forks: number;
    updatedAt: string;
    language: string | null;
    htmlUrl: string;
}

interface TrackedRepo {
    repoId: number;
    fullName: string;
    htmlUrl: string;
    defaultBranch: string;
}

interface TeamInfo {
    currentUserRole: 'owner' | 'admin' | 'member' | null;
}

type PageState =
    | 'checking'
    | 'not-linked'
    | 'linking'
    | 'loading-repos'
    | 'selecting'
    | 'saving'
    | 'unlinking'
    | 'already-tracked'
    | 'no-repo-member'
    | 'error';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TrackRepositoryPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectId = params.id as string;

    const [state, setState] = useState<PageState>('checking');
    const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member'>('owner');
    const [linkStatus, setLinkStatus] = useState<LinkStatus | null>(null);
    const [repos, setRepos] = useState<Repo[]>([]);
    const [trackedRepo, setTrackedRepo] = useState<TrackedRepo | null>(null);
    const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

    const isMember = userRole === 'member';

    // ── Actions (defined before use in useEffect) ───────────────────────────

    const loadRepos = async () => {
        setState('loading-repos');
        setError(null);
        try {
            const res = await fetchWithAuth('/github/repos', { method: 'GET' });
            if (!res.ok) throw new Error('Failed to load repositories');
            const data: Repo[] = await res.json();
            setRepos(data);
            setState('selecting');
        } catch (err: any) {
            setError(err.message || 'Failed to load repositories');
            setState('error');
        }
    };

    // ── Initial flow ────────────────────────────────────────────────────────

    useEffect(() => {
        const initialise = async () => {
            setState('checking');
            setError(null);

            try {
                // 1. Determine the caller's role in the project's team (if any)
                let role: 'owner' | 'admin' | 'member' = 'owner';
                try {
                    const teamRes = await fetchWithAuth(
                        `/projects/${projectId}/team`,
                        { method: 'GET' }
                    );
                    if (teamRes.ok) {
                        const team: TeamInfo = await teamRes.json();
                        if (team.currentUserRole === 'admin') role = 'admin';
                        else if (team.currentUserRole === 'member') role = 'member';
                    }
                    // 204 (no team) or 403 (not a member) → keep default 'owner'
                    // for solo projects. The backend will still gate writes.
                } catch {
                    // ignore — default to owner
                }
                setUserRole(role);

                // 2. Is there already a tracked repo for this project?
                const projectRepoRes = await fetchWithAuth(
                    `/projects/${projectId}/repository`,
                    { method: 'GET' }
                );

                if (projectRepoRes.status === 200) {
                    const tracked: TrackedRepo = await projectRepoRes.json();
                    if (tracked?.repoId) {
                        setTrackedRepo(tracked);
                        setState('already-tracked');
                        return;
                    }
                }

                // 3. Member with no linked repo → show the "no repo yet" screen.
                //    Members never get to pick a repo; only owners can link one.
                if (role === 'member') {
                    setState('no-repo-member');
                    return;
                }

                // 4. Owner path: continue with the existing GitHub link flow
                const statusRes = await fetchWithAuth('/github/status', {
                    method: 'GET',
                });

                if (!statusRes.ok) {
                    throw new Error('Failed to check GitHub link status');
                }

                const status: LinkStatus = await statusRes.json();
                setLinkStatus(status);

                const justLinked = searchParams.get('linked') === 'true';

                if (status.linked || justLinked) {
                    if (justLinked && !status.linked) {
                        await new Promise((r) => setTimeout(r, 500));
                        const refreshed = await fetchWithAuth('/github/status');
                        const refreshedStatus: LinkStatus = await refreshed.json();
                        setLinkStatus(refreshedStatus);
                    }
                    await loadRepos();
                } else {
                    setState('not-linked');
                }
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
                setState('error');
            }
        };

        initialise();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, searchParams]);

    // ── Actions ─────────────────────────────────────────────────────────────

    const handleLinkGithub = async () => {
        setState('linking');
        setError(null);
        try {
            const returnTo = `/projects/${projectId}/track-repository`;
            const res = await fetchWithAuth(
                `/projects/${projectId}/github/link?returnTo=${encodeURIComponent(returnTo)}`,
                { method: 'POST' }
            );
            if (!res.ok) throw new Error('Failed to start GitHub link flow');
            const { authUrl } = await res.json();
            window.location.href = authUrl;
        } catch (err: any) {
            setError(err.message || 'Failed to start GitHub link');
            setState('not-linked');
        }
    };

    const handleSkip = () => {
        router.push(`/projects/${projectId}`);
    };

    const handleSelectRepo = async () => {
        if (selectedRepoId === null) return;
        const repo = repos.find((r) => r.id === selectedRepoId);
        if (!repo) return;

        setState('saving');
        setError(null);
        try {
            const res = await fetchWithAuth(
                `/projects/${projectId}/repository`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        repoId: repo.id,
                        fullName: repo.fullName,
                        htmlUrl: repo.htmlUrl,
                        defaultBranch: repo.defaultBranch,
                    }),
                }
            );
            if (!res.ok) throw new Error('Failed to save repository');

            const saved: TrackedRepo = await res.json();
            setTrackedRepo(saved);
            setState('already-tracked');
        } catch (err: any) {
            setError(err.message || 'Failed to save repository');
            setState('selecting');
        }
    };

    const handleChangeRepo = () => {
        setTrackedRepo(null);
        setSelectedRepoId(null);
        loadRepos();
    };

    const handleUnlinkRepo = async () => {
        setShowUnlinkConfirm(false);
        setState('unlinking');
        setError(null);
        try {
            const res = await fetchWithAuth(
                `/projects/${projectId}/repository`,
                { method: 'DELETE' }
            );
            if (!res.ok) throw new Error('Failed to unlink repository');

            setTrackedRepo(null);
            setSelectedRepoId(null);
            await loadRepos();
        } catch (err: any) {
            setError(err.message || 'Failed to unlink repository');
            setState('already-tracked');
        }
    };

    // ── Filtering ───────────────────────────────────────────────────────────

    const filteredRepos = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return repos;
        return repos.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.fullName.toLowerCase().includes(q) ||
                (r.description ?? '').toLowerCase().includes(q)
        );
    }, [repos, search]);

    // ── Render helpers ──────────────────────────────────────────────────────

    const BackButton = () => (
        <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Button>
        </Link>
    );

    // ── Checking ────────────────────────────────────────────────────────────

    if (state === 'checking') {
        return (
            <Shell>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Checking repository status...
                        </p>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Member: no repo linked ──────────────────────────────────────────────

    if (state === 'no-repo-member') {
        return (
            <Shell>
                <BackButton />
                <div className="max-w-2xl mx-auto pt-16 text-center">
                    <div className="inline-flex p-5 bg-secondary border-2 border-border rounded-2xl mb-6">
                        <GitBranch className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-3">
                        No repository linked yet
                    </h1>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        The project owner hasn't linked a GitHub repository to
                        this project yet. It'll show up here once they do.
                    </p>
                    <Link href={`/projects/${projectId}`}>
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>
            </Shell>
        );
    }

    // ── Not linked ──────────────────────────────────────────────────────────

    if (state === 'not-linked' || state === 'linking') {
        const isLinking = state === 'linking';
        return (
            <Shell>
                <BackButton />
                <div className="max-w-2xl mx-auto text-center pt-12">
                    <div className="inline-flex p-6 bg-secondary border-2 border-border rounded-2xl mb-6">
                        <Github className="w-16 h-16 text-foreground" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                        Link your GitHub account
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Connect GitHub so ArchFlow can track commits, branches,
                        and activity for this project.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3 text-left">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Button
                            size="lg"
                            onClick={handleLinkGithub}
                            disabled={isLinking}
                        >
                            {isLinking ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Redirecting to GitHub...
                                </>
                            ) : (
                                <>
                                    <Github className="w-4 h-4 mr-2" />
                                    Continue with GitHub
                                </>
                            )}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleSkip}
                            disabled={isLinking}
                        >
                            Not now
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-8">
                        We only request read access to your repositories. You can
                        unlink at any time from settings.
                    </p>
                </div>
            </Shell>
        );
    }

    // ── Loading repos ───────────────────────────────────────────────────────

    if (state === 'loading-repos') {
        return (
            <Shell>
                <BackButton />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Loading your repositories...
                        </p>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Saving ──────────────────────────────────────────────────────────────

    if (state === 'saving') {
        return (
            <Shell>
                <BackButton />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Linking repository to project...
                        </p>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Unlinking ───────────────────────────────────────────────────────────

    if (state === 'unlinking') {
        return (
            <Shell>
                <BackButton />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Unlinking repository...
                        </p>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Already tracked ─────────────────────────────────────────────────────

    if (state === 'already-tracked' && trackedRepo) {
        return (
            <Shell>
                <BackButton />
                <div className="max-w-3xl mx-auto pt-8">
                    <div className="mb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
                            Tracked Repository
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            {isMember
                                ? 'This project is linked to a GitHub repository.'
                                : 'This project is linked to a GitHub repository.'}
                        </p>
                    </div>

                    <div className="bg-card border-2 border-emerald-500/30 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-500/15 rounded-lg text-emerald-400 shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-1">
                                    Linked repository
                                </p>
                                <h2 className="text-xl font-bold text-foreground mb-1 truncate">
                                    {trackedRepo.fullName}
                                </h2>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Default branch:{' '}
                                    <code className="font-mono text-primary">
                                        {trackedRepo.defaultBranch}
                                    </code>
                                </p>
                                <a
                                    href={trackedRepo.htmlUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                    Open on GitHub
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {!isMember && (
                            <>
                                <Button variant="outline" onClick={handleChangeRepo}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Change Repository
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowUnlinkConfirm(true)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Unlink Repository
                                </Button>
                            </>
                        )}
                        <Link href={`/projects/${projectId}`}>
                            <Button>Back to Dashboard</Button>
                        </Link>
                    </div>

                    {isMember && (
                        <p className="mt-4 text-xs text-muted-foreground">
                            Only the project owner can change or unlink the
                            repository.
                        </p>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}
                </div>

                {/* Confirmation modal */}
                {showUnlinkConfirm && (
                    <ConfirmModal
                        title="Unlink this repository?"
                        description={
                            <>
                                <span className="font-medium text-foreground">
                                    {trackedRepo.fullName}
                                </span>{' '}
                                will no longer be tracked by this project.
                                Your GitHub account stays linked, and you can
                                re-link this or another repository at any time.
                            </>
                        }
                        confirmLabel="Unlink Repository"
                        confirmVariant="destructive"
                        onConfirm={handleUnlinkRepo}
                        onCancel={() => setShowUnlinkConfirm(false)}
                    />
                )}
            </Shell>
        );
    }

    // ── Selecting repo ──────────────────────────────────────────────────────

    if (state === 'selecting') {
        return (
            <Shell>
                <BackButton />
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
                            Choose a Repository
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Pick the GitHub repository that powers this project.
                        </p>
                    </div>

                    {linkStatus?.username && (
                        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-secondary/40 border border-border rounded-lg">
                            <Github className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Connected as{' '}
                                <span className="text-foreground font-medium">
                                    {linkStatus.username}
                                </span>
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <div className="relative mb-6">
                        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search repositories..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    {filteredRepos.length === 0 ? (
                        <div className="text-center py-16 bg-card border border-border rounded-xl">
                            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground">
                                {search
                                    ? 'No repositories match your search'
                                    : 'No repositories found on your GitHub account'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 mb-24">
                            {filteredRepos.map((repo) => {
                                const isSelected = selectedRepoId === repo.id;
                                return (
                                    <button
                                        key={repo.id}
                                        onClick={() => setSelectedRepoId(repo.id)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                                            ? 'border-primary bg-primary/5 shadow-lg'
                                            : 'border-border bg-card hover:border-primary/40'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`mt-0.5 shrink-0 p-2 rounded ${isSelected
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'bg-secondary text-muted-foreground'
                                                    }`}
                                            >
                                                <GitBranch className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-semibold text-foreground truncate">
                                                        {repo.fullName}
                                                    </span>
                                                    {repo.private ? (
                                                        <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border border-orange-500/40 bg-orange-500/10 text-orange-400">
                                                            <Lock className="w-3 h-3" />
                                                            Private
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border border-green-500/40 bg-green-500/10 text-green-400">
                                                            <Globe className="w-3 h-3" />
                                                            Public
                                                        </span>
                                                    )}
                                                </div>
                                                {repo.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                        {repo.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                                    {repo.language && (
                                                        <span>{repo.language}</span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Star className="w-3 h-3" />
                                                        {repo.stars}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <GitFork className="w-3 h-3" />
                                                        {repo.forks}
                                                    </span>
                                                    <span>
                                                        Updated{' '}
                                                        {new Date(
                                                            repo.updatedAt
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Sticky action bar */}
                    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-md">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground truncate">
                                {selectedRepoId
                                    ? `Selected: ${repos.find(
                                        (r) => r.id === selectedRepoId
                                    )?.fullName
                                    }`
                                    : 'Select a repository to continue'}
                            </p>
                            <div className="flex gap-2 shrink-0">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedRepoId(null)}
                                    disabled={!selectedRepoId}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Clear
                                </Button>
                                <Button
                                    onClick={handleSelectRepo}
                                    disabled={!selectedRepoId}
                                >
                                    <Link2 className="w-4 h-4 mr-2" />
                                    Link Repository
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Error (default) ─────────────────────────────────────────────────────

    return (
        <Shell>
            <BackButton />
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md px-4">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {error || 'Unknown error occurred'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                        <Link href={`/projects/${projectId}`}>
                            <Button>Back to Dashboard</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Shell>
    );
}

// ─── Confirmation modal ──────────────────────────────────────────────────────

interface ConfirmModalProps {
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    confirmVariant?: 'default' | 'destructive';
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmModal({
    title,
    description,
    confirmLabel,
    confirmVariant = 'default',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={onCancel}
            />

            <div className="relative bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4 mb-5">
                    <div
                        className={`p-3 rounded-lg shrink-0 ${confirmVariant === 'destructive'
                            ? 'bg-destructive/15 text-destructive'
                            : 'bg-primary/15 text-primary'
                            }`}
                    >
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                            {title}
                        </h3>
                        <div className="text-sm text-muted-foreground leading-relaxed">
                            {description}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={
                            confirmVariant === 'destructive'
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : ''
                        }
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Shell wrapper ───────────────────────────────────────────────────────────

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