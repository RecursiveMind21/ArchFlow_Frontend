'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, ChevronDown, Bell, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/api/auth';

function getInitials(email: string) {
    return email.split('@')[0].slice(0, 2).toUpperCase();
}

function RoleBadge({ role }: { role: string }) {
    const label =
        role === 'JUNIOR_DEVELOPER'
            ? 'Junior Dev'
            : role.charAt(0) + role.slice(1).toLowerCase();
    return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
            {label}
        </span>
    );
}

export default function Navbar() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = async () => {
        setDropdownOpen(false);
        await logout();
        router.push('/login');
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">A</span>
                    </div>
                    <span className="font-bold text-lg">ArchFlow</span>
                </Link>

                {/* Right side */}
                {loading ? (
                    <div className="w-24 h-8 bg-muted rounded-lg animate-pulse" />

                ) : user ? (
                    // ─── AUTHENTICATED ── matches dashboard header style ───────
                    <div className="flex items-center gap-2">

                        {/* Dashboard Button */}
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="text-sm">
                                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                                Dashboard
                            </Button>
                        </Link>

                        {/* Bell */}
                        <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                            <Bell className="w-5 h-5 text-foreground" />
                        </button>

                        {/* Settings */}
                        <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                            <Settings className="w-5 h-5 text-foreground" />
                        </button>

                        {/* Avatar + Dropdown */}
                        <div className="relative ml-1">
                            <button
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className="flex items-center gap-1.5 focus:outline-none"
                            >
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/30 transition-colors">
                                    <span className="text-sm font-semibold text-primary">
                                        {getInitials(user.email)}
                                    </span>
                                </div>
                                <ChevronDown
                                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50"
                                    onMouseLeave={() => setDropdownOpen(false)}
                                >
                                    {/* User info */}
                                    <div className="px-3 py-2 border-b border-border">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {user.email.split('@')[0]}
                                        </p>
                                        <div className="mt-0.5">
                                            <RoleBadge role={user.role} />
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mt-1">
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Dashboard */}
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>

                                    {/* Settings */}
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Link>

                                    <div className="border-t border-border mt-1 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                ) : (
                    // ─── UNAUTHENTICATED ────────────────────────────────────────
                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="text-sm">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm" className="text-sm">
                                Get Started Free
                            </Button>
                        </Link>
                    </div>
                )}

            </div>
        </nav>
    );
}
