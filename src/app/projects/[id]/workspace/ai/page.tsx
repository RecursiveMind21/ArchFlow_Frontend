'use client';

import { ArrowLeft, Sparkles, Construction, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AIAssistantPage() {
    const params = useParams();
    const projectId = params.id as string;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Back button */}
                    <Link href={`/projects/${projectId}/workspace`}>
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Workspace
                        </Button>
                    </Link>

                    {/* Icon */}
                    <div className="text-center pt-16">
                        <div className="inline-flex p-6 bg-purple-500/15 border-2 border-purple-500/40 rounded-2xl mb-6">
                            <Sparkles className="w-16 h-16 text-purple-400" />
                        </div>

                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                            AI Assistant
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                            Chat with an AI that already knows your project —
                            its requirements, architecture, tasks, and team.
                            Ask anything, generate code, create tickets.
                        </p>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary mb-12">
                            <Construction className="w-4 h-4" />
                            <span className="text-sm font-medium">Under Development</span>
                        </div>
                    </div>

                    {/* What's coming */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-purple-400" />
                            What's Coming
                        </h2>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Conversational chat with full project context</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Turn chat messages into tickets and tasks</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Generate code snippets, schemas, and API examples</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Polls, decisions, and rich interactive messages</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Persistent chat history per project</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}