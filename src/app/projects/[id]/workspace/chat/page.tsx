'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    ArrowLeft,
    MessageSquare,
    Send,
    Loader2,
    Copy,
    Check,
    Users,
    Crown,
    Shield,
    User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TeamMember {
    id: number;
    userId: number;
    name: string;
    role: 'owner' | 'admin' | 'member';
    isYou: boolean;
}

interface ChatMessage {
    id: string;
    userId: number;
    authorName: string;
    authorRole: 'owner' | 'admin' | 'member';
    content: string;
    createdAt: string;
}

interface ServerMessage {
    id: number;
    userId: number;
    authorName: string;
    authorRole: 'owner' | 'admin' | 'member';
    content: string;
    createdAt: string;
    isYou: boolean;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TeamChatPage() {
    const params = useParams();
    const projectId = params.id as string;

    const [members, setMembers] = useState<TeamMember[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const lastIdRef = useRef<number | null>(null);

    const currentUser = members.find((m) => m.isYou);

    // ── Initial load: members + full message history ────────────────────────

    useEffect(() => {
        const load = async () => {
            try {
                const [teamRes, chatRes] = await Promise.all([
                    fetchWithAuth(`/projects/${projectId}/team`),
                    fetchWithAuth(`/projects/${projectId}/chat/messages`),
                ]);

                if (teamRes.ok) {
                    const team = await teamRes.json();
                    setMembers(
                        (team.members ?? []).map((m: any) => ({
                            id: m.id,
                            userId: m.userId,
                            name: m.name,
                            role: m.role,
                            isYou: m.isYou,
                        }))
                    );
                }

                if (chatRes.ok) {
                    const history: ServerMessage[] = await chatRes.json();
                    setMessages(
                        history.map((m) => ({
                            id: String(m.id),
                            userId: m.userId,
                            authorName: m.authorName,
                            authorRole: m.authorRole,
                            content: m.content,
                            createdAt: m.createdAt,
                        }))
                    );
                    lastIdRef.current =
                        history.length > 0
                            ? history[history.length - 1].id
                            : null;
                }
            } catch {
                /* show empty chat */
            } finally {
                setIsLoading(false);
            }
        };
        if (projectId) load();
    }, [projectId]);

    // ── Poll for new messages every 4s ──────────────────────────────────────

    useEffect(() => {
        if (isLoading) return;

        const interval = setInterval(async () => {
            try {
                const url = lastIdRef.current
                    ? `/projects/${projectId}/chat/messages?since=${lastIdRef.current}`
                    : `/projects/${projectId}/chat/messages`;

                const res = await fetchWithAuth(url);
                if (!res.ok) return;

                const fresh: ServerMessage[] = await res.json();
                if (fresh.length === 0) return;

                setMessages((prev) => {
                    // Defensive: skip ids we already have
                    const existing = new Set(prev.map((m) => m.id));
                    const additions = fresh
                        .filter((m) => !existing.has(String(m.id)))
                        .map((m) => ({
                            id: String(m.id),
                            userId: m.userId,
                            authorName: m.authorName,
                            authorRole: m.authorRole,
                            content: m.content,
                            createdAt: m.createdAt,
                        }));
                    return [...prev, ...additions];
                });

                lastIdRef.current = fresh[fresh.length - 1].id;
            } catch {
                /* ignore — next tick will retry */
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [projectId, isLoading]);

    // ── Auto-scroll on new messages ─────────────────────────────────────────

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // ── Send ────────────────────────────────────────────────────────────────

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isSending || !currentUser) return;

        setIsSending(true);
        setInput('');
        if (inputRef.current) inputRef.current.style.height = '48px';

        try {
            const res = await fetchWithAuth(
                `/projects/${projectId}/chat/messages`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: text }),
                }
            );

            if (!res.ok) throw new Error('Failed to send');

            const saved: ServerMessage = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: String(saved.id),
                    userId: saved.userId,
                    authorName: saved.authorName,
                    authorRole: saved.authorRole,
                    content: saved.content,
                    createdAt: saved.createdAt,
                },
            ]);

            lastIdRef.current = saved.id;
        } catch {
            // On failure, put the text back so the user can retry
            setInput(text);
        } finally {
            setIsSending(false);
        }
    };

    // ── Keyboard ────────────────────────────────────────────────────────────

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
    };

    // ── Copy ────────────────────────────────────────────────────────────────

    const handleCopy = async (content: string, id: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch { }
    };

    // ── Group messages by date for day separators ───────────────────────────

    const messagesWithSeparators = useMemo(() => {
        const out: Array<
            | { kind: 'separator'; label: string; key: string }
            | { kind: 'message'; message: ChatMessage }
        > = [];

        let lastDateLabel = '';

        messages.forEach((m) => {
            const dateLabel = getDateLabel(m.createdAt);
            if (dateLabel !== lastDateLabel) {
                out.push({
                    kind: 'separator',
                    label: dateLabel,
                    key: `sep-${m.id}`,
                });
                lastDateLabel = dateLabel;
            }
            out.push({ kind: 'message', message: m });
        });

        return out;
    }, [messages]);

    const isEmpty = !isLoading && messages.length === 0;

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
                                <div className="p-2 bg-emerald-500/15 rounded-xl text-emerald-400 shrink-0">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-xl font-bold text-foreground truncate">
                                        Team Chat
                                    </h1>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {members.length} member{members.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground shrink-0"
                            title="Members list"
                        >
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline ml-2">
                                {members.length}
                            </span>
                        </Button>
                    </div>

                    {/* Messages panel */}
                    <div className="flex-1 min-h-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        Loading chat...
                                    </p>
                                </div>
                            </div>
                        ) : isEmpty ? (
                            <EmptyState />
                        ) : (
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto px-4 sm:px-6 py-6"
                            >
                                {messagesWithSeparators.map((item, idx) => {
                                    if (item.kind === 'separator') {
                                        return (
                                            <DaySeparator
                                                key={item.key}
                                                label={item.label}
                                            />
                                        );
                                    }

                                    const msg = item.message;
                                    const isYou = msg.userId === currentUser?.userId;

                                    const prev = getPreviousMessage(messages, msg);
                                    const showHeader =
                                        !prev ||
                                        prev.userId !== msg.userId ||
                                        !isWithinFiveMinutes(prev.createdAt, msg.createdAt);

                                    return (
                                        <MessageRow
                                            key={msg.id}
                                            message={msg}
                                            isYou={isYou}
                                            showHeader={showHeader}
                                            copiedId={copiedId}
                                            onCopy={handleCopy}
                                            isLast={idx === messagesWithSeparators.length - 1}
                                        />
                                    );
                                })}
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
                                    placeholder="Message your team..."
                                    rows={1}
                                    disabled={isSending}
                                    className="flex-1 resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60 min-h-[48px] max-h-[180px] py-2.5 px-2"
                                    style={{ height: '48px' }}
                                />

                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isSending}
                                    className="shrink-0"
                                    size="sm"
                                >
                                    {isSending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send
                                        </>
                                    )}
                                </Button>
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
                                    {messages.length} message{messages.length !== 1 ? 's' : ''}
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

function EmptyState() {
    return (
        <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-md w-full text-center">
                <div className="inline-flex p-4 bg-emerald-500/15 border-2 border-emerald-500/40 rounded-2xl mb-5">
                    <MessageSquare className="w-11 h-11 text-emerald-400" />
                </div>

                <h2 className="text-3xl font-bold text-foreground mb-3">
                    Start the conversation
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                    No messages yet. Say hi to your team, share an update, or
                    kick off a discussion.
                </p>
            </div>
        </div>
    );
}

// ─── Day separator ──────────────────────────────────────────────────────────

function DaySeparator({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 my-6 first:mt-0">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground px-2">
                {label}
            </span>
            <div className="flex-1 h-px bg-border" />
        </div>
    );
}

// ─── Message row ────────────────────────────────────────────────────────────

function MessageRow({
    message,
    isYou,
    showHeader,
    copiedId,
    onCopy,
    isLast,
}: {
    message: ChatMessage;
    isYou: boolean;
    showHeader: boolean;
    copiedId: string | null;
    onCopy: (content: string, id: string) => void;
    isLast: boolean;
}) {
    const time = new Date(message.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const avatar = getAvatarForUser(message.authorName, message.userId);
    const roleIcon = getRoleIcon(message.authorRole);

    return (
        <div
            className={`flex gap-3 ${isYou ? 'flex-row-reverse' : ''} ${showHeader ? (isLast ? '' : 'mt-4') : 'mt-1'
                } group`}
        >
            <div
                className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border font-semibold text-sm ${avatar.bgClass} ${showHeader ? '' : 'opacity-0'
                    }`}
            >
                {avatar.initial}
            </div>

            <div
                className={`flex-1 min-w-0 max-w-[75%] ${isYou ? 'flex flex-col items-end' : ''
                    }`}
            >
                {showHeader && (
                    <div
                        className={`flex items-center gap-2 mb-1.5 px-1 ${isYou ? 'flex-row-reverse' : ''
                            }`}
                    >
                        <span className="text-sm font-semibold text-foreground">
                            {isYou ? 'You' : message.authorName}
                        </span>
                        {message.authorRole !== 'member' && (
                            <span
                                className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wide font-medium ${message.authorRole === 'owner'
                                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                                        : 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                                    }`}
                            >
                                {roleIcon}
                                {message.authorRole}
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                            {time}
                        </span>
                    </div>
                )}

                <div className="flex items-end gap-2 max-w-full">
                    <div
                        className={`inline-block rounded-2xl px-4 py-2.5 text-base leading-relaxed whitespace-pre-wrap break-words ${isYou
                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                : 'bg-secondary/60 text-foreground border border-border rounded-tl-sm'
                            }`}
                    >
                        {message.content}
                    </div>

                    <button
                        onClick={() => onCopy(message.content, message.id)}
                        className={`shrink-0 mb-1 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-all opacity-0 group-hover:opacity-100 ${isYou ? 'order-first' : ''
                            }`}
                        title="Copy message"
                    >
                        {copiedId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDateLabel(iso: string): string {
    const date = new Date(iso);
    const now = new Date();

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
}

function getPreviousMessage(
    all: ChatMessage[],
    current: ChatMessage
): ChatMessage | null {
    const idx = all.findIndex((m) => m.id === current.id);
    return idx > 0 ? all[idx - 1] : null;
}

function isWithinFiveMinutes(a: string, b: string): boolean {
    const diff = Math.abs(new Date(b).getTime() - new Date(a).getTime());
    return diff < 5 * 60 * 1000;
}

const AVATAR_PALETTE = [
    'bg-blue-500/15 border-blue-500/30 text-blue-400',
    'bg-purple-500/15 border-purple-500/30 text-purple-400',
    'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    'bg-orange-500/15 border-orange-500/30 text-orange-400',
    'bg-pink-500/15 border-pink-500/30 text-pink-400',
    'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
    'bg-rose-500/15 border-rose-500/30 text-rose-400',
    'bg-amber-500/15 border-amber-500/30 text-amber-400',
];

function getAvatarForUser(name: string, userId: number) {
    const initial = name.charAt(0).toUpperCase() || '?';
    const bgClass = AVATAR_PALETTE[Math.abs(userId) % AVATAR_PALETTE.length];
    return { initial, bgClass };
}

function getRoleIcon(role: string) {
    if (role === 'owner') return <Crown className="w-3 h-3" />;
    if (role === 'admin') return <Shield className="w-3 h-3" />;
    return <UserIcon className="w-3 h-3" />;
}