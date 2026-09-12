'use client';

import { useState } from 'react';
import { FileText, FolderOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const dashboardCards = [
        {
            id: 'create-project',
            icon: <FileText className="w-12 h-12" />,
            title: 'Create Project',
            description:
                'Start a new project and generate personalized architecture recommendations based on your requirements.',
            buttonText: 'Create Project',
            href: '/create-project', 
            color: 'from-primary/20 to-primary/5',
            borderColor: 'border-primary/20',
        },
        {
            id: 'explore-projects',
            icon: <FolderOpen className="w-12 h-12" />,
            title: 'Explore Existing Projects',
            description:
                'View, manage, and interact with your previously created projects and their generated architectures.',
            buttonText: 'Explore Projects',
            href: '/projects', 
            color: 'from-blue-500/20 to-blue-500/5',
            borderColor: 'border-blue-500/20',
        },
        {
            id: 'team-management',
            icon: <Users className="w-12 h-12" />,
            title: 'Team Management Portal',
            description:
                'Manage team members, permissions, and collaborate on projects with your team.',
            buttonText: 'Team Management',
            href: '/team',
            color: 'from-emerald-500/20 to-emerald-500/5',
            borderColor: 'border-emerald-500/20',
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Main Content — pt-24 accounts for fixed Navbar height */}
            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-6xl mx-auto">

                    {/* Header Section */}
                    <div className="mb-16 animate-in fade-in slide-in-from-top duration-700">
                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4 text-balance">
                            Welcome back!
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl">
                            Let's continue building amazing architectures with AI-powered structure and precision.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                            { label: 'Projects Created', value: '12', icon: <FileText className="w-5 h-5" /> },
                            { label: 'Team Members', value: '5', icon: <Users className="w-5 h-5" /> },
                            { label: 'Architectures Generated', value: '28', icon: <FolderOpen className="w-5 h-5" /> },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="bg-card border border-border rounded-lg p-6 animate-in fade-in slide-in-from-left duration-500"
                                style={{ animationDelay: `${100 + idx * 100}ms` }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Action Cards */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-foreground mb-8">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {dashboardCards.map((card, index) => (
                                <div
                                    key={card.id}
                                    className="group relative animate-in fade-in zoom-in duration-500"
                                    style={{ animationDelay: `${200 + index * 100}ms` }}
                                    onMouseEnter={() => setHoveredCard(card.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    {/* Glow */}
                                    <div
                                        className={`absolute -inset-1 bg-gradient-to-r ${card.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}
                                    />

                                    {/* Card */}
                                    <div
                                        className={`relative bg-card border-2 ${card.borderColor} rounded-2xl p-8 transition-all duration-500 ${hoveredCard === card.id ? 'shadow-2xl -translate-y-2' : 'shadow-lg'
                                            }`}
                                    >
                                        <div
                                            className={`mb-6 inline-flex p-3 rounded-xl transition-all duration-500 ${hoveredCard === card.id
                                                    ? 'bg-primary/20 text-primary scale-110'
                                                    : 'bg-primary/10 text-foreground'
                                                }`}
                                        >
                                            {card.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground mb-3 text-balance">
                                            {card.title}
                                        </h3>
                                        <p className="text-muted-foreground mb-6 leading-relaxed">
                                            {card.description}
                                        </p>
                                        <Button asChild className={`w-full transition-all duration-300 ${hoveredCard === card.id ? 'scale-105' : 'scale-100'}`} size="lg">
                                            <Link href={card.href}>
                                                {card.buttonText}
                                            </Link>
                                        </Button>
                                        <div
                                            className={`absolute top-0 left-0 h-1 bg-linear-to-r from-primary to-transparent rounded-full transition-all duration-500 ${hoveredCard === card.id ? 'w-24' : 'w-0'
                                                }`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div
                        className="bg-card border border-border rounded-xl p-8 animate-in fade-in duration-500"
                        style={{ animationDelay: '500ms' }}
                    >
                        <h2 className="text-xl font-bold text-foreground mb-6">Recent Activity</h2>
                        <div className="space-y-4">
                            {[
                                { action: 'Created project', project: 'E-Commerce Platform', time: '2 hours ago' },
                                { action: 'Generated architecture', project: 'Microservices API', time: '5 hours ago' },
                                { action: 'Added team member', project: 'Project Dashboard', time: '1 day ago' },
                            ].map((activity, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                    <div>
                                        <p className="text-foreground font-medium">{activity.action}</p>
                                        <p className="text-sm text-muted-foreground">{activity.project}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
