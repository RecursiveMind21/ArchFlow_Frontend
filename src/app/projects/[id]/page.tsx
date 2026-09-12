'use client';

import { 
    ArrowLeft, 
    Server, 
    Layout, 
    Database, 
    Network, 
    FileText, 
    Users, 
    MessageSquare,
    GitBranch,
    Settings,
    Download,
    Eye,
    CheckCircle2,
    Clock,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProjectDashboardPage() {
    const params = useParams();
    const projectId = params.id as string;

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
            id: 'ai-chat',
            icon: <MessageSquare className="w-8 h-8" />,
            title: 'AI Assistant',
            description: 'Continue chatting with AI to refine and improve your project',
            href: `/projects/${projectId}/chat`,
            color: 'from-cyan-500/20 to-cyan-500/5',
            borderColor: 'border-cyan-500/20',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header */}
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

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in duration-700" style={{ animationDelay: '100ms' }}>
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
                    
                    {/* Dashboard Cards */}
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
                                    {/* Glow */}
                                    <div className={`absolute -inset-1 bg-gradient-to-r ${card.color} rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`} />

                                    {/* Card */}
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

                </div>
            </div>
        </div>
    );
}
