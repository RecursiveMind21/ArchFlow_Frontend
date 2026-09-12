'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft,
    Network,
    Search,
    Download,
    ChevronRight,
    Code,
    FileJson,
    Lock,
    Globe,
    Copy,
    Check,
    Terminal,
    Layers,
    Server,
    Send,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiParameter {
    name: string;
    in: 'path' | 'query' | 'header';
    type: string;
    required: boolean;
    description: string;
}

interface ApiField {
    name: string;
    type: string;
    required: boolean;
    description: string;
}

interface ApiResponse {
    status: number;
    description: string;
}

interface ApiEndpoint {
    id: string;
    method: HttpMethod;
    path: string;
    summary: string;
    description: string;
    tag: string;
    auth: boolean;
    parameters?: ApiParameter[];
    requestBody?: ApiField[];
    responseFields?: ApiField[];
    responses: ApiResponse[];
    example?: string;
}

interface ApiDesign {
    projectId: number;
    baseUrl: string;
    endpoints: ApiEndpoint[];
    stats: {
        totalEndpoints: number;
        resources: number;
        protectedEndpoints: number;
        publicEndpoints: number;
    };
}

type TabKey = 'overview' | 'request' | 'response' | 'example';

const METHODS: (HttpMethod | 'ALL')[] = ['ALL', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function ApiDesignPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [design, setDesign] = useState<ApiDesign | null>(null);
    const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [methodFilter, setMethodFilter] = useState<HttpMethod | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApiDesign = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetchWithAuth(
                    `/projects/${projectId}/architecture/apidesign`,
                    { method: 'GET' }
                );

                if (!res.ok) {
                    throw new Error('Failed to fetch API design');
                }

                const data: ApiDesign = await res.json();

                // Normalize: ensure arrays exist so the UI never crashes on
                // missing optional fields.
                const normalized: ApiDesign = {
                    ...data,
                    endpoints: (data.endpoints ?? []).map((ep) => ({
                        ...ep,
                        parameters: ep.parameters ?? [],
                        requestBody: ep.requestBody ?? [],
                        responseFields: ep.responseFields ?? [],
                        responses: ep.responses ?? [],
                    })),
                };

                setDesign(normalized);

                if (normalized.endpoints.length > 0) {
                    setSelectedEndpoint(normalized.endpoints[0].id);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load API design');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApiDesign();
    }, [projectId]);

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-green-500/20 border-green-500/50 text-green-400';
            case 'POST': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
            case 'PUT': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
            case 'PATCH': return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
            case 'DELETE': return 'bg-red-500/20 border-red-500/50 text-red-400';
            default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
        }
    };

    const getStatusColor = (status: number) => {
        if (status < 300) return 'text-green-400 bg-green-500/10 border-green-500/30';
        if (status < 400) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
        if (status < 500) return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    };

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            /* clipboard unavailable */
        }
    };

    const handleSelectEndpoint = (id: string) => {
        setSelectedEndpoint(id);
        setActiveTab('overview');
    };

    const groupedEndpoints = useMemo(() => {
        if (!design) return [] as [string, ApiEndpoint[]][];

        const q = search.trim().toLowerCase();
        const filtered = design.endpoints.filter((ep) => {
            const matchesMethod = methodFilter === 'ALL' || ep.method === methodFilter;
            const matchesSearch =
                !q ||
                ep.path.toLowerCase().includes(q) ||
                ep.summary.toLowerCase().includes(q) ||
                ep.tag.toLowerCase().includes(q);
            return matchesMethod && matchesSearch;
        });

        const groups = new Map<string, ApiEndpoint[]>();
        filtered.forEach((ep) => {
            if (!groups.has(ep.tag)) groups.set(ep.tag, []);
            groups.get(ep.tag)!.push(ep);
        });

        return Array.from(groups.entries());
    }, [design, methodFilter, search]);

    const selectedEndpointData = design?.endpoints.find((e) => e.id === selectedEndpoint);
    const totalVisible = groupedEndpoints.reduce((sum, [, eps]) => sum + eps.length, 0);

    // ── Loading ──────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading API design...</p>
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────
    if (error || !design) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">
                        Failed to Load API Design
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {error || 'Unknown error occurred'}
                    </p>
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

    // ── Empty ────────────────────────────────────────────────────────────
    if (design.endpoints.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-bold text-foreground mb-2">
                        No API Endpoints Yet
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        The AI hasn't generated any endpoints for this project yet.
                    </p>
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
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                                    API Design
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    AI-generated REST endpoints, schemas and request/response contracts
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export OpenAPI
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-700"
                        style={{ animationDelay: '100ms' }}
                    >
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Send className="w-4 h-4 text-blue-400" />
                                <p className="text-xs text-muted-foreground">Endpoints</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {design.stats.totalEndpoints}
                            </p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Layers className="w-4 h-4 text-purple-400" />
                                <p className="text-xs text-muted-foreground">Resources</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {design.stats.resources}
                            </p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Lock className="w-4 h-4 text-red-400" />
                                <p className="text-xs text-muted-foreground">Protected</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {design.stats.protectedEndpoints}
                            </p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Globe className="w-4 h-4 text-green-400" />
                                <p className="text-xs text-muted-foreground">Public</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {design.stats.publicEndpoints}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Endpoints list */}
                        <div className="lg:col-span-2">
                            <div
                                className="bg-card border border-border rounded-xl p-6 animate-in fade-in duration-700"
                                style={{ animationDelay: '200ms' }}
                            >
                                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        <Network className="w-5 h-5 text-primary" />
                                        Endpoints
                                    </h2>
                                    {design.baseUrl && (
                                        <span className="text-xs font-mono px-2 py-1 rounded bg-secondary/50 border border-border text-muted-foreground">
                                            {design.baseUrl}
                                        </span>
                                    )}
                                </div>

                                {/* Search */}
                                <div className="relative mb-4">
                                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search endpoints, paths or resources..."
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>

                                {/* Method filter */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {METHODS.map((m) => {
                                        const isActive = methodFilter === m;
                                        return (
                                            <button
                                                key={m}
                                                onClick={() => setMethodFilter(m)}
                                                className={`text-xs font-semibold px-3 py-1.5 rounded border transition-all duration-200 ${isActive
                                                        ? m === 'ALL'
                                                            ? 'bg-primary/20 border-primary/50 text-primary'
                                                            : getMethodColor(m)
                                                        : 'bg-background/60 border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                                                    }`}
                                            >
                                                {m}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Grouped endpoint list */}
                                {totalVisible === 0 ? (
                                    <div className="text-center py-12">
                                        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-sm text-muted-foreground">
                                            No endpoints match your filters
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {groupedEndpoints.map(([tag, endpoints], groupIndex) => (
                                            <div key={tag}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Layers className="w-4 h-4 text-primary" />
                                                    <h3 className="text-sm font-semibold text-foreground capitalize">
                                                        {tag}
                                                    </h3>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({endpoints.length})
                                                    </span>
                                                </div>

                                                <div className="space-y-3">
                                                    {endpoints.map((endpoint, index) => {
                                                        const isSelected = selectedEndpoint === endpoint.id;
                                                        return (
                                                            <div
                                                                key={endpoint.id}
                                                                onClick={() => handleSelectEndpoint(endpoint.id)}
                                                                className={`group cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-left ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.02]'
                                                                    }`}
                                                                style={{
                                                                    animationDelay: `${300 + groupIndex * 60 + index * 40}ms`,
                                                                }}
                                                            >
                                                                <div
                                                                    className={`p-4 rounded-lg border-2 bg-secondary/20 border-border transition-all duration-300 ${isSelected
                                                                            ? 'ring-2 ring-primary shadow-lg border-primary/40'
                                                                            : 'hover:border-primary/30'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <span
                                                                            className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded border font-mono ${getMethodColor(
                                                                                endpoint.method
                                                                            )}`}
                                                                        >
                                                                            {endpoint.method}
                                                                        </span>

                                                                        <code className="flex-1 text-sm font-mono text-foreground truncate">
                                                                            {endpoint.path}
                                                                        </code>

                                                                        {endpoint.auth ? (
                                                                            <Lock className="w-4 h-4 text-red-400 shrink-0" />
                                                                        ) : (
                                                                            <Globe className="w-4 h-4 text-green-400 shrink-0" />
                                                                        )}

                                                                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-foreground shrink-0" />
                                                                    </div>

                                                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-1">
                                                                        {endpoint.summary}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detail panel */}
                        <div className="lg:col-span-1">
                            <div
                                className="bg-card border border-border rounded-xl p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto animate-in fade-in slide-in-from-right duration-700"
                                style={{ animationDelay: '300ms' }}
                            >
                                {selectedEndpointData ? (
                                    <>
                                        {/* Endpoint header */}
                                        <div className="mb-4 pb-4 border-b border-border">
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                <span
                                                    className={`text-xs font-bold px-2.5 py-1 rounded border font-mono ${getMethodColor(
                                                        selectedEndpointData.method
                                                    )}`}
                                                >
                                                    {selectedEndpointData.method}
                                                </span>
                                                {selectedEndpointData.auth ? (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-400">
                                                        <Lock className="w-3 h-3" />
                                                        Auth required
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-green-500/30 bg-green-500/10 text-green-400">
                                                        <Globe className="w-3 h-3" />
                                                        Public
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <code className="flex-1 text-sm font-mono text-foreground break-all">
                                                    {selectedEndpointData.path}
                                                </code>
                                                <button
                                                    onClick={() =>
                                                        handleCopy(
                                                            selectedEndpointData.path,
                                                            `path-${selectedEndpointData.id}`
                                                        )
                                                    }
                                                    className="shrink-0 p-1.5 rounded border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
                                                    aria-label="Copy path"
                                                >
                                                    {copiedId === `path-${selectedEndpointData.id}` ? (
                                                        <Check className="w-3.5 h-3.5 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>

                                            <h3 className="font-semibold text-base text-foreground mt-3">
                                                {selectedEndpointData.summary}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1 capitalize">
                                                {selectedEndpointData.tag}
                                            </p>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex gap-1 mb-5 p-1 bg-secondary/40 rounded-lg">
                                            {(['overview', 'request', 'response', 'example'] as TabKey[]).map(
                                                (tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setActiveTab(tab)}
                                                        className={`flex-1 text-xs font-medium py-1.5 rounded capitalize transition-colors ${activeTab === tab
                                                                ? 'bg-background text-foreground shadow-sm'
                                                                : 'text-muted-foreground hover:text-foreground'
                                                            }`}
                                                    >
                                                        {tab}
                                                    </button>
                                                )
                                            )}
                                        </div>

                                        {/* Overview */}
                                        {activeTab === 'overview' && (
                                            <div className="space-y-6">
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {selectedEndpointData.description}
                                                </p>

                                                <div>
                                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                        <Server className="w-4 h-4" />
                                                        Responses
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {selectedEndpointData.responses.map((r, i) => (
                                                            <div key={i} className="flex items-start gap-3 text-sm">
                                                                <span
                                                                    className={`shrink-0 font-mono text-xs px-2 py-1 rounded border ${getStatusColor(
                                                                        r.status
                                                                    )}`}
                                                                >
                                                                    {r.status}
                                                                </span>
                                                                <span className="text-muted-foreground leading-relaxed pt-0.5">
                                                                    {r.description}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Request */}
                                        {activeTab === 'request' && (
                                            <div className="space-y-6">
                                                {selectedEndpointData.parameters &&
                                                    selectedEndpointData.parameters.length > 0 ? (
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                            <Code className="w-4 h-4" />
                                                            Parameters
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {selectedEndpointData.parameters.map((p, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="text-sm px-3 py-2 bg-secondary/50 rounded border border-border"
                                                                >
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="font-mono text-foreground">
                                                                            {p.name}
                                                                        </span>
                                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-background/70 border border-border text-muted-foreground">
                                                                            {p.in}
                                                                        </span>
                                                                        <span className="text-xs text-primary font-mono">
                                                                            {p.type}
                                                                        </span>
                                                                        {p.required && (
                                                                            <span className="text-xs text-red-400">
                                                                                required
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                                                        {p.description}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        No parameters for this endpoint.
                                                    </p>
                                                )}

                                                {selectedEndpointData.requestBody &&
                                                    selectedEndpointData.requestBody.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                <FileJson className="w-4 h-4" />
                                                                Request Body
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {selectedEndpointData.requestBody.map(
                                                                    (f, i) => (
                                                                        <div
                                                                            key={i}
                                                                            className="text-sm px-3 py-2 bg-secondary/50 rounded border border-border"
                                                                        >
                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                <span className="font-mono text-foreground">
                                                                                    {f.name}
                                                                                </span>
                                                                                <span className="text-xs text-primary font-mono">
                                                                                    {f.type}
                                                                                </span>
                                                                                {f.required && (
                                                                                    <span className="text-xs text-red-400">
                                                                                        required
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                                                                {f.description}
                                                                            </p>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        )}

                                        {/* Response */}
                                        {activeTab === 'response' && (
                                            <div className="space-y-6">
                                                {selectedEndpointData.responseFields &&
                                                    selectedEndpointData.responseFields.length > 0 ? (
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                            <FileJson className="w-4 h-4" />
                                                            Response Schema
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {selectedEndpointData.responseFields.map(
                                                                (f, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className="text-sm px-3 py-2 bg-secondary/50 rounded border border-border"
                                                                    >
                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                            <span className="font-mono text-foreground">
                                                                                {f.name}
                                                                            </span>
                                                                            <span className="text-xs text-primary font-mono">
                                                                                {f.type}
                                                                            </span>
                                                                            {f.required && (
                                                                                <span className="text-xs text-red-400">
                                                                                    required
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                                                            {f.description}
                                                                        </p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        No response schema documented.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Example */}
                                        {activeTab === 'example' && (
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                        <Terminal className="w-4 h-4" />
                                                        Example
                                                    </h4>
                                                    {selectedEndpointData.example && (
                                                        <button
                                                            onClick={() =>
                                                                handleCopy(
                                                                    selectedEndpointData.example!,
                                                                    `ex-${selectedEndpointData.id}`
                                                                )
                                                            }
                                                            className="p-1.5 rounded border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors"
                                                            aria-label="Copy example"
                                                        >
                                                            {copiedId ===
                                                                `ex-${selectedEndpointData.id}` ? (
                                                                <Check className="w-3.5 h-3.5 text-green-400" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                {selectedEndpointData.example ? (
                                                    <pre className="text-xs font-mono bg-secondary/50 border border-border rounded-lg p-3 overflow-x-auto text-foreground leading-relaxed whitespace-pre">
                                                        {selectedEndpointData.example}
                                                    </pre>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        No example available.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-sm text-muted-foreground">
                                            Select an endpoint to view details
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