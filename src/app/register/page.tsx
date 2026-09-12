'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // ✅ App Router import
import { register } from '@/lib/api/auth';

// Role options: label shown to user + value sent to Spring enum
const ROLES = [
    { label: 'Junior Developer', value: 'JUNIOR_DEVELOPER' }, // ✅ match your Java Role enum
    { label: 'Student', value: 'STUDENT' },
];

export default function RegisterPage() {
    const router = useRouter(); // ✅ hook, not module-level import

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: '',
        agreeToTerms: false,
    });

    const [focused, setFocused] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            const res = await register({
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                tandc: formData.agreeToTerms,
            });
            localStorage.setItem('pendingEmail', res.email);
            router.push('/verify-otp');
        } catch (err: any) {
            setError(err.message ?? 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid =
        formData.fullName &&
        formData.email &&
        formData.password &&
        formData.role &&
        formData.agreeToTerms;

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
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Log in
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                    <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4 text-balance">
                            Get Started
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Join ArchFlow and structure your development workflow with AI.
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive animate-in fade-in duration-300">
                            {error}
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700" style={{ animationDelay: '100ms' }}>

                        {/* Full Name Input */}
                        <div className="relative group">
                            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                            <div className={`relative transition-all duration-300 ${focused === 'fullName' ? 'scale-105' : ''}`}>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('fullName')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                </div>
                            </div>
                        </div>

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
                            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
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

                        {/* Role Selection — ✅ value = enum, label = display text */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-4">Select Your Role</label>
                            <div className="space-y-3">
                                {ROLES.map(({ label, value }, index) => (
                                    <label
                                        key={value}
                                        className={`group relative flex items-center p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-left ${formData.role === value
                                                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                                                : 'bg-card hover:bg-secondary/50'
                                            }`}
                                        style={{ animationDelay: `${200 + index * 100}ms` }}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={value}
                                            checked={formData.role === value}
                                            onChange={handleChange}
                                            className="w-4 h-4 accent-primary cursor-pointer"
                                        />
                                        <span className="ml-3 font-medium text-foreground flex items-center gap-2">
                                            {label}
                                            {formData.role === value && (
                                                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            )}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <label className="group flex items-start gap-3 cursor-pointer animate-in fade-in duration-500" style={{ animationDelay: '400ms' }}>
                            <div className="relative mt-1">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-primary cursor-pointer rounded"
                                />
                            </div>
                            <span className="text-sm text-muted-foreground leading-relaxed">
                                I agree to the{' '}
                                <a href="#" className="text-primary hover:underline font-medium">Terms and Conditions</a>
                                {' '}and{' '}
                                <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
                            </span>
                        </label>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            size="lg"
                            className="w-full text-base font-medium animate-in fade-in duration-500"
                            style={{ animationDelay: '500ms' }}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
