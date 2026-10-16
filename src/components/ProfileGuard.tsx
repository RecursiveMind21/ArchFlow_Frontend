'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Central auth + profile redirect logic.
 *
 * Rules:
 *   Logged out:
 *     - Can visit:  /, /login, /register
 *     - On any other route → redirect to /login
 *
 *   Logged in, profile NOT completed:
 *     - Can visit:  /, /profile/setup
 *     - Cannot visit: /login, /register → redirect to /dashboard
 *     - Anywhere else → redirect to /profile/setup
 *
 *   Logged in, profile completed:
 *     - Cannot visit: /login, /register → redirect to /dashboard
 *     - Cannot visit: /profile/setup → redirect to /dashboard
 *     - Everything else → allowed
 */

const ALWAYS_PUBLIC = ['/'];                 // visible to everyone
const GUEST_ONLY = ['/login', '/register'];  // visible only to logged-out users
const PROFILE_SETUP = '/profile/setup';
const LOGIN = '/login';
const DASHBOARD = '/dashboard';

export function ProfileGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();

    const isAlwaysPublic = ALWAYS_PUBLIC.includes(pathname);
    const isGuestOnly = GUEST_ONLY.includes(pathname);
    const isProfileSetup = pathname === PROFILE_SETUP;

    // ── Compute the redirect target ─────────────────────────────────────
    let redirectTo: string | null = null;

    if (!loading) {
        if (!user) {
            // Logged out
            if (!isAlwaysPublic && !isGuestOnly) {
                redirectTo = LOGIN;
            }
        } else if (!user.profileCompleted) {
            // Logged in but profile incomplete
            if (isGuestOnly) {
                redirectTo = DASHBOARD;   // no point showing auth forms
            } else if (!isAlwaysPublic && !isProfileSetup) {
                redirectTo = PROFILE_SETUP;
            }
        } else {
            // Logged in, profile complete
            if (isGuestOnly || isProfileSetup) {
                redirectTo = DASHBOARD;
            }
        }
    }

    useEffect(() => {
        if (redirectTo && redirectTo !== pathname) {
            router.replace(redirectTo);
        }
    }, [redirectTo, pathname, router]);

    // Show spinner while loading or while a redirect is pending
    if (loading || (redirectTo && redirectTo !== pathname)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}