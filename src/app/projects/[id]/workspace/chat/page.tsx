'use client';

import { ArrowLeft, MessageSquare, Construction, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TeamChatPage() {
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
                        <div className="inline-flex p-6 bg-emerald-500/15 border-2 border-emerald-500/40 rounded-2xl mb-6">
                            <MessageSquare className="w-16 h-16 text-emerald-400" />
                        </div>

                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                            Team Chat
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                            Real-time chat for your team. Coordinate, share
                            updates, and stay in sync — all in one place.
                        </p>

                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary mb-12">
                            <Construction className="w-4 h-4" />
                            <span className="text-sm font-medium">Under Development</span>
                        </div>
                    </div>

                    {/* What's coming */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Send className="w-5 h-5 text-emerald-400" />
                            What's Coming
                        </h2>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Real-time messaging between team members</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Mentions and notifications for @usernames</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>File and image sharing</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Thread replies and reactions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Quick actions to create tasks right from chat</span>
                            </li>
                        </ul>
                    </div>

                    {/* Team indicator */}
                    <div className="mt-6 bg-card border border-border rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/15 rounded-lg text-primary shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground mb-1">
                                    Your team will appear here
                                </p>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Once chat is live, all members of your
                                    project's team will be able to message each
                                    other in this space.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}