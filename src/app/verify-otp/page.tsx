'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyOtp, resendOtp } from '@/lib/api/auth';

export default function VerifyOTPPage() {
    const router = useRouter();

    const [otp, setOtp] = useState(['', '', '', '']);
    const [email, setEmail] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendCountdown, setResendCountdown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // ✅ Read pending email; redirect if missing
    useEffect(() => {
        const stored = localStorage.getItem('pendingEmail');
        if (!stored) {
            router.replace('/register');
            return;
        }
        setEmail(stored);
    }, [router]);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError(null);
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < 3) inputRefs.current[index + 1]?.focus();
    };

    // ✅ Paste support — paste "1234" and auto-fill all boxes
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (!pasted) return;
        e.preventDefault();
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length, 3)]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 4 || !email) return;

        setIsVerifying(true);
        setError(null);

        try {
            await verifyOtp({ email, otp: otpCode });
            localStorage.removeItem('pendingEmail');
            router.push('/dashboard'); // or /complete-profile if profileCompleted = false
        } catch (err: any) {
            setError(err.message ?? 'Invalid or expired OTP. Please try again.');
            setOtp(['', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email || resendCountdown > 0) return;

        setOtp(['', '', '', '']);
        setError(null);
        setResendCountdown(60);
        inputRefs.current[0]?.focus();

        const interval = setInterval(() => {
            setResendCountdown((prev) => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);

        try {
            await resendOtp(email);
        } catch (err: any) {
            setError('Failed to resend OTP. Please try again.');
        }
    };

    const isOtpComplete = otp.every((digit) => digit !== '');

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20">
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
                        <Link href="/register" className="text-primary hover:underline font-medium">
                            Back to registration
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4 text-balance">
                            Verify Email
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Enter the 4-digit code sent to your email address.
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive animate-in fade-in duration-300">
                            {error}
                        </div>
                    )}

                    {/* OTP Verification Form */}
                    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-700" style={{ animationDelay: '100ms' }}>

                        {/* OTP Input Fields */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-6">Verification Code</label>
                            <div className="flex justify-center gap-4">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined} // ✅ paste on first box
                                        placeholder="0"
                                        className="w-14 h-14 sm:w-16 sm:h-16 px-0 py-2 bg-card border border-border rounded-lg text-foreground text-center text-2xl font-bold placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 animate-in fade-in zoom-in"
                                        style={{ animationDelay: `${150 + index * 50}ms` }}
                                        autoComplete="off"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Verify Button */}
                        <Button
                            type="submit"
                            disabled={!isOtpComplete || isVerifying}
                            size="lg"
                            className="w-full text-base font-medium animate-in fade-in duration-500"
                            style={{ animationDelay: '350ms' }}
                        >
                            {isVerifying ? 'Verifying...' : 'Verify Email'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>

                        {/* Resend OTP Section */}
                        <div className="text-center text-sm text-muted-foreground animate-in fade-in duration-500" style={{ animationDelay: '450ms' }}>
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resendCountdown > 0}
                                className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            >
                                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend'}
                            </button>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-4 text-center text-sm text-muted-foreground animate-in fade-in duration-500" style={{ animationDelay: '500ms' }}>
                            Code sent to{' '}
                            <span className="font-medium text-foreground">
                                {email ?? '…'}
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
