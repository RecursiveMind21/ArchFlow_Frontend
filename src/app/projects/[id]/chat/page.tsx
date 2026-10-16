'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, CheckCircle2, ArrowLeft, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function ProjectChatPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content:
                "Hello! I'm your AI assistant. I can help you refine your project requirements, suggest features, and answer questions about your architecture. How can I assist you today?",
            timestamp: new Date(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [projectName, setProjectName] = useState('Project Chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetchWithAuth(`/projects/${projectId}`, { method: 'GET' });
                if (res.ok) {
                    const data = await res.json();
                    setProjectName(data.projectName || 'Project Chat');
                }
            } catch (err) {
                console.error('Failed to fetch project details:', err);
            }
        };
        fetchProject();
    }, [projectId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || isSending) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        setIsSending(true);

        try {
            const res = await fetchWithAuth('/ai/chat', {
                method: 'POST',
                body: JSON.stringify({
                    projectId: parseInt(projectId),
                    message: inputMessage,
                }),
            });

            if (!res.ok) throw new Error('Failed to send message');

            const aiResponse = await res.text();

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.',
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const handleComplete = async () => {
        if (isCompleting) return;

        const confirmComplete = window.confirm(
            'Are you sure you want to complete the requirements? This will finalize your project setup.'
        );
        if (!confirmComplete) return;

        setIsCompleting(true);

        try {
            const res = await fetchWithAuth(`/ai/complete?projectId=${projectId}`, {
                method: 'POST',
            });

            if (!res.ok) throw new Error('Failed to complete requirements');

            const response = await res.text();

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: response,
                    timestamp: new Date(),
                },
            ]);

            setTimeout(() => {
                router.push(`/projects/${projectId}`);
            }, 2000);
        } catch {
            alert('Failed to complete requirements. Please try again.');
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="h-screen bg-gradient-to-br pb-5 from-background via-background to-secondary/20 flex flex-col overflow-hidden">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Chat Header */}
            <div className="relative z-10 pt-24 px-4 sm:px-6 lg:px-8 flex-shrink-0">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-card border border-border rounded-t-xl p-4 shadow-lg">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3 min-w-0">
                                <Link href="/projects">
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="w-4 h-4 mr-1" />
                                        Back
                                    </Button>
                                </Link>
                                <div className="min-w-0">
                                    <h1 className="text-xl font-bold text-foreground truncate">
                                        {projectName}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        AI Requirements Assistant
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleComplete}
                                disabled={isCompleting}
                                size="sm"
                                className="flex items-center gap-2 shrink-0"
                            >
                                {isCompleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        Complete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    <div className="flex-1 bg-card border-x border-border overflow-y-auto p-4 sm:p-6 space-y-5 min-h-0">
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}

                        {/* Typing Indicator */}
                        {isSending && (
                            <div className="flex gap-3 animate-in fade-in duration-300">
                                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center border border-border">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="inline-block px-4 py-3 rounded-2xl rounded-tl-sm bg-secondary/60 border border-border">
                                        <div className="flex gap-1">
                                            <div
                                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                                style={{ animationDelay: '0ms' }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                                style={{ animationDelay: '150ms' }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                                                style={{ animationDelay: '300ms' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-card border-x border-b border-border rounded-b-xl p-4 shadow-lg flex-shrink-0">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type your message..."
                                disabled={isSending}
                                className="flex-1 px-4 py-3 text-base bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 disabled:opacity-50"
                            />
                            <Button
                                type="submit"
                                disabled={!inputMessage.trim() || isSending}
                                size="lg"
                                className="px-6"
                            >
                                {isSending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </Button>
                        </form>
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                            Ask questions about your project, request feature suggestions, or refine requirements
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Message Bubble ─────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user';
    const time = message.timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div
            className={`flex gap-3 animate-in fade-in slide-in-from-bottom duration-300 ${isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
        >
            {/* Avatar */}
            <div
                className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border ${isUser
                        ? 'bg-primary/15 border-primary/30 text-primary'
                        : 'bg-secondary/60 border-border text-secondary-foreground'
                    }`}
            >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div
                className={`flex-1 min-w-0 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''
                    }`}
            >
                <div
                    className={`inline-block rounded-2xl px-4 py-3 ${isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-secondary/60 text-foreground border border-border rounded-tl-sm'
                        }`}
                >
                    {isUser ? (
                        <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                    ) : (
                        <MarkdownContent content={message.content} />
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 px-1">{time}</p>
            </div>
        </div>
    );
}

// ─── Markdown Renderer ──────────────────────────────────────────────────────

function MarkdownContent({ content }: { content: string }) {
    return (
        <div className="text-base leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold mt-5 mb-2 first:mt-0">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg font-bold mt-4 mb-2 first:mt-0">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-base font-semibold mt-3 mb-1.5 first:mt-0">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="my-2 first:mt-0 last:mb-0 leading-relaxed">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="my-2 space-y-1 list-disc pl-5">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-2 space-y-1 list-decimal pl-5">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                    ),
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
                    pre: ({ children }) => (
                        <pre className="my-3 p-3 rounded-lg bg-background border border-border overflow-x-auto text-sm">
                            {children}
                        </pre>
                    ),
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
                    strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => <em className="italic">{children}</em>,
                    blockquote: ({ children }) => (
                        <blockquote className="my-3 pl-3 border-l-2 border-primary/40 text-muted-foreground italic">
                            {children}
                        </blockquote>
                    ),
                    hr: () => <hr className="my-4 border-border" />,
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
                        <td className="px-3 py-2 border-b border-border/50">
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}