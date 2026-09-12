'use client';

import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Layout,
    Layers,
    Code,
    Download,
    ChevronRight,
    Box,
    Palette,
    Workflow,
    FileCode,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

interface Component {
    id: string;
    name: string;
    type: 'page' | 'component' | 'layout' | 'hook' | 'utility' | 'context';
    description: string;
    technologies: string[];
    path: string;
    props?: string[];
    features: string[];
}

interface FrontendArchitecture {
    projectId: number;
    components: Component[];
    stats: {
        totalPages: number;
        totalComponents: number;
        totalHooks: number;
        totalUtilities: number;
    };
}

export default function FrontendArchitecturePage() {
    const params = useParams();
    const projectId = params.id as string;

    const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
    const [architecture, setArchitecture] = useState<FrontendArchitecture | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArchitecture = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetchWithAuth(`/projects/${projectId}/architecture/frontend`, {
                    method: 'GET',
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch frontend architecture');
                }

                const data: FrontendArchitecture = await res.json();
                setArchitecture(data);
                
                // Set first component as selected by default
                if (data.components.length > 0 && !selectedComponent) {
                    setSelectedComponent(data.components[0].id);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load architecture');
            } finally {
                setIsLoading(false);
            }
        };

        fetchArchitecture();
    }, [projectId]);

    const getComponentIcon = (type: string) => {
        switch (type) {
            case 'page': return <Layout className="w-5 h-5" />;
            case 'component': return <Box className="w-5 h-5" />;
            case 'layout': return <Layers className="w-5 h-5" />;
            case 'hook': return <Code className="w-5 h-5" />;
            case 'utility': return <Workflow className="w-5 h-5" />;
            case 'context': return <Palette className="w-5 h-5" />;
            default: return <FileCode className="w-5 h-5" />;
        }
    };

    const getComponentColor = (type: string) => {
        switch (type) {
            case 'page': return 'bg-blue-500/30 border-blue-500/50 text-foreground';
            case 'component': return 'bg-purple-500/30 border-purple-500/50 text-foreground';
            case 'layout': return 'bg-green-500/30 border-green-500/50 text-foreground';
            case 'hook': return 'bg-orange-500/30 border-orange-500/50 text-foreground';
            case 'utility': return 'bg-pink-500/30 border-pink-500/50 text-foreground';
            case 'context': return 'bg-cyan-500/30 border-cyan-500/50 text-foreground';
            default: return 'bg-gray-500/30 border-gray-500/50 text-foreground';
        }
    };

    const getComponentIconColor = (type: string) => {
        switch (type) {
            case 'page': return 'text-blue-400';
            case 'component': return 'text-purple-400';
            case 'layout': return 'text-green-400';
            case 'hook': return 'text-orange-400';
            case 'utility': return 'text-pink-400';
            case 'context': return 'text-cyan-400';
            default: return 'text-gray-400';
        }
    };

    const selectedComponentData = architecture?.components.find(c => c.id === selectedComponent);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading frontend architecture...</p>
                </div>
            </div>
        );
    }

    if (error || !architecture) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Failed to Load Architecture</h2>
                    <p className="text-muted-foreground mb-4">{error || 'Unknown error occurred'}</p>
                    <Link href={`/projects/${projectId}`}>
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

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
                        <Link href={`/projects/${projectId}`}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                                    Frontend Architecture
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    AI-generated component structure and frontend design
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Architecture Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-700" style={{ animationDelay: '100ms' }}>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Layout className="w-4 h-4 text-blue-400" />
                                <p className="text-xs text-muted-foreground">Pages</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{architecture.stats.totalPages}</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Box className="w-4 h-4 text-purple-400" />
                                <p className="text-xs text-muted-foreground">Components</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{architecture.stats.totalComponents}</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Code className="w-4 h-4 text-orange-400" />
                                <p className="text-xs text-muted-foreground">Hooks</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{architecture.stats.totalHooks}</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Workflow className="w-4 h-4 text-pink-400" />
                                <p className="text-xs text-muted-foreground">Utilities</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{architecture.stats.totalUtilities}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Components List */}
                        <div className="lg:col-span-2">
                            <div className="bg-card border border-border rounded-xl p-6 animate-in fade-in duration-700" style={{ animationDelay: '200ms' }}>
                                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-primary" />
                                    Component Structure
                                </h2>
                                
                                {/* Components Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {architecture.components.map((component, index) => (
                                        <div
                                            key={component.id}
                                            onClick={() => setSelectedComponent(component.id)}
                                            className={`group cursor-pointer transition-all duration-300 animate-in fade-in zoom-in ${
                                                selectedComponent === component.id 
                                                    ? 'scale-105' 
                                                    : 'hover:scale-105'
                                            }`}
                                            style={{ animationDelay: `${300 + index * 50}ms` }}
                                        >
                                            {/* Component Card */}
                                            <div className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                                                getComponentColor(component.type)
                                            } ${
                                                selectedComponent === component.id 
                                                    ? 'ring-2 ring-primary shadow-lg' 
                                                    : ''
                                            }`}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`p-2 bg-background/80 rounded ${getComponentIconColor(component.type)}`}>
                                                        {getComponentIcon(component.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-base text-foreground">{component.name}</h3>
                                                        <p className="text-sm text-muted-foreground capitalize">{component.type}</p>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                                    {component.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {component.technologies.slice(0, 3).map((tech, i) => (
                                                        <span key={i} className="text-sm px-2 py-1 bg-background/60 rounded text-foreground border border-border">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Component Details Panel */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-xl p-6 sticky top-24 animate-in fade-in slide-in-from-right duration-700" style={{ animationDelay: '300ms' }}>
                                {selectedComponentData ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                                            <div className={`p-3 rounded-lg bg-background/80 border-2 ${getComponentColor(selectedComponentData.type).split(' ')[1]} ${getComponentIconColor(selectedComponentData.type)}`}>
                                                {getComponentIcon(selectedComponentData.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-foreground">{selectedComponentData.name}</h3>
                                                <p className="text-sm text-muted-foreground capitalize">{selectedComponentData.type}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                            {selectedComponentData.description}
                                        </p>

                                        {/* File Path */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                                <FileCode className="w-4 h-4" />
                                                File Path
                                            </h4>
                                            <div className="text-sm px-3 py-2 bg-secondary/50 rounded font-mono">
                                                {selectedComponentData.path}
                                            </div>
                                        </div>

                                        {/* Technologies */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                <Code className="w-4 h-4" />
                                                Technologies
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedComponentData.technologies.map((tech, i) => (
                                                    <span key={i} className="text-sm px-3 py-1.5 bg-primary/10 border border-primary/20 rounded text-primary">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Props */}
                                        {selectedComponentData.props && selectedComponentData.props.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                    <Box className="w-4 h-4" />
                                                    Props
                                                </h4>
                                                <div className="space-y-2">
                                                    {selectedComponentData.props.map((prop, i) => (
                                                        <div key={i} className="text-sm px-3 py-2 bg-secondary/50 rounded font-mono">
                                                            {prop}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Features */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                <Layers className="w-4 h-4" />
                                                Features
                                            </h4>
                                            <ul className="space-y-2">
                                                {selectedComponentData.features.map((feature, i) => (
                                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed">
                                                        <span className="text-primary mt-0.5">•</span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-sm text-muted-foreground">
                                            Click on a component to view details
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
