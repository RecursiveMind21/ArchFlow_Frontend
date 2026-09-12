'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

interface Role {
    id: string;
    roleName: string;
    roleDescription: string;
}

interface Feature {
    id: string;
    featureName: string;
    featureDescription: string;
    featurePriority: 'MUST_HAVE' | 'SHOULD_HAVE' | 'NICE_TO_HAVE'; 
}

interface FormData {
    projectName: string;
    projectCategory: string;
    projectSummary: string;
    userType: string;
    userScale: string;
    roles: Role[];
    problemStatement: string;
    currentSolution: string;
    existingSolutionInsufficient: string;
    features: Feature[];
    platform: string;
    supportedDevice: string;
    expectedTimeline: string;
    budget: string;
    expectedTraffic: string;
    dataSensitivity: string;
    complianceNeeds: string;
}

const steps = ['Basics', 'Users & Roles', 'Problem', 'Features', 'Technical'];

export default function CreateProjectPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        projectName: '',
        projectCategory: '',
        projectSummary: '',
        userType: '',
        userScale: '',
        roles: [{ id: '1', roleName: '', roleDescription: '' }],
        problemStatement: '',
        currentSolution: '',
        existingSolutionInsufficient: '',
        features: [{ id: '1', featureName: '', featureDescription: '', featurePriority: 'MUST_HAVE' }], 
        platform: '',
        supportedDevice: '',
        expectedTimeline: '',
        budget: '',
        expectedTraffic: '',
        dataSensitivity: '',
        complianceNeeds: '',
    });

    const update = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const updateRole = (id: string, field: keyof Omit<Role, 'id'>, value: string) => {
        setFormData((prev) => ({
            ...prev,
            roles: prev.roles.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
        }));
    };
    const addRole = () => {
        if (formData.roles.length < 8)
            setFormData((prev) => ({
                ...prev,
                roles: [...prev.roles, { id: Date.now().toString(), roleName: '', roleDescription: '' }],
            }));
    };
    const removeRole = (id: string) => {
        if (formData.roles.length > 1)
            setFormData((prev) => ({ ...prev, roles: prev.roles.filter((r) => r.id !== id) }));
    };

    const updateFeature = (id: string, field: keyof Omit<Feature, 'id'>, value: string) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
        }));
    };
    const addFeature = () => {
        if (formData.features.length < 10)
            setFormData((prev) => ({
                ...prev,
                features: [
                    ...prev.features,
                    { id: Date.now().toString(), featureName: '', featureDescription: '', featurePriority: 'MUST_HAVE' },
                ],
            }));
    };
    const removeFeature = (id: string) => {
        if (formData.features.length > 1)
            setFormData((prev) => ({ ...prev, features: prev.features.filter((f) => f.id !== id) }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return !!(formData.projectName && formData.projectCategory && formData.projectSummary);
            case 1: return !!(formData.userType && formData.userScale && formData.roles.every((r) => r.roleName));
            case 2: return !!(formData.problemStatement && formData.currentSolution && formData.existingSolutionInsufficient);
            case 3: return formData.features.every((f) => f.featureName);
            case 4: return !!(formData.platform && formData.supportedDevice && formData.expectedTimeline && formData.budget && formData.expectedTraffic && formData.dataSensitivity);
            default: return true;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const payload = {
            projectName: formData.projectName,
            projectCategory: formData.projectCategory,
            projectSummary: formData.projectSummary,
            userType: formData.userType,
            userScale: formData.userScale,
            roles: formData.roles.map(({ roleName, roleDescription }) => ({ roleName, roleDescription })),
            problemStatement: formData.problemStatement,
            currentSolution: formData.currentSolution,
            existingSolutionInsufficient: formData.existingSolutionInsufficient,
            features: formData.features.map(({ featureName, featureDescription, featurePriority }) => ({ featureName, featureDescription, featurePriority })),
            platform: formData.platform,
            supportedDevice: formData.supportedDevice,
            expectedTimeline: formData.expectedTimeline,
            budget: formData.budget,
            expectedTraffic: formData.expectedTraffic,
            dataSensitivity: formData.dataSensitivity,
            complianceNeeds: formData.complianceNeeds || null,
        };

        try {
            const res = await fetchWithAuth('/projects', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? 'Failed to create project');
            }

            const data = await res.json();
            router.push(`/projects/${data.projectId}/chat`);
        } catch (err: any) {
            setError(err.message ?? 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorityStyles: Record<string, string> = {
        MUST_HAVE: 'bg-red-500/20 text-red-400 border-red-500/30',
        SHOULD_HAVE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        NICE_TO_HAVE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    
    return (
        <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-3xl mx-auto">

                    <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4 text-balance">
                            Create Project
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Build your project architecture step by step with AI-powered guidance.
                        </p>
                    </div>

                    <div className="mb-12 animate-in fade-in duration-700" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center mb-4">
                            {steps.map((step, idx) => (
                                <div key={step} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${idx < currentStep ? 'bg-primary text-primary-foreground' : idx === currentStep ? 'bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110' : 'bg-muted text-muted-foreground border-2 border-border'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className={`text-xs mt-2 hidden sm:block transition-colors duration-300 ${idx <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                            {step}
                                        </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={`h-0.5 flex-1 mx-2 transition-all duration-500 ${idx < currentStep ? 'bg-primary' : 'bg-border'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive animate-in fade-in duration-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* ── STEP 1 — Basics ── */}
                        {currentStep === 0 && (
                            <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Project Name</label>
                                    <input
                                        type="text"
                                        value={formData.projectName}
                                        onChange={(e) => update('projectName', e.target.value)}
                                        placeholder="e.g. ArchFlow Dashboard"
                                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Project Category</label>
                                    <select
                                        value={formData.projectCategory}
                                        onChange={(e) => update('projectCategory', e.target.value)}
                                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                    >
                                        <option value="">Select a category</option>
                                        {/* ✅ Matches ProjectCategory.java */}
                                        <option value="BUSINESS">Business</option>
                                        <option value="EDUCATION">Education</option>
                                        <option value="SOCIAL">Social</option>
                                        <option value="FINANCE">Finance</option>
                                        <option value="HEALTHCARE">Healthcare</option>
                                        <option value="PRODUCTIVITY">Productivity</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Project Summary</label>
                                    <textarea
                                        value={formData.projectSummary}
                                        onChange={(e) => update('projectSummary', e.target.value)}
                                        placeholder="Brief description of what this project does and its main goal..."
                                        rows={5}
                                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2 — Users & Roles ── */}
                        {currentStep === 1 && (
                            <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-3">User Type</label>
                                    <div className="space-y-2">
                                        {[
                                            // ✅ Matches UserType.java
                                            { value: 'GENERAL_USERS', label: 'General Users', sub: 'Regular end users of the product' },
                                            { value: 'BUSINESSES', label: 'Businesses', sub: 'Companies and organizations' },
                                            { value: 'ADMINS', label: 'Admins', sub: 'Platform administrators' },
                                            { value: 'DEVELOPERS', label: 'Developers', sub: 'Technical users and integrators' },
                                        ].map((opt) => (
                                            <label key={opt.value} className={`flex items-start p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 ${formData.userType === opt.value ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20' : 'hover:bg-secondary/50'}`}>
                                                <input
                                                    type="radio"
                                                    name="userType"
                                                    value={opt.value}
                                                    checked={formData.userType === opt.value}
                                                    onChange={(e) => update('userType', e.target.value)}
                                                    className="w-4 h-4 accent-primary cursor-pointer mt-0.5"
                                                />
                                                <div className="ml-3">
                                                    <span className="font-medium text-foreground block">{opt.label}</span>
                                                    <span className="text-sm text-muted-foreground">{opt.sub}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-3">User Scale</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[
                                            // ✅ Matches UserScale.java (SMALL, MEDIUM, LARGE, MASSIVE)
                                            { value: 'SMALL', label: 'Small', sub: '1 – 100 users' },
                                            { value: 'MEDIUM', label: 'Medium', sub: '100 – 10,000 users' },
                                            { value: 'LARGE', label: 'Large', sub: '10,000 – 1,000,000 users' },
                                            { value: 'MASSIVE', label: 'Massive', sub: '1,000,000+ users' },
                                        ].map((opt) => (
                                            <label key={opt.value} className={`flex items-start p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 ${formData.userScale === opt.value ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20' : 'hover:bg-secondary/50'}`}>
                                                <input
                                                    type="radio"
                                                    name="userScale"
                                                    value={opt.value}
                                                    checked={formData.userScale === opt.value}
                                                    onChange={(e) => update('userScale', e.target.value)}
                                                    className="w-4 h-4 accent-primary cursor-pointer mt-0.5"
                                                />
                                                <div className="ml-3">
                                                    <span className="font-medium text-foreground block">{opt.label}</span>
                                                    <span className="text-sm text-muted-foreground">{opt.sub}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-foreground">Define User Roles</label>
                                        {formData.roles.length < 8 && (
                                            <button type="button" onClick={addRole} className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                                                <Plus className="w-4 h-4" /> Add Role
                                            </button>
                                        )}
                                    </div>
                                    {formData.roles.length >= 8 && (
                                        <p className="text-xs text-muted-foreground mb-2">Maximum 8 roles reached</p>
                                    )}
                                    <div className="space-y-3">
                                        {formData.roles.map((role) => (
                                            <div key={role.id} className="p-4 bg-card border border-border rounded-lg animate-in fade-in slide-in-from-left duration-300">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        value={role.roleName}
                                                        onChange={(e) => updateRole(role.id, 'roleName', e.target.value)}
                                                        placeholder="Role Name (e.g. Admin)"
                                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={role.roleDescription}
                                                        onChange={(e) => updateRole(role.id, 'roleDescription', e.target.value)}
                                                        placeholder="Role Description"
                                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm"
                                                    />
                                                </div>
                                                {formData.roles.length > 1 && (
                                                    <button type="button" onClick={() => removeRole(role.id)} className="mt-2 text-xs text-destructive hover:bg-destructive/10 rounded-md px-2 py-1 flex items-center gap-1 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" /> Remove
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3 — Problem & Solution ── */}
                        {currentStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                                {[
                                    { field: 'problemStatement', label: 'What problem does this project solve?', placeholder: 'Describe the core problem your users face...', rows: 5 },
                                    { field: 'currentSolution', label: 'What is the current / existing solution?', placeholder: 'How do users currently solve this problem...', rows: 4 },
                                    { field: 'existingSolutionInsufficient', label: 'Why is the existing solution not enough?', placeholder: 'What gaps or frustrations does the current solution have...', rows: 4 },
                                ].map(({ field, label, placeholder, rows }) => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
                                        <textarea
                                            value={(formData as any)[field]}
                                            onChange={(e) => update(field as keyof FormData, e.target.value)}
                                            placeholder={placeholder}
                                            rows={rows}
                                            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 resize-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── STEP 4 — Features ── */}
                        {currentStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-right duration-500 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-foreground">Key Features</label>
                                    {formData.features.length < 10 && (
                                        <button type="button" onClick={addFeature} className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                                            <Plus className="w-4 h-4" /> Add Feature
                                        </button>
                                    )}
                                </div>
                                {formData.features.map((feature, index) => (
                                    <div key={feature.id} className="p-6 bg-card border border-border rounded-2xl space-y-3 animate-in fade-in zoom-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-muted-foreground">Feature #{index + 1}</span>
                                            {formData.features.length > 1 && (
                                                <button type="button" onClick={() => removeFeature(feature.id)} className="text-xs text-destructive hover:bg-destructive/10 rounded-md px-2 py-1 flex items-center gap-1 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            value={feature.featureName}
                                            onChange={(e) => updateFeature(feature.id, 'featureName', e.target.value)}
                                            placeholder="Feature Name (e.g. User Authentication)"
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm"
                                        />
                                        <textarea
                                            value={feature.featureDescription}
                                            onChange={(e) => updateFeature(feature.id, 'featureDescription', e.target.value)}
                                            placeholder="What does this feature do and why is it needed?"
                                            rows={2}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm resize-none"
                                        />
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground mb-2 block">Priority</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {/* ✅ Matches FeaturePriority.java */}
                                                {(['MUST_HAVE', 'SHOULD_HAVE', 'NICE_TO_HAVE'] as const).map((p) => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => updateFeature(feature.id, 'featurePriority', p)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${feature.featurePriority === p ? priorityStyles[p] : 'bg-transparent border-border text-muted-foreground hover:bg-secondary/50'}`}
                                                    >
                                                        {p.replace('_', ' ')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── STEP 5 — Technical ── */}
                        {currentStep === 4 && (
                            <div className="animate-in fade-in slide-in-from-right duration-500">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[
                                        {
                                            field: 'platform', label: 'Platform',
                                            // ✅ Matches Platform.java
                                            options: [
                                                ['WEB_APPLICATION', 'Web Application'],
                                                ['MOBILE_APPLICATION', 'Mobile Application'],
                                                ['BACKEND_API_ONLY', 'Backend API Only'],
                                                ['DESKTOP_APPLICATION', 'Desktop Application'],
                                            ],
                                        },
                                        {
                                            field: 'supportedDevice', label: 'Supported Devices',
                                            // ✅ Matches SupportedDevice.java
                                            options: [
                                                ['DESKTOP', 'Desktop'],
                                                ['TABLET', 'Tablet'],
                                                ['MOBILE', 'Mobile'],
                                            ],
                                        },
                                        {
                                            field: 'expectedTimeline', label: 'Expected Timeline',
                                            // ✅ Matches ExpectedTimeline.java
                                            options: [
                                                ['ONE_TO_THREE_MONTHS', '1 – 3 Months'],
                                                ['THREE_TO_SIX_MONTHS', '3 – 6 Months'],
                                                ['SIX_TO_TWELVE_MONTHS', '6 – 12 Months'],
                                                ['MORE_THAN_TWELVE_MONTHS', '1+ Years'],
                                            ],
                                        },
                                        {
                                            field: 'budget', label: 'Budget Range',
                                            // ✅ Matches BudgetRange.java
                                            options: [
                                                ['LEARNING', 'Learning / Free'],
                                                ['LOW', 'Low Budget'],
                                                ['MEDIUM', 'Medium Budget'],
                                                ['HIGH', 'High Budget'],
                                            ],
                                        },
                                        {
                                            field: 'expectedTraffic', label: 'Expected Traffic',
                                            // ✅ Matches ExpectedTraffic.java
                                            options: [
                                                ['LOW', 'Low (< 1K/day)'],
                                                ['MEDIUM', 'Medium (1K – 100K/day)'],
                                                ['HIGH', 'High (100K – 1M/day)'],
                                                ['VERY_HIGH', 'Very High (1M+/day)'],
                                            ],
                                        },
                                        {
                                            field: 'dataSensitivity', label: 'Data Sensitivity',
                                            // ✅ Matches DataSensitivity.java
                                            options: [
                                                ['NO_SENSITIVE_DATA', 'No Sensitive Data'],
                                                ['PERSONAL_USER_DATA', 'Personal User Data'],
                                                ['FINANCIAL_DATA', 'Financial Data'],
                                                ['HEALTH_DATA', 'Health Data'],
                                            ],
                                        },
                                    ].map(({ field, label, options }) => (
                                        <div key={field}>
                                            <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
                                            <select
                                                value={(formData as any)[field]}
                                                onChange={(e) => update(field as keyof FormData, e.target.value)}
                                                className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                            >
                                                <option value="">Select an option</option>
                                                {options.map(([val, lbl]) => (
                                                    <option key={val} value={val}>{lbl}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}

                                    {/* Compliance — full width */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Compliance Needs <span className="text-muted-foreground">(Optional)</span>
                                        </label>
                                        <select
                                            value={formData.complianceNeeds}
                                            onChange={(e) => update('complianceNeeds', e.target.value)}
                                            className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                        >
                                            {/* ✅ Matches ComplianceType.java — only GDPR, HIPAA, PCI_DSS, NONE */}
                                            <option value="NONE">None Required</option>
                                            <option value="GDPR">GDPR</option>
                                            <option value="HIPAA">HIPAA</option>
                                            <option value="PCI_DSS">PCI-DSS</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Navigation ── */}
                        <div className="flex items-center justify-between gap-4 pt-8 animate-in fade-in duration-500" style={{ animationDelay: '200ms' }}>
                            <Button
                                type="button"
                                onClick={() => {
                                    if (currentStep === 0) {
                                        router.push('/dashboard');
                                    } else {
                                        setCurrentStep((s) => s - 1);
                                    }
                                }}
                                variant="outline"
                                size="lg"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {currentStep === 0 ? 'Back to Dashboard' : 'Back'}
                            </Button>

                            {currentStep < steps.length - 1 ? (
                                <Button
                                    type="button"
                                    onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
                                    disabled={!canProceed()}
                                    size="lg"
                                    className="flex items-center gap-2"
                                >
                                    Next Step
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={!canProceed() || isSubmitting}
                                    size="lg"
                                    className="flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Creating Project...' : 'Create Project'}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
