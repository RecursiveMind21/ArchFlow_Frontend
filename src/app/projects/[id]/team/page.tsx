'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Users,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Copy,
    Check,
    RefreshCw,
    Crown,
    Shield,
    User,
    UserMinus,
    Link2,
    Trash2,
    Plus,
    Pencil,
    X,
    Clock,
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
    email: string | null;
    role: 'owner' | 'admin' | 'member';
    joinedAt: string;
    isYou: boolean;
}

interface Team {
    id: number;
    projectId: number;
    name: string;
    description: string | null;
    joinToken: string;
    joinUrl: string;
    createdBy: number;
    createdAt: string;
    setupComplete: boolean;
    members: TeamMember[];
    currentUserRole: 'owner' | 'admin' | 'member';
}

type PageState = 'checking' | 'no-team' | 'team' | 'error';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TeamManagementPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [state, setState] = useState<PageState>('checking');
    const [team, setTeam] = useState<Team | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Create form
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Edit form
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Copy state
    const [copied, setCopied] = useState(false);

    // Setup completion
    const [isMarkingDone, setIsMarkingDone] = useState(false);

    // ── Load ────────────────────────────────────────────────────────────────

    const loadTeam = async () => {
        try {
            const res = await fetchWithAuth(`/projects/${projectId}/team`, {
                method: 'GET',
            });

            if (res.status === 204) {
                setState('no-team');
                return;
            }
            if (!res.ok) throw new Error('Failed to load team');

            const data: Team = await res.json();
            setTeam(data);
            setState('team');
        } catch (err: any) {
            setError(err.message || 'Failed to load team');
            setState('error');
        }
    };

    useEffect(() => {
        setState('checking');
        loadTeam();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    // ── Actions ─────────────────────────────────────────────────────────────

    const handleCreate = async () => {
        if (!newName.trim()) {
            setError('Team name is required');
            return;
        }
        setIsCreating(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`/projects/${projectId}/team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName.trim(),
                    description: newDescription.trim() || null,
                }),
            });
            if (!res.ok) throw new Error('Failed to create team');
            const created: Team = await res.json();
            setTeam(created);
            setNewName('');
            setNewDescription('');
            setState('team');
        } catch (err: any) {
            setError(err.message || 'Failed to create team');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdate = async () => {
        if (!editName.trim()) {
            setError('Team name is required');
            return;
        }
        setError(null);
        try {
            const res = await fetchWithAuth(`/projects/${projectId}/team`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName.trim(),
                    description: editDescription.trim() || null,
                }),
            });
            if (!res.ok) throw new Error('Failed to update team');
            const updated: Team = await res.json();
            setTeam(updated);
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Failed to update team');
        }
    };

    const handleCopyLink = async () => {
        if (!team) return;
        const fullUrl = `${window.location.origin}${team.joinUrl}`;
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setError('Could not copy to clipboard');
        }
    };

    const handleRegenerate = async () => {
        if (!confirm('Regenerate the invite link? The old link will stop working immediately.')) return;
        setError(null);
        try {
            const res = await fetchWithAuth(
                `/projects/${projectId}/team/regenerate-token`,
                { method: 'POST' }
            );
            if (!res.ok) throw new Error('Failed to regenerate link');
            const updated: Team = await res.json();
            setTeam(updated);
        } catch (err: any) {
            setError(err.message || 'Failed to regenerate link');
        }
    };

    const handleRoleChange = async (memberId: number, newRole: string) => {
        setError(null);
        try {
            const res = await fetchWithAuth(
                `/projects/${projectId}/team/members/${memberId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: newRole }),
                }
            );
            if (!res.ok) throw new Error('Failed to update role');
            await loadTeam();
        } catch (err: any) {
            setError(err.message || 'Failed to update role');
        }
    };

    const handleRemoveMember = async (memberId: number, name: string) => {
        if (!confirm(`Remove ${name} from the team?`)) return;
        setError(null);
        try {
            const res = await fetchWithAuth(
                `/projects/${projectId}/team/members/${memberId}`,
                { method: 'DELETE' }
            );
            if (!res.ok) throw new Error('Failed to remove member');
            await loadTeam();
        } catch (err: any) {
            setError(err.message || 'Failed to remove member');
        }
    };

    const handleMarkDone = async () => {
        if (!confirm('Mark team setup as complete? The dashboard will unlock for all members.')) return;
        setIsMarkingDone(true);
        setError(null);
        try {
            const res = await fetchWithAuth(
                `/projects/${projectId}/team/complete`,
                { method: 'POST' }
            );
            if (!res.ok) throw new Error('Failed to complete setup');
            // Full reload to the dashboard — it will now render the unlocked view
            window.location.href = `/projects/${projectId}`;
        } catch (err: any) {
            setError(err.message || 'Failed to complete setup');
            setIsMarkingDone(false);
        }
    };

    // ── Render helpers ──────────────────────────────────────────────────────

    const BackButton = () => (
        <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Button>
        </Link>
    );

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

    const canManage = team?.currentUserRole === 'owner' || team?.currentUserRole === 'admin';

    // ── Checking ────────────────────────────────────────────────────────────

    if (state === 'checking') {
        return (
            <Shell>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading team...</p>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Error ───────────────────────────────────────────────────────────────

    if (state === 'error') {
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
                            <Button variant="outline" onClick={loadTeam}>
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

    // ── No team yet — show create form ──────────────────────────────────────

    if (state === 'no-team') {
        return (
            <Shell>
                <BackButton />
                <div className="max-w-2xl mx-auto pt-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                                Create Your Team
                            </h1>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            Set up a team to collaborate on this project. Once
                            created, you'll get a shareable link to invite
                            members.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Team Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Backend Squad, Mobile Team..."
                                maxLength={255}
                                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Description <span className="text-muted-foreground font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="What's this team working on?"
                                rows={3}
                                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Link href={`/projects/${projectId}`}>
                                <Button variant="outline" disabled={isCreating}>
                                    Cancel
                                </Button>
                            </Link>
                            <Button onClick={handleCreate} disabled={isCreating || !newName.trim()}>
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Team
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </Shell>
        );
    }

    // ── Team dashboard ──────────────────────────────────────────────────────

    if (state === 'team' && team) {
        const fullJoinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${team.joinUrl}`;

        return (
            <Shell>
                <BackButton />
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border capitalize ${roleColor(team.currentUserRole)}`}>
                                        {roleIcon(team.currentUserRole)}
                                        You are {team.currentUserRole}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2 break-words">
                                    {team.name}
                                </h1>
                                {team.description && (
                                    <p className="text-lg text-muted-foreground">
                                        {team.description}
                                    </p>
                                )}
                            </div>
                            {canManage && !isEditing && (
                                <Button variant="outline" size="sm" onClick={() => {
                                    setEditName(team.name);
                                    setEditDescription(team.description ?? '');
                                    setIsEditing(true);
                                }}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Setup-in-progress banner */}
                    {!team.setupComplete && (
                        <div className="mb-6 bg-orange-500/10 border-2 border-orange-500/30 rounded-xl p-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-orange-500/15 rounded-lg text-orange-400 shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground mb-1">
                                        Team setup in progress
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {team.currentUserRole === 'owner'
                                            ? 'Invite team members, then mark setup as done to unlock the project dashboard.'
                                            : "The team leader is still setting things up. You'll get access to the dashboard once they finish."}
                                    </p>
                                    {team.currentUserRole === 'owner' && (
                                        <Button onClick={handleMarkDone} disabled={isMarkingDone}>
                                            {isMarkingDone ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Marking as done...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Mark Team as Done
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Edit form */}
                    {isEditing && (
                        <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-foreground">Edit Team</h2>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleUpdate}>Save</Button>
                            </div>
                        </div>
                    )}

                    {/* Invite link */}
                    {canManage && (
                        <div className="bg-card border border-border rounded-xl p-6 mb-6">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Link2 className="w-5 h-5 text-primary" />
                                Invite Link
                            </h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Share this link with anyone you want to invite.
                                They'll be added to the team when they open it and
                                sign in.
                            </p>

                            <div className="flex gap-2 flex-wrap">
                                <div className="flex-1 min-w-0 relative">
                                    <input
                                        readOnly
                                        value={fullJoinUrl}
                                        className="w-full px-3 py-2.5 pr-10 text-sm font-mono bg-background border border-border rounded-lg text-foreground truncate"
                                    />
                                </div>
                                <Button onClick={handleCopyLink} variant={copied ? 'default' : 'outline'}>
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" onClick={handleRegenerate}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Regenerate
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground mt-3">
                                ⚠ Anyone with this link can join. Regenerate to
                                invalidate the old link.
                            </p>
                        </div>
                    )}

                    {/* Members */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Members
                        </h2>

                        <div className="space-y-2">
                            {team.members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/20 flex-wrap"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-semibold shrink-0">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                            {member.name}
                                            {member.isYou && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    (you)
                                                </span>
                                            )}
                                        </p>
                                        {member.email && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {member.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Role: dropdown for admins, badge otherwise */}
                                    {canManage && member.role !== 'owner' ? (
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                            className="text-xs px-2 py-1.5 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    ) : (
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded border capitalize ${roleColor(member.role)}`}>
                                            {roleIcon(member.role)}
                                            {member.role}
                                        </span>
                                    )}

                                    {/* Remove button — only for admins/owners, not self, not owner */}
                                    {canManage && !member.isYou && member.role !== 'owner' && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRemoveMember(member.id, member.name)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {team.members.length === 1 && (
                            <div className="text-center pt-6 pb-2">
                                <p className="text-sm text-muted-foreground">
                                    You're the only member. Share the invite link
                                    above to add teammates.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Placeholder: tasks coming soon */}
                    <div className="mt-6 bg-card border border-border rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/15 rounded-lg text-primary shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground mb-1">
                                    Tasks coming next
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Soon you'll be able to create tasks, assign
                                    them to team members, and let assignees
                                    update their status directly from here.
                                </p>
                            </div>
                        </div>
                    </div>
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