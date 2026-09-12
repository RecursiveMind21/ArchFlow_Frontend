'use client';

import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Database,
    Table,
    Key,
    Download,
    ChevronRight,
    Link as LinkIcon,
    FileCode,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

interface Table {
    id: string;
    name: string;
    description: string;
    fields: Field[];
    relationships: Relationship[];
}

interface Field {
    name: string;
    type: string;
    constraints: string[];
    description: string;
}

interface Relationship {
    type: 'one-to-one' | 'one-to-many' | 'many-to-many' | 'many-to-one';
    targetTable: string;
    description: string;
}

interface DatabaseArchitecture {
    projectId: number;
    databaseType: string;
    tables: Table[];
    stats: {
        totalTables: number;
        totalPrimaryKeys: number;
        totalRelationships: number;
    };
}

export default function DatabaseArchitecturePage() {
    const params = useParams();
    const projectId = params.id as string;

    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [architecture, setArchitecture] = useState<DatabaseArchitecture | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArchitecture = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetchWithAuth(`/projects/${projectId}/architecture/database`, {
                    method: 'GET',
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch database architecture');
                }

                const data: DatabaseArchitecture = await res.json();
                setArchitecture(data);
                
                // Set first table as selected by default
                if (data.tables.length > 0 && !selectedTable) {
                    setSelectedTable(data.tables[0].id);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load architecture');
            } finally {
                setIsLoading(false);
            }
        };

        fetchArchitecture();
    }, [projectId]);

    const getTableColor = (tableName: string) => {
        const colors: { [key: string]: string } = {
            'users': 'bg-blue-500/30 border-blue-500/50 text-foreground',
            'projects': 'bg-purple-500/30 border-purple-500/50 text-foreground',
            'features': 'bg-green-500/30 border-green-500/50 text-foreground',
            'architectures': 'bg-orange-500/30 border-orange-500/50 text-foreground',
            'sessions': 'bg-pink-500/30 border-pink-500/50 text-foreground',
        };
        return colors[tableName] || 'bg-gray-500/30 border-gray-500/50 text-foreground';
    };

    const getTableIconColor = (tableName: string) => {
        const colors: { [key: string]: string } = {
            'users': 'text-blue-400',
            'projects': 'text-purple-400',
            'features': 'text-green-400',
            'architectures': 'text-orange-400',
            'sessions': 'text-pink-400',
        };
        return colors[tableName] || 'text-gray-400';
    };

    const getRelationshipColor = (type: string) => {
        switch (type) {
            case 'one-to-one': return 'text-blue-400';
            case 'one-to-many': return 'text-green-400';
            case 'many-to-one': return 'text-orange-400';
            case 'many-to-many': return 'text-purple-400';
            default: return 'text-gray-400';
        }
    };

    const selectedTableData = architecture?.tables.find(t => t.id === selectedTable);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading database architecture...</p>
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
                                    Database Architecture
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    AI-generated database schema and relationships
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export SQL
                            </Button>
                        </div>
                    </div>

                    {/* Schema Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-700" style={{ animationDelay: '100ms' }}>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Table className="w-4 h-4 text-green-400" />
                                <p className="text-xs text-muted-foreground">Tables</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{architecture.stats.totalTables}</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Key className="w-4 h-4 text-blue-400" />
                                <p className="text-xs text-muted-foreground">Primary Keys</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{architecture.stats.totalPrimaryKeys}</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <LinkIcon className="w-4 h-4 text-purple-400" />
                                <p className="text-xs text-muted-foreground">Relationships</p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">{architecture.stats.totalRelationships}</p>
                        </div>
                        <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Database className="w-4 h-4 text-orange-400" />
                                <p className="text-xs text-muted-foreground">Database</p>
                            </div>
                            <p className="text-sm font-bold text-foreground">{architecture.databaseType}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Tables List */}
                        <div className="lg:col-span-2">
                            <div className="bg-card border border-border rounded-xl p-6 animate-in fade-in duration-700" style={{ animationDelay: '200ms' }}>
                                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-primary" />
                                    Database Tables
                                </h2>
                                
                                {/* Tables List */}
                                <div className="space-y-4">
                                    {architecture.tables.map((table, index) => (
                                        <div
                                            key={table.id}
                                            onClick={() => setSelectedTable(table.id)}
                                            className={`group cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-left ${
                                                selectedTable === table.id 
                                                    ? 'scale-105' 
                                                    : 'hover:scale-105'
                                            }`}
                                            style={{ animationDelay: `${300 + index * 50}ms` }}
                                        >
                                            {/* Table Card */}
                                            <div className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                                                getTableColor(table.name)
                                            } ${
                                                selectedTable === table.id 
                                                    ? 'ring-2 ring-primary shadow-lg' 
                                                    : ''
                                            }`}>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className={`p-2 bg-background/80 rounded ${getTableIconColor(table.name)}`}>
                                                        <Table className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-base font-mono text-foreground">{table.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{table.fields.length} fields</p>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {table.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Table Details Panel */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-xl p-6 sticky top-24 animate-in fade-in slide-in-from-right duration-700" style={{ animationDelay: '300ms' }}>
                                {selectedTableData ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                                            <div className={`p-3 rounded-lg bg-background/80 border-2 ${getTableColor(selectedTableData.name).split(' ')[1]} ${getTableIconColor(selectedTableData.name)}`}>
                                                <Table className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-foreground font-mono">{selectedTableData.name}</h3>
                                                <p className="text-sm text-muted-foreground">{selectedTableData.fields.length} fields</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                            {selectedTableData.description}
                                        </p>

                                        {/* Fields */}
                                        <div className="mb-6">
                                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                <FileCode className="w-4 h-4" />
                                                Fields
                                            </h4>
                                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                                {selectedTableData.fields.map((field, i) => (
                                                    <div key={i} className="p-4 bg-secondary/30 rounded-lg">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <span className="text-sm font-mono font-semibold text-foreground">{field.name}</span>
                                                            <span className="text-sm font-mono text-muted-foreground">{field.type}</span>
                                                        </div>
                                                        {field.constraints.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mb-2">
                                                                {field.constraints.map((constraint, j) => (
                                                                    <span key={j} className="text-xs px-2 py-1 bg-primary/10 border border-primary/20 rounded text-primary font-mono">
                                                                        {constraint}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-muted-foreground leading-relaxed">{field.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Relationships */}
                                        {selectedTableData.relationships.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                    <LinkIcon className="w-4 h-4" />
                                                    Relationships
                                                </h4>
                                                <div className="space-y-3">
                                                    {selectedTableData.relationships.map((rel, i) => (
                                                        <div key={i} className="p-4 bg-secondary/30 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className={`text-sm font-semibold ${getRelationshipColor(rel.type)}`}>
                                                                    {rel.type}
                                                                </span>
                                                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                                <button
                                                                    onClick={() => setSelectedTable(rel.targetTable)}
                                                                    className="text-sm font-mono font-semibold text-primary hover:underline"
                                                                >
                                                                    {rel.targetTable}
                                                                </button>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground leading-relaxed">{rel.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <p className="text-sm text-muted-foreground">
                                            Click on a table to view schema
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
