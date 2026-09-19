'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import { NewDashboard } from '../page';

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

export default function WorkspacePage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [team, setTeam] = useState<Team | null>(null);
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchWithAuth(`/projects/${projectId}/team`, {
                    method: 'GET',
                });

                if (res.status === 204) {
                    // No team yet — leader should create one first
                    router.replace(`/projects/${projectId}/team`);
                    return;
                }

                if (!res.ok) throw new Error('Failed to load team');

                const data: Team = await res.json();

                // Only owner or admin get the workspace
                if (data.currentUserRole !== 'owner' && data.currentUserRole !== 'admin') {
                    // Members already see the new dashboard at /projects/{id} — bounce them there
                    router.replace(`/projects/${projectId}`);
                    return;
                }

                setTeam(data);
                setState('ready');
            } catch (err: any) {
                setError(err.message || 'Something went wrong');
                setState('error');
            }
        };
        load();
    }, [projectId, router]);

    if (state === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading workspace...</p>
                </div>
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Link href={`/projects/${projectId}`}>
                        <Button>Back to Project</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!team) return null;

    return <NewDashboard team={team} projectId={projectId} isLeader={true} />;
}