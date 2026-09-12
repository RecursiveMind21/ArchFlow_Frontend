'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    FileText,
    Download,
    Loader2,
    AlertCircle,
    BookOpen,
    CheckCircle2,
    Zap,
    Users,
    Target,
    AlertTriangle,
    BookMarked,
    ChevronRight,
    ChevronDown,
    Sparkles,
    TrendingUp,
    ShieldCheck,
    Wrench,
    Info,
    FileDown,
    FileJson,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

type Priority = 'must' | 'should' | 'could' | 'wont';

interface FunctionalRequirement {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    category: string;
    acceptanceCriteria: string[];
}

interface NonFunctionalRequirement {
    id: string;
    category: string;
    requirement: string;
    metric: string;
    priority: Priority;
}

interface UserStory {
    id: string;
    role: string;
    want: string;
    soThat: string;
    priority: Priority;
    acceptanceCriteria: string[];
}

interface UseCase {
    id: string;
    name: string;
    actors: string[];
    preconditions: string[];
    mainFlow: string[];
    alternateFlows: string[];
    postconditions: string[];
}

interface GlossaryTerm {
    term: string;
    definition: string;
}

interface RequirementsDocument {
    projectId: number;
    title: string;
    version: string;
    generatedAt: string;
    overview: {
        vision: string;
        scope: string;
        goals: string[];
        outOfScope: string[];
    };
    functionalRequirements: FunctionalRequirement[];
    nonFunctionalRequirements: NonFunctionalRequirement[];
    userStories: UserStory[];
    useCases: UseCase[];
    constraints: string[];
    assumptions: string[];
    glossary: GlossaryTerm[];
    stats: {
        functionalRequirements: number;
        nonFunctionalRequirements: number;
        userStories: number;
        useCases: number;
    };
}

type SectionKey =
    | 'overview'
    | 'functional'
    | 'nonFunctional'
    | 'userStories'
    | 'useCases'
    | 'constraints'
    | 'glossary';

// ─── Export helpers ──────────────────────────────────────────────────────────

/**
 * Builds a complete Markdown representation of the SRS document.
 * The output is GitHub-flavored Markdown that renders cleanly in
 * Notion, VS Code, GitHub, Obsidian, etc.
 */
function buildMarkdownSrs(doc: RequirementsDocument): string {
    const L: string[] = [];
    const push = (...lines: string[]) => L.push(...lines);

    // ── Header ──
    push(`# ${doc.title}`, '');
    push(`**Version:** ${doc.version}  `);
    push(`**Generated:** ${new Date(doc.generatedAt).toLocaleString()}  `);
    push(`**Project ID:** ${doc.projectId}`, '');
    push('---', '');

    // ── Table of contents ──
    push('## Table of Contents', '');
    push('1. [Overview](#1-overview)');
    push('2. [Functional Requirements](#2-functional-requirements)');
    push('3. [Non-Functional Requirements](#3-non-functional-requirements)');
    push('4. [User Stories](#4-user-stories)');
    push('5. [Use Cases](#5-use-cases)');
    push('6. [Constraints & Assumptions](#6-constraints--assumptions)');
    push('7. [Glossary](#7-glossary)', '');
    push('---', '');

    // ── 1. Overview ──
    push('## 1. Overview', '');
    push('### 1.1 Vision', '');
    push(doc.overview.vision || '_Not specified._', '');
    push('### 1.2 Scope', '');
    push(doc.overview.scope || '_Not specified._', '');
    push('### 1.3 Goals', '');
    if (doc.overview.goals.length) {
        doc.overview.goals.forEach((g) => push(`- ${g}`));
    } else {
        push('_No goals specified._');
    }
    push('');
    push('### 1.4 Out of Scope', '');
    if (doc.overview.outOfScope.length) {
        doc.overview.outOfScope.forEach((o) => push(`- ${o}`));
    } else {
        push('_Nothing declared out of scope._');
    }
    push('', '---', '');

    // ── 2. Functional Requirements ──
    push('## 2. Functional Requirements', '');
    if (doc.functionalRequirements.length === 0) {
        push('_None specified._', '');
    } else {
        doc.functionalRequirements.forEach((fr) => {
            push(`### ${fr.id}: ${fr.title}`, '');
            push(`**Priority:** ${fr.priority.toUpperCase()}  `);
            push(`**Category:** ${fr.category}`, '');
            push(fr.description, '');
            if (fr.acceptanceCriteria.length) {
                push('**Acceptance Criteria:**', '');
                fr.acceptanceCriteria.forEach((ac) => push(`- [ ] ${ac}`));
                push('');
            }
            push('---', '');
        });
    }

    // ── 3. Non-Functional Requirements ──
    push('## 3. Non-Functional Requirements', '');
    if (doc.nonFunctionalRequirements.length === 0) {
        push('_None specified._', '');
    } else {
        push('| ID | Category | Requirement | Target Metric | Priority |');
        push('|----|----------|-------------|---------------|----------|');
        doc.nonFunctionalRequirements.forEach((nfr) => {
            const safeReq = nfr.requirement.replace(/\|/g, '\\|');
            const safeMetric = nfr.metric.replace(/\|/g, '\\|');
            push(
                `| ${nfr.id} | ${nfr.category} | ${safeReq} | ${safeMetric} | ${nfr.priority.toUpperCase()} |`
            );
        });
        push('', '---', '');
    }

    // ── 4. User Stories ──
    push('## 4. User Stories', '');
    if (doc.userStories.length === 0) {
        push('_None specified._', '');
    } else {
        doc.userStories.forEach((us) => {
            push(`### ${us.id}`, '');
            push(
                `**As a** ${us.role}, **I want to** ${us.want} **so that** ${us.soThat}.`,
                ''
            );
            push(`**Priority:** ${us.priority.toUpperCase()}`, '');
            if (us.acceptanceCriteria.length) {
                push('**Acceptance Criteria:**', '');
                us.acceptanceCriteria.forEach((ac) => push(`- [ ] ${ac}`));
                push('');
            }
            push('---', '');
        });
    }

    // ── 5. Use Cases ──
    push('## 5. Use Cases', '');
    if (doc.useCases.length === 0) {
        push('_None specified._', '');
    } else {
        doc.useCases.forEach((uc) => {
            push(`### ${uc.id}: ${uc.name}`, '');
            push('**Actors:**', '');
            if (uc.actors.length) uc.actors.forEach((a) => push(`- ${a}`));
            else push('_None listed._');
            push('');

            push('**Preconditions:**', '');
            if (uc.preconditions.length) uc.preconditions.forEach((p) => push(`- ${p}`));
            else push('_None._');
            push('');

            push('**Main Flow:**', '');
            if (uc.mainFlow.length) {
                uc.mainFlow.forEach((step, i) => push(`${i + 1}. ${step}`));
            } else {
                push('_No steps documented._');
            }
            push('');

            if (uc.alternateFlows.length) {
                push('**Alternate Flows:**', '');
                uc.alternateFlows.forEach((flow) => push(`- ${flow}`));
                push('');
            }

            push('**Postconditions:**', '');
            if (uc.postconditions.length) uc.postconditions.forEach((p) => push(`- ${p}`));
            else push('_None._');
            push('');

            push('---', '');
        });
    }

    // ── 6. Constraints & Assumptions ──
    push('## 6. Constraints & Assumptions', '');
    push('### 6.1 Constraints', '');
    if (doc.constraints.length) doc.constraints.forEach((c) => push(`- ${c}`));
    else push('_None specified._');
    push('');
    push('### 6.2 Assumptions', '');
    if (doc.assumptions.length) doc.assumptions.forEach((a) => push(`- ${a}`));
    else push('_None specified._');
    push('', '---', '');

    // ── 7. Glossary ──
    push('## 7. Glossary', '');
    if (doc.glossary.length === 0) {
        push('_No glossary terms defined._', '');
    } else {
        push('| Term | Definition |');
        push('|------|------------|');
        doc.glossary.forEach((g) => {
            const safeTerm = g.term.replace(/\|/g, '\\|');
            const safeDef = g.definition.replace(/\|/g, '\\|');
            push(`| ${safeTerm} | ${safeDef} |`);
        });
        push('');
    }

    // ── Footer ──
    push('---', '');
    push(`_Document generated by ArchFlow on ${new Date().toISOString()}_`);

    return L.join('\n');
}

/**
 * Triggers a browser download for the given text content.
 */
function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Turns a title into a safe filename slug.
 */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'srs-document';
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RequirementsPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [doc, setDoc] = useState<RequirementsDocument | null>(null);
    const [activeSection, setActiveSection] = useState<SectionKey>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    // Close the export dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                exportMenuRef.current &&
                !exportMenuRef.current.contains(e.target as Node)
            ) {
                setExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchDocument = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetchWithAuth(
                    `/projects/${projectId}/architecture/requirements`,
                    { method: 'GET' }
                );

                if (!res.ok) throw new Error('Failed to fetch requirements document');

                const data: Partial<RequirementsDocument> = await res.json();

                // ── Normalize everything — never trust the LLM shape ──
                const functionalRequirements: FunctionalRequirement[] = (
                    data.functionalRequirements ?? []
                )
                    .filter(Boolean)
                    .map((r) => ({
                        id: r.id ?? '',
                        title: r.title ?? '',
                        description: r.description ?? '',
                        priority: ((r.priority ?? 'must') as string).toLowerCase() as Priority,
                        category: r.category ?? '',
                        acceptanceCriteria: r.acceptanceCriteria ?? [],
                    }));

                const nonFunctionalRequirements: NonFunctionalRequirement[] = (
                    data.nonFunctionalRequirements ?? []
                )
                    .filter(Boolean)
                    .map((r) => ({
                        id: r.id ?? '',
                        category: r.category ?? '',
                        requirement: r.requirement ?? '',
                        metric: r.metric ?? '',
                        priority: ((r.priority ?? 'must') as string).toLowerCase() as Priority,
                    }));

                const userStories: UserStory[] = (data.userStories ?? [])
                    .filter(Boolean)
                    .map((s) => ({
                        id: s.id ?? '',
                        role: s.role ?? '',
                        want: s.want ?? '',
                        soThat: s.soThat ?? '',
                        priority: ((s.priority ?? 'must') as string).toLowerCase() as Priority,
                        acceptanceCriteria: s.acceptanceCriteria ?? [],
                    }));

                const useCases: UseCase[] = (data.useCases ?? [])
                    .filter(Boolean)
                    .map((uc) => ({
                        id: uc.id ?? '',
                        name: uc.name ?? '',
                        actors: uc.actors ?? [],
                        preconditions: uc.preconditions ?? [],
                        mainFlow: uc.mainFlow ?? [],
                        alternateFlows: uc.alternateFlows ?? [],
                        postconditions: uc.postconditions ?? [],
                    }));

                const constraints: string[] = data.constraints ?? [];
                const assumptions: string[] = data.assumptions ?? [];
                const glossary: GlossaryTerm[] = (data.glossary ?? [])
                    .filter(Boolean)
                    .map((g) => ({
                        term: g.term ?? '',
                        definition: g.definition ?? '',
                    }));

                const overview = {
                    vision: data.overview?.vision ?? '',
                    scope: data.overview?.scope ?? '',
                    goals: data.overview?.goals ?? [],
                    outOfScope: data.overview?.outOfScope ?? [],
                };

                const stats = {
                    functionalRequirements: functionalRequirements.length,
                    nonFunctionalRequirements: nonFunctionalRequirements.length,
                    userStories: userStories.length,
                    useCases: useCases.length,
                };

                const normalized: RequirementsDocument = {
                    projectId: data.projectId ?? Number(projectId),
                    title: data.title ?? 'Software Requirements Specification',
                    version: data.version ?? '1.0',
                    generatedAt: data.generatedAt ?? new Date().toISOString(),
                    overview,
                    functionalRequirements,
                    nonFunctionalRequirements,
                    userStories,
                    useCases,
                    constraints,
                    assumptions,
                    glossary,
                    stats,
                };

                setDoc(normalized);
            } catch (err: any) {
                setError(err.message || 'Failed to load requirements');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocument();
    }, [projectId]);

    // ── Export handlers ─────────────────────────────────────────────────────

    const handleExportMarkdown = () => {
        if (!doc) return;
        const markdown = buildMarkdownSrs(doc);
        const filename = `${slugify(doc.title)}-v${doc.version}.md`;
        downloadFile(markdown, filename, 'text/markdown');
        setExportMenuOpen(false);
    };

    const handleExportJson = () => {
        if (!doc) return;
        const json = JSON.stringify(doc, null, 2);
        const filename = `${slugify(doc.title)}-v${doc.version}.json`;
        downloadFile(json, filename, 'application/json');
        setExportMenuOpen(false);
    };

    // ── Helpers ─────────────────────────────────────────────────────────────

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'must':
                return 'bg-red-500/15 border-red-500/40 text-red-400';
            case 'should':
                return 'bg-orange-500/15 border-orange-500/40 text-orange-400';
            case 'could':
                return 'bg-blue-500/15 border-blue-500/40 text-blue-400';
            case 'wont':
                return 'bg-gray-500/15 border-gray-500/40 text-gray-400';
            default:
                return 'bg-gray-500/15 border-gray-500/40 text-gray-400';
        }
    };

    const getNfrIcon = (category: string) => {
        const c = category.toLowerCase();
        if (c.includes('performance')) return <Zap className="w-4 h-4 text-orange-400" />;
        if (c.includes('security')) return <ShieldCheck className="w-4 h-4 text-red-400" />;
        if (c.includes('scalab')) return <TrendingUp className="w-4 h-4 text-blue-400" />;
        if (c.includes('reliab')) return <CheckCircle2 className="w-4 h-4 text-green-400" />;
        if (c.includes('usab')) return <Users className="w-4 h-4 text-purple-400" />;
        if (c.includes('maintain')) return <Wrench className="w-4 h-4 text-yellow-400" />;
        return <Zap className="w-4 h-4 text-primary" />;
    };

    // ── Loading ─────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Generating requirements document...</p>
                </div>
            </div>
        );
    }

    // ── Error ───────────────────────────────────────────────────────────────

    if (error || !doc) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">
                        Failed to Load Requirements
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

    // ── Section navigation config ───────────────────────────────────────────

    const sections: {
        key: SectionKey;
        label: string;
        icon: React.ReactNode;
        count?: number;
    }[] = [
            { key: 'overview', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
            {
                key: 'functional',
                label: 'Functional',
                icon: <CheckCircle2 className="w-4 h-4" />,
                count: doc.functionalRequirements.length,
            },
            {
                key: 'nonFunctional',
                label: 'Non-Functional',
                icon: <Zap className="w-4 h-4" />,
                count: doc.nonFunctionalRequirements.length,
            },
            {
                key: 'userStories',
                label: 'User Stories',
                icon: <Users className="w-4 h-4" />,
                count: doc.userStories.length,
            },
            {
                key: 'useCases',
                label: 'Use Cases',
                icon: <Target className="w-4 h-4" />,
                count: doc.useCases.length,
            },
            {
                key: 'constraints',
                label: 'Constraints & Assumptions',
                icon: <AlertTriangle className="w-4 h-4" />,
                count: doc.constraints.length + doc.assumptions.length,
            },
            {
                key: 'glossary',
                label: 'Glossary',
                icon: <BookMarked className="w-4 h-4" />,
                count: doc.glossary.length,
            },
        ];

    // ── Render ──────────────────────────────────────────────────────────────

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
                                    Requirements Document
                                </h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <p className="text-lg text-muted-foreground">{doc.title}</p>
                                    <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded border border-primary/30 bg-primary/10 text-primary">
                                        <Sparkles className="w-3 h-3" />
                                        v{doc.version}
                                    </span>
                                </div>
                            </div>

                            {/* Export dropdown */}
                            <div className="relative" ref={exportMenuRef}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setExportMenuOpen((v) => !v)}
                                    aria-haspopup="menu"
                                    aria-expanded={exportMenuOpen}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 ml-1.5 transition-transform duration-200 ${exportMenuOpen ? 'rotate-180' : ''
                                            }`}
                                    />
                                </Button>

                                {exportMenuOpen && (
                                    <div
                                        role="menu"
                                        className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-20 animate-in fade-in slide-in-from-top-1 duration-150"
                                    >
                                        <button
                                            role="menuitem"
                                            onClick={handleExportMarkdown}
                                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/60 transition-colors"
                                        >
                                            <FileDown className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    Download as Markdown
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    .md — for Notion, GitHub, docs
                                                </p>
                                            </div>
                                        </button>

                                        <div className="border-t border-border" />

                                        <button
                                            role="menuitem"
                                            onClick={handleExportJson}
                                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/60 transition-colors"
                                        >
                                            <FileJson className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    Download as JSON
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    .json — for tooling & integrations
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-700"
                        style={{ animationDelay: '100ms' }}
                    >
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                <p className="text-xs text-muted-foreground">Functional</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {doc.stats.functionalRequirements}
                            </p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-4 h-4 text-orange-400" />
                                <p className="text-xs text-muted-foreground">Non-Functional</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {doc.stats.nonFunctionalRequirements}
                            </p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-purple-400" />
                                <p className="text-xs text-muted-foreground">User Stories</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {doc.stats.userStories}
                            </p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-blue-400" />
                                <p className="text-xs text-muted-foreground">Use Cases</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {doc.stats.useCases}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Section navigation */}
                        <div className="lg:col-span-1">
                            <div
                                className="bg-card border border-border rounded-xl p-4 sticky top-24 animate-in fade-in slide-in-from-left duration-700"
                                style={{ animationDelay: '200ms' }}
                            >
                                <h2 className="text-sm font-bold text-foreground mb-3 px-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    Sections
                                </h2>
                                <nav className="space-y-1">
                                    {sections.map((s) => {
                                        const isActive = activeSection === s.key;
                                        return (
                                            <button
                                                key={s.key}
                                                onClick={() => setActiveSection(s.key)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${isActive
                                                        ? 'bg-primary/15 border border-primary/40 text-foreground'
                                                        : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                                    }`}
                                            >
                                                <span className={isActive ? 'text-primary' : ''}>
                                                    {s.icon}
                                                </span>
                                                <span className="flex-1 text-left font-medium">
                                                    {s.label}
                                                </span>
                                                {typeof s.count === 'number' && (
                                                    <span
                                                        className={`text-xs px-1.5 py-0.5 rounded ${isActive
                                                                ? 'bg-primary/20 text-primary'
                                                                : 'bg-secondary/60 text-muted-foreground'
                                                            }`}
                                                    >
                                                        {s.count}
                                                    </span>
                                                )}
                                                <ChevronRight
                                                    className={`w-3.5 h-3.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'
                                                        }`}
                                                />
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3">
                            <div
                                className="bg-card border border-border rounded-xl p-6 sm:p-8 animate-in fade-in duration-700"
                                style={{ animationDelay: '300ms' }}
                            >

                                {/* ── Overview ── */}
                                {activeSection === 'overview' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                                                <BookOpen className="w-5 h-5 text-primary" />
                                                Overview
                                            </h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {doc.overview.vision}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-3">
                                                Scope
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed">
                                                {doc.overview.scope}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-secondary/30 border border-border rounded-lg p-5">
                                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                    Goals
                                                </h3>
                                                <ul className="space-y-2">
                                                    {doc.overview.goals.map((g, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed"
                                                        >
                                                            <span className="text-green-400 mt-0.5">•</span>
                                                            <span>{g}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-secondary/30 border border-border rounded-lg p-5">
                                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                                                    Out of Scope
                                                </h3>
                                                <ul className="space-y-2">
                                                    {doc.overview.outOfScope.map((o, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed"
                                                        >
                                                            <span className="text-orange-400 mt-0.5">•</span>
                                                            <span>{o}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Functional Requirements ── */}
                                {activeSection === 'functional' && (
                                    <div>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                Functional Requirements
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                What the system must do, expressed as testable behaviors.
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            {doc.functionalRequirements.map((fr) => (
                                                <div
                                                    key={fr.id}
                                                    className="border border-border rounded-lg p-5 bg-secondary/20 hover:border-primary/40 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-primary/15 border border-primary/40 text-primary">
                                                            {fr.id}
                                                        </span>
                                                        <span
                                                            className={`text-xs font-semibold px-2 py-1 rounded border capitalize ${getPriorityStyle(
                                                                fr.priority
                                                            )}`}
                                                        >
                                                            {fr.priority}
                                                        </span>
                                                        <span className="text-xs px-2 py-1 rounded bg-secondary/60 border border-border text-muted-foreground">
                                                            {fr.category}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-foreground mb-2">
                                                        {fr.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                                        {fr.description}
                                                    </p>
                                                    {fr.acceptanceCriteria.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-foreground mb-2">
                                                                Acceptance Criteria
                                                            </p>
                                                            <ul className="space-y-1.5">
                                                                {fr.acceptanceCriteria.map((ac, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className="text-sm text-muted-foreground flex items-start gap-2"
                                                                    >
                                                                        <span className="text-green-400 mt-0.5">
                                                                            ✓
                                                                        </span>
                                                                        <span>{ac}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Non-Functional Requirements ── */}
                                {activeSection === 'nonFunctional' && (
                                    <div>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-orange-400" />
                                                Non-Functional Requirements
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Quality attributes and constraints the system must satisfy.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {doc.nonFunctionalRequirements.map((nfr) => (
                                                <div
                                                    key={nfr.id}
                                                    className="border border-border rounded-lg p-5 bg-secondary/20 hover:border-primary/40 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-primary/15 border border-primary/40 text-primary">
                                                            {nfr.id}
                                                        </span>
                                                        <span
                                                            className={`text-xs font-semibold px-2 py-1 rounded border capitalize ${getPriorityStyle(
                                                                nfr.priority
                                                            )}`}
                                                        >
                                                            {nfr.priority}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {getNfrIcon(nfr.category)}
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {nfr.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                                        {nfr.requirement}
                                                    </p>
                                                    <div className="text-xs px-3 py-2 rounded bg-background/60 border border-border">
                                                        <span className="text-muted-foreground">
                                                            Target:{' '}
                                                        </span>
                                                        <span className="font-mono text-primary">
                                                            {nfr.metric}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── User Stories ── */}
                                {activeSection === 'userStories' && (
                                    <div>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                                                <Users className="w-5 h-5 text-purple-400" />
                                                User Stories
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Feature descriptions from the perspective of the end user.
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            {doc.userStories.map((us) => (
                                                <div
                                                    key={us.id}
                                                    className="border border-border rounded-lg p-5 bg-secondary/20 hover:border-primary/40 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                                                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-primary/15 border border-primary/40 text-primary">
                                                            {us.id}
                                                        </span>
                                                        <span
                                                            className={`text-xs font-semibold px-2 py-1 rounded border capitalize ${getPriorityStyle(
                                                                us.priority
                                                            )}`}
                                                        >
                                                            {us.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground leading-relaxed mb-4">
                                                        <span className="text-muted-foreground">
                                                            As a{' '}
                                                        </span>
                                                        <span className="font-semibold text-primary">
                                                            {us.role}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            , I want to{' '}
                                                        </span>
                                                        <span className="font-medium">{us.want}</span>
                                                        <span className="text-muted-foreground">
                                                            {' '}
                                                            so that{' '}
                                                        </span>
                                                        <span className="font-medium">{us.soThat}</span>
                                                        <span className="text-muted-foreground">.</span>
                                                    </p>
                                                    {us.acceptanceCriteria.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-foreground mb-2">
                                                                Acceptance Criteria
                                                            </p>
                                                            <ul className="space-y-1.5">
                                                                {us.acceptanceCriteria.map((ac, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className="text-sm text-muted-foreground flex items-start gap-2"
                                                                    >
                                                                        <span className="text-purple-400 mt-0.5">
                                                                            ✓
                                                                        </span>
                                                                        <span>{ac}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Use Cases ── */}
                                {activeSection === 'useCases' && (
                                    <div>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                                                <Target className="w-5 h-5 text-blue-400" />
                                                Use Cases
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Detailed interaction flows between actors and the system.
                                            </p>
                                        </div>
                                        <div className="space-y-5">
                                            {doc.useCases.map((uc) => (
                                                <div
                                                    key={uc.id}
                                                    className="border border-border rounded-lg p-5 bg-secondary/20"
                                                >
                                                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                                                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-primary/15 border border-primary/40 text-primary">
                                                            {uc.id}
                                                        </span>
                                                        <h3 className="font-semibold text-foreground">
                                                            {uc.name}
                                                        </h3>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div>
                                                            <p className="text-xs font-semibold text-foreground mb-2">
                                                                Actors
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {uc.actors.map((a, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="text-xs px-2 py-1 rounded bg-blue-500/15 border border-blue-500/40 text-blue-400"
                                                                    >
                                                                        {a}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs font-semibold text-foreground mb-2">
                                                                Preconditions
                                                            </p>
                                                            <ul className="space-y-1 mb-4">
                                                                {uc.preconditions.map((p, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className="text-sm text-muted-foreground flex items-start gap-2"
                                                                    >
                                                                        <span className="text-blue-400 mt-0.5">
                                                                            •
                                                                        </span>
                                                                        <span>{p}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-foreground mb-2">
                                                                Postconditions
                                                            </p>
                                                            <ul className="space-y-1">
                                                                {uc.postconditions.map((p, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className="text-sm text-muted-foreground flex items-start gap-2"
                                                                    >
                                                                        <span className="text-green-400 mt-0.5">
                                                                            •
                                                                        </span>
                                                                        <span>{p}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 pt-5 border-t border-border">
                                                        <p className="text-xs font-semibold text-foreground mb-3">
                                                            Main Flow
                                                        </p>
                                                        <ol className="space-y-2 mb-4">
                                                            {uc.mainFlow.map((step, i) => (
                                                                <li
                                                                    key={i}
                                                                    className="text-sm text-muted-foreground flex items-start gap-3"
                                                                >
                                                                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 border border-primary/40 text-primary text-xs font-bold flex items-center justify-center">
                                                                        {i + 1}
                                                                    </span>
                                                                    <span className="pt-0.5">{step}</span>
                                                                </li>
                                                            ))}
                                                        </ol>

                                                        {uc.alternateFlows.length > 0 && (
                                                            <>
                                                                <p className="text-xs font-semibold text-foreground mb-3">
                                                                    Alternate Flows
                                                                </p>
                                                                <ul className="space-y-2">
                                                                    {uc.alternateFlows.map((flow, i) => (
                                                                        <li
                                                                            key={i}
                                                                            className="text-sm text-muted-foreground flex items-start gap-2"
                                                                        >
                                                                            <span className="text-orange-400 mt-0.5">
                                                                                ↳
                                                                            </span>
                                                                            <span>{flow}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Constraints & Assumptions ── */}
                                {activeSection === 'constraints' && (
                                    <div>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-orange-400" />
                                                Constraints &amp; Assumptions
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Boundaries and premises the requirements depend on.
                                            </p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="border border-border rounded-lg p-5 bg-secondary/20">
                                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                                                    Constraints
                                                </h3>
                                                <ul className="space-y-2">
                                                    {doc.constraints.map((c, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed"
                                                        >
                                                            <span className="text-orange-400 mt-0.5">•</span>
                                                            <span>{c}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="border border-border rounded-lg p-5 bg-secondary/20">
                                                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                    <Info className="w-4 h-4 text-blue-400" />
                                                    Assumptions
                                                </h3>
                                                <ul className="space-y-2">
                                                    {doc.assumptions.map((a, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed"
                                                        >
                                                            <span className="text-blue-400 mt-0.5">•</span>
                                                            <span>{a}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Glossary ── */}
                                {activeSection === 'glossary' && (
                                    <div>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                                                <BookMarked className="w-5 h-5 text-primary" />
                                                Glossary
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Domain-specific terminology used across this document.
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            {doc.glossary.map((g, i) => (
                                                <div
                                                    key={i}
                                                    className="border border-border rounded-lg p-4 bg-secondary/20"
                                                >
                                                    <p className="font-semibold text-foreground mb-1">
                                                        {g.term}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {g.definition}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
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