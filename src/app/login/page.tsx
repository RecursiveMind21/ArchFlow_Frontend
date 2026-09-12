'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';

export default function LoginPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [focused, setFocused] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type } = e.target;
        const value = type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : e.target.value;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login({ email: formData.email, password: formData.password });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message ?? 'Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = formData.email && formData.password;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            {/* Background decorative elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                            <span className="text-primary-foreground font-bold">A</span>
                        </div>
                        <span className="font-bold text-lg">ArchFlow</span>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4 text-balance">
                            Welcome Back
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Sign in to your ArchFlow account and continue building.
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive animate-in fade-in duration-300">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-700" style={{ animationDelay: '100ms' }}>

                        {/* Email Input */}
                        <div className="relative group">
                            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                            <div className={`relative transition-all duration-300 ${focused === 'email' ? 'scale-105' : ''}`}>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-foreground">Password</label>
                                <Link href="#" className="text-xs text-primary hover:underline font-medium">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className={`relative transition-all duration-300 ${focused === 'password' ? 'scale-105' : ''}`}>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <label className="group flex items-center gap-3 cursor-pointer animate-in fade-in duration-500" style={{ animationDelay: '200ms' }}>
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="w-5 h-5 accent-primary cursor-pointer rounded"
                            />
                            <span className="text-sm text-muted-foreground">Remember me for 30 days</span>
                        </label>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            size="lg"
                            className="w-full text-base font-medium animate-in fade-in duration-500"
                            style={{ animationDelay: '300ms' }}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
