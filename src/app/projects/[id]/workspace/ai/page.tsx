'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    Sparkles,
    Send,
    Loader2,
    Copy,
    Check,
    User as UserIcon,
    Bot,
    Trash2,
    StopCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'user' | 'assistant';

interface Message {
    id: string;
    role: Role;
    content: string;
    createdAt: string;
    isStreaming?: boolean;
}

interface ChatResponse {
    id: number;
    role: string;
    content: string;
    createdAt: string;
}

interface HistoryItem {
    id: number;
    role: string;
    content: string;
    createdAt: string;
}

// ─── Suggested prompts ───────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
    {
        title: 'Explain the architecture',
        prompt: 'Give me a high-level overview of the backend architecture.',
    },
    {
        title: 'Write a feature',
        prompt: 'Help me add a new endpoint for user profile updates.',
    },
    {
        title: 'Review the requirements',
        prompt: 'What are the must-have functional requirements for this project?',
    },
    {
        title: 'Suggest improvements',
        prompt: 'How would you improve the database schema for scalability?',
    },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AIAssistantPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // ── Load history on mount ───────────────────────────────────────────────

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await fetchWithAuth(
                    `/projects/${projectId}/ai/history`,
                    { method: 'GET' }
                );
                if (!res.ok) return;

                const items: HistoryItem[] = await res.json();

                setMessages(
                    items.map((m) => ({
                        id: String(m.id),
                        role: m.role === 'USER' ? 'user' : 'assistant',
                        content: m.content,
                        createdAt: m.createdAt,
                    }))
                );
            } catch {
                /* start with empty chat */
            } finally {
                setIsLoadingHistory(false);
            }
        };
        if (projectId) loadHistory();
    }, [projectId]);

    // ── Auto-scroll ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // ── Send ────────────────────────────────────────────────────────────────

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isGenerating) return;

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: 'user',
            content: text,
            createdAt: new Date().toISOString(),
        };

        const assistantId = `a-${Date.now()}`;
        const assistantMsg: Message = {
            id: assistantId,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
            isStreaming: true,
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setInput('');
        setIsGenerating(true);

        try {
            const res = await fetchWithAuth(
                `/projects/${projectId}/ai/chat`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text }),
                }
            );

            if (!res.ok) {
                throw new Error('Failed to get a response');
            }

            const data: ChatResponse = await res.json();

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantId
                        ? {
                            ...m,
                            id: String(data.id),
                            content: data.content,
                            createdAt: data.createdAt,
                            isStreaming: false,
                        }
                        : m
                )
            );
        } catch {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantId
                        ? {
                            ...m,
                            content:
                                'Sorry, something went wrong. Please try again.',
                            isStreaming: false,
                        }
                        : m
                )
            );
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Keyboard ────────────────────────────────────────────────────────────

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ── Clear ───────────────────────────────────────────────────────────────

    const handleClear = async () => {
        if (messages.length === 0) return;
        if (!confirm('Clear this conversation? This cannot be undone.')) return;

        try {
            await fetchWithAuth(`/projects/${projectId}/ai/history`, {
                method: 'DELETE',
            });
        } catch {
            /* still clear locally */
        }

        setMessages([]);
    };

    // ── Copy ────────────────────────────────────────────────────────────────

    const handleCopy = async (content: string, id: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch { }
    };

    const handleSuggestion = (prompt: string) => {
        setInput(prompt);
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
    };

    const isEmpty = messages.length === 0 && !isLoadingHistory;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col h-screen pt-20 pb-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl w-full mx-auto flex flex-col flex-1 min-h-0">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <Link href={`/projects/${projectId}/workspace`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="hidden sm:flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-purple-500/15 rounded-xl text-purple-400 shrink-0">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-xl font-bold text-foreground truncate">
                                        AI Assistant
                                    </h1>
                                    <p className="text-sm text-muted-foreground truncate">
                                        Knows your project's requirements, architecture, and tasks
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!isEmpty && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                className="text-muted-foreground hover:text-destructive shrink-0"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline ml-2">Clear</span>
                            </Button>
                        )}
                    </div>

                    {/* Messages panel */}
                    <div className="flex-1 min-h-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                        {isLoadingHistory ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        Loading conversation...
                                    </p>
                                </div>
                            </div>
                        ) : isEmpty ? (
                            <EmptyState onSuggestionClick={handleSuggestion} />
                        ) : (
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6"
                            >
                                {messages.map((msg) => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        copiedId={copiedId}
                                        onCopy={handleCopy}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Composer */}
                    <div className="mt-4 shrink-0">
                        <div className="bg-card border border-border rounded-xl p-3 focus-within:border-primary/40 transition-colors">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything about your project..."
                                    rows={1}
                                    disabled={isGenerating}
                                    className="flex-1 resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60 min-h-[48px] max-h-[200px] py-2.5 px-2"
                                    style={{ height: '48px' }}
                                />

                                {isGenerating ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsGenerating(false)}
                                        className="shrink-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                                        size="sm"
                                    >
                                        <StopCircle className="w-4 h-4 mr-2" />
                                        Stop
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        className="shrink-0"
                                        size="sm"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Send
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center justify-between px-2 pt-2 mt-1 border-t border-border/50">
                                <p className="text-xs text-muted-foreground">
                                    <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[11px]">
                                        Enter
                                    </kbd>{' '}
                                    to send ·{' '}
                                    <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[11px]">
                                        Shift + Enter
                                    </kbd>{' '}
                                    for newline
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {messages.filter((m) => m.role === 'user').length} messages
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({
    onSuggestionClick,
}: {
    onSuggestionClick: (prompt: string) => void;
}) {
    return (
        <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-xl w-full text-center">
                <div className="inline-flex p-4 bg-purple-500/15 border-2 border-purple-500/40 rounded-2xl mb-5">
                    <Sparkles className="w-11 h-11 text-purple-400" />
                </div>

                <h2 className="text-3xl font-bold text-foreground mb-3">
                    How can I help?
                </h2>
                <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                    I already know this project's requirements, architecture,
                    and tasks. Ask me anything, or pick a starting point below.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    {SUGGESTED_PROMPTS.map((s) => (
                        <button
                            key={s.title}
                            onClick={() => onSuggestionClick(s.prompt)}
                            className="group p-4 bg-secondary/40 hover:bg-secondary/70 border border-border hover:border-purple-500/40 rounded-xl transition-all text-left"
                        >
                            <p className="text-base font-medium text-foreground mb-1.5 group-hover:text-purple-400 transition-colors">
                                {s.title}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {s.prompt}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Message bubble ─────────────────────────────────────────────────────────

function MessageBubble({
    message,
    copiedId,
    onCopy,
}: {
    message: Message;
    copiedId: string | null;
    onCopy: (content: string, id: string) => void;
}) {
    const isUser = message.role === 'user';
    const time = new Date(message.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div
                className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border ${isUser
                        ? 'bg-primary/15 border-primary/30 text-primary'
                        : 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                    }`}
            >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`flex-1 min-w-0 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
                <div
                    className={`rounded-2xl px-4 py-3 text-base leading-relaxed ${isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap break-words'
                            : 'bg-secondary/60 text-foreground border border-border rounded-tl-sm'
                        }`}
                >
                    {message.content ? (
                        isUser ? (
                            message.content
                        ) : (
                            <div className="prose-chat">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        // Headings
                                        h1: ({ children }) => (
                                            <h1 className="text-xl font-bold mt-5 mb-2 first:mt-0">{children}</h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="text-base font-semibold mt-3 mb-1.5 first:mt-0">{children}</h3>
                                        ),

                                        // Paragraphs
                                        p: ({ children }) => (
                                            <p className="my-2 first:mt-0 last:mb-0 leading-relaxed">{children}</p>
                                        ),

                                        // Lists
                                        ul: ({ children }) => (
                                            <ul className="my-2 space-y-1 list-disc pl-5">{children}</ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="my-2 space-y-1 list-decimal pl-5">{children}</ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="leading-relaxed">{children}</li>
                                        ),

                                        // Inline code
                                        code: ({ className, children, ...props }) => {
                                            const isBlock = className?.includes('language-');
                                            if (isBlock) {
                                                return (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                            return (
                                                <code
                                                    className="px-1.5 py-0.5 rounded bg-background/80 border border-border font-mono text-[0.9em]"
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        },

                                        // Code blocks
                                        pre: ({ children }) => (
                                            <pre className="my-3 p-3 rounded-lg bg-background border border-border overflow-x-auto text-sm">
                                                {children}
                                            </pre>
                                        ),

                                        // Links
                                        a: ({ href, children }) => (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {children}
                                            </a>
                                        ),

                                        // Bold / italic
                                        strong: ({ children }) => (
                                            <strong className="font-semibold">{children}</strong>
                                        ),
                                        em: ({ children }) => (
                                            <em className="italic">{children}</em>
                                        ),

                                        // Blockquote
                                        blockquote: ({ children }) => (
                                            <blockquote className="my-3 pl-3 border-l-2 border-primary/40 text-muted-foreground italic">
                                                {children}
                                            </blockquote>
                                        ),

                                        // Horizontal rule
                                        hr: () => <hr className="my-4 border-border" />,

                                        // Tables
                                        table: ({ children }) => (
                                            <div className="my-3 overflow-x-auto">
                                                <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                                                    {children}
                                                </table>
                                            </div>
                                        ),
                                        thead: ({ children }) => (
                                            <thead className="bg-secondary/60">{children}</thead>
                                        ),
                                        th: ({ children }) => (
                                            <th className="text-left px-3 py-2 font-semibold border-b border-border">
                                                {children}
                                            </th>
                                        ),
                                        td: ({ children }) => (
                                            <td className="px-3 py-2 border-b border-border/50">{children}</td>
                                        ),
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                                {message.isStreaming && (
                                    <span className="inline-block w-1.5 h-4 ml-0.5 bg-foreground/60 animate-pulse rounded-sm align-middle" />
                                )}
                            </div>
                        )
                    ) : (
                        <span className="inline-flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Thinking...
                        </span>
                    )}
                </div>

                <div
                    className={`flex items-center gap-2 mt-2 px-1 ${isUser ? 'flex-row-reverse' : ''
                        }`}
                >
                    <span className="text-xs text-muted-foreground">{time}</span>
                    {!isUser && message.content && !message.isStreaming && (
                        <button
                            onClick={() => onCopy(message.content, message.id)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                        >
                            {copiedId === message.id ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}