'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, CheckCircle2, ArrowLeft, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import Link from 'next/link';

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
            content: 'Hello! I\'m your AI assistant. I can help you refine your project requirements, suggest features, and answer questions about your architecture. How can I assist you today?',
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

    const formatMessage = (content: string) => {
        // Split content into lines
        const lines = content.split('\n');
        const elements: React.ReactElement[] = [];
        let currentTable: string[][] = [];
        let inTable = false;
        let listItems: string[] = [];
        let inList = false;

        const flushTable = () => {
            if (currentTable.length > 0) {
                elements.push(
                    <div key={`table-${elements.length}`} className="my-4 overflow-x-auto">
                        <table className="min-w-full border-collapse border border-border">
                            <thead>
                                <tr className="bg-muted/50">
                                    {currentTable[0].map((header, i) => (
                                        <th key={i} className="border border-border px-3 py-2 text-left font-semibold text-xs">
                                            {header.trim()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentTable.slice(1).map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-muted/30">
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="border border-border px-3 py-2 text-xs">
                                                {cell.trim()}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
                currentTable = [];
            }
        };

        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${elements.length}`} className="my-2 ml-4 space-y-1">
                        {listItems.map((item, i) => (
                            <li key={i} className="text-xs list-disc">{item}</li>
                        ))}
                    </ul>
                );
                listItems = [];
            }
        };

        lines.forEach((line, index) => {
            // Check for table rows (contains |)
            if (line.includes('|') && line.split('|').length > 2) {
                if (!inTable) {
                    flushList();
                    inTable = true;
                }
                // Skip separator lines (|---|---|)
                if (!line.match(/^\s*\|[\s\-:]+\|/)) {
                    const cells = line.split('|').filter(cell => cell.trim() !== '');
                    currentTable.push(cells);
                }
            } else {
                if (inTable) {
                    flushTable();
                    inTable = false;
                }

                // Check for list items (starts with • or -)
                if (line.trim().match(/^[•\-\*]\s+/)) {
                    if (!inList) {
                        inList = true;
                    }
                    listItems.push(line.trim().replace(/^[•\-\*]\s+/, ''));
                } else {
                    if (inList) {
                        flushList();
                        inList = false;
                    }

                    // Check for headers (###, ##, #)
                    if (line.trim().startsWith('###')) {
                        elements.push(
                            <h3 key={index} className="text-base font-bold mt-4 mb-2">
                                {line.replace(/^###\s*/, '')}
                            </h3>
                        );
                    } else if (line.trim().startsWith('##')) {
                        elements.push(
                            <h2 key={index} className="text-lg font-bold mt-5 mb-3">
                                {line.replace(/^##\s*/, '')}
                            </h2>
                        );
                    } else if (line.trim().startsWith('#')) {
                        elements.push(
                            <h1 key={index} className="text-xl font-bold mt-6 mb-3">
                                {line.replace(/^#\s*/, '')}
                            </h1>
                        );
                    } else if (line.trim().startsWith('---')) {
                        elements.push(<hr key={index} className="my-4 border-border" />);
                    } else if (line.trim() === '') {
                        elements.push(<div key={index} className="h-2" />);
                    } else {
                        // Regular text with bold support
                        const formattedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                        elements.push(
                            <p key={index} className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
                        );
                    }
                }
            }
        });

        // Flush any remaining table or list
        flushTable();
        flushList();

        return <div className="space-y-1">{elements}</div>;
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Fetch project details to get the name
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

            if (!res.ok) {
                throw new Error('Failed to send message');
            }

            const aiResponse = await res.text();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err: any) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
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

            if (!res.ok) {
                throw new Error('Failed to complete requirements');
            }

            const response = await res.text();

            const completionMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, completionMessage]);

            // Redirect to project dashboard after a short delay
            setTimeout(() => {
                router.push(`/projects/${projectId}`);
            }, 2000);
        } catch (err: any) {
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Link href="/projects">
                                    <Button variant="ghost" size="sm">
                                        <ArrowLeft className="w-4 h-4 mr-1" />
                                        Back
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-xl font-bold text-foreground">{projectName}</h1>
                                    <p className="text-sm text-muted-foreground">AI Requirements Assistant</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleComplete}
                                disabled={isCompleting}
                                size="sm"
                                className="flex items-center gap-2"
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
                    <div className="flex-1 bg-card border-x border-border overflow-y-auto p-6 space-y-4 min-h-0">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 animate-in fade-in slide-in-from-bottom duration-300 ${
                                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                }`}
                            >
                                {/* Avatar */}
                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary text-secondary-foreground'
                                    }`}
                                >
                                    {message.role === 'user' ? (
                                        <User className="w-4 h-4" />
                                    ) : (
                                        <Bot className="w-4 h-4" />
                                    )}
                                </div>

                                {/* Message Content */}
                                <div
                                    className={`flex-1 max-w-[85%] ${
                                        message.role === 'user' ? 'text-right' : 'text-left'
                                    }`}
                                >
                                    <div
                                        className={`inline-block px-4 py-3 rounded-lg ${
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground'
                                        }`}
                                    >
                                        <div className="text-sm whitespace-pre-wrap break-words prose prose-sm dark:prose-invert max-w-none">
                                            {formatMessage(message.content)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 px-1">
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isSending && (
                            <div className="flex gap-3 animate-in fade-in duration-300">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="inline-block px-4 py-3 rounded-lg bg-secondary">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 disabled:opacity-50"
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
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Ask questions about your project, request feature suggestions, or refine requirements
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
