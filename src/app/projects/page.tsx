'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, FolderOpen, Users, Calendar, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

interface Feature {
    featureName: string;
    featureDescription: string;
    featurePriority: string;
}

interface Project {
    id: number;
    projectName: string;
    projectSummary: string;
    projectCategory: string;
    userScale: string;
    expectedTimeline: string;
    features: Feature[];
}

const formatCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
        'BUSINESS': 'Business',
        'EDUCATION': 'Education',
        'SOCIAL': 'Social',
        'FINANCE': 'Finance',
        'HEALTHCARE': 'Healthcare',
        'PRODUCTIVITY': 'Productivity',
        'WEB_APPLICATION': 'Web Application',
        'MOBILE_APPLICATION': 'Mobile Application',
        'BACKEND_API_ONLY': 'API / Backend Service',
        'DESKTOP_APPLICATION': 'Desktop Application',
        'OTHER': 'Other',
    };
    return categoryMap[category] || category;
};

const formatUserScale = (scale: string) => {
    const scaleMap: { [key: string]: string } = {
        'SMALL': 'Small (1-100)',
        'MEDIUM': 'Medium (100-10K)',
        'LARGE': 'Large (10K-1M)',
        'MASSIVE': 'Massive (1M+)',
    };
    return scaleMap[scale] || scale;
};

const formatTimeline = (timeline: string) => {
    const timelineMap: { [key: string]: string } = {
        'ONE_TO_THREE_MONTHS': '1-3 Months',
        'THREE_TO_SIX_MONTHS': '3-6 Months',
        'SIX_TO_TWELVE_MONTHS': '6-12 Months',
        'MORE_THAN_TWELVE_MONTHS': '1+ Years',
    };
    return timelineMap[timeline] || timeline;
};

const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
        'BUSINESS': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'EDUCATION': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'SOCIAL': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        'FINANCE': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'HEALTHCARE': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'PRODUCTIVITY': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        'WEB_APPLICATION': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'MOBILE_APPLICATION': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'BACKEND_API_ONLY': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'DESKTOP_APPLICATION': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'OTHER': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
};

export default function ExploreProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = ['All', 'Business', 'Education', 'Social', 'Finance', 'Healthcare', 'Productivity', 'Other'];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const res = await fetchWithAuth('/projects', { method: 'GET' });
                
                if (!res.ok) {
                    throw new Error('Failed to fetch projects');
                }
                
                const data: Project[] = await res.json();
                setProjects(data);
            } catch (err: any) {
                setError(err.message ?? 'Failed to load projects');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesSearch = project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.projectSummary.toLowerCase().includes(searchQuery.toLowerCase());
            const formattedCategory = formatCategory(project.projectCategory);
            const matchesCategory = selectedCategory === 'All' || formattedCategory === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [projects, searchQuery, selectedCategory]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">Explore Projects</h1>
                        <p className="text-lg text-muted-foreground">
                            View, manage, and interact with your previously created projects and their generated architectures.
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="space-y-6 mb-8 animate-in fade-in duration-700" style={{ animationDelay: '100ms' }}>
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search projects by name or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                disabled={loading}
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        disabled={loading}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${selectedCategory === category
                                                ? 'bg-primary text-primary-foreground shadow-lg'
                                                : 'bg-card border border-border text-foreground hover:border-primary'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground">Loading projects...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="py-12 text-center">
                            <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive max-w-md mx-auto">
                                {error}
                            </div>
                            <Button onClick={() => window.location.reload()}>Retry</Button>
                        </div>
                    )}

                    {/* Projects Grid */}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map((project, index) => (
                                    <div
                                        key={project.id}
                                        className="group relative animate-in fade-in zoom-in duration-500 cursor-pointer"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
                                        <div className="relative h-full p-6 border border-border rounded-xl bg-card hover:bg-secondary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                                        {project.projectName}
                                                    </h3>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(project.projectCategory)}`}>
                                                        {formatCategory(project.projectCategory)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {project.projectSummary}
                                            </p>

                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-border">
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <Users className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground">{formatUserScale(project.userScale)}</p>
                                                    <p className="text-xs text-muted-foreground">Scale</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <Zap className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground">{project.features.length}</p>
                                                    <p className="text-xs text-muted-foreground">Features</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center mb-1">
                                                        <Calendar className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <p className="text-sm font-semibold text-foreground">{formatTimeline(project.expectedTimeline)}</p>
                                                    <p className="text-xs text-muted-foreground">Timeline</p>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <Link href={`/projects/${project.id}`}>
                                                <button className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-300 transform group-hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                                                    View Project
                                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center">
                                    <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">No projects found</h3>
                                    <p className="text-muted-foreground mb-6">
                                        {projects.length === 0 
                                            ? "You haven't created any projects yet" 
                                            : "Try adjusting your search or filter criteria"}
                                    </p>
                                    <Link href="/create-project">
                                        <Button>Create Your First Project</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
