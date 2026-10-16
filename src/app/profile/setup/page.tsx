'use client';

import React, { useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    GraduationCap,
    Code2,
    Target,
    Bug,
    Plus,
    Trash2,
    CheckCircle2,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';

// ─── Enum option arrays — verified ──────────────────────────────────────────

const EDUCATION_OPTIONS = [
    { value: 'DIPLOMA', label: 'Diploma' },
    { value: 'UNDERGRADUATE', label: 'Undergraduate' },
    { value: 'POSTGRADUATE', label: 'Postgraduate' },
    { value: 'SELF_TAUGHT', label: 'Self-taught' },
];

const BACKGROUND_OPTIONS = [
    { value: 'CS_IT', label: 'Computer Science / IT' },
    { value: 'NON_CS', label: 'Non-CS background' },
    { value: 'NO_FORMAL_DEGREE', label: 'No formal degree' },
];

const CORE_SUBJECT_OPTIONS = [
    { value: 'DATA_STRUCTURES', label: 'Data Structures' },
    { value: 'OOP', label: 'Object-Oriented Programming' },
    { value: 'DBMS', label: 'DBMS' },
    { value: 'OPERATING_SYSTEM', label: 'Operating Systems' },
    { value: 'COMPUTER_NETWORKS', label: 'Computer Networks' },
];

const PRIMARY_GOAL_OPTIONS = [
    { value: 'LEARNING_FUNDAMENTALS', label: 'Learning fundamentals' },
    { value: 'BUILDING_REAL_WORLD_PROJECT', label: 'Building a real-world project' },
    { value: 'INTERNSHIP_PREPARATION', label: 'Internship preparation' },
    { value: 'JOB_INTERVIEW_PREPARATION', label: 'Job interview preparation' },
    { value: 'STARTUP', label: 'Building a startup' },
    { value: 'COLLEGE_PROJECT', label: 'College project' },
];

const TIMELINE_OPTIONS = [
    { value: 'ONE_TO_TWO_WEEKS', label: '1–2 weeks' },
    { value: 'ONE_MONTH', label: '1 month' },
    { value: 'THREE_MONTHS', label: '3 months' },
    { value: 'SIX_PLUS_MONTHS', label: '6+ months' },
];

const FRONTEND_OPTIONS = [
    { value: 'FLUTTER', label: 'Flutter' },
    { value: 'REACT', label: 'React' },
    { value: 'ANGULAR', label: 'Angular' },
    { value: 'VUE', label: 'Vue' },
    { value: 'HTML_CSS_JS', label: 'HTML / CSS / JS' },
    { value: 'OTHER', label: 'Other' },
];

const BACKEND_OPTIONS = [
    { value: 'NODE_JS', label: 'Node.js' },
    { value: 'DJANGO', label: 'Django' },
    { value: 'SPRING_BOOT', label: 'Spring Boot' },
    { value: 'FIREBASE', label: 'Firebase' },
    { value: 'CSHARP', label: 'C# / .NET' },
    { value: 'OTHER', label: 'Other' },
];

const API_KNOWLEDGE_OPTIONS = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
];

const ARCHITECTURE_OPTIONS = [
    { value: 'NEVER_WORKED', label: 'Never worked with architecture' },
    { value: 'MVC', label: 'MVC' },
    { value: 'LAYERED_ARCH', label: 'Layered architecture' },
    { value: 'CLEAN_ARCH', label: 'Clean architecture' },
    { value: 'MICROSERVICES', label: 'Microservices' },
];

const CONCEPT_OPTIONS = [
    { value: 'MVC', label: 'MVC' },
    { value: 'REPOSITORY_PATTERN', label: 'Repository pattern' },
    { value: 'DTOS', label: 'DTOs' },
    { value: 'SOLID_PRINCIPLES', label: 'SOLID principles' },
    { value: 'DESIGN_PATTERNS', label: 'Design patterns' },
];

const DATABASE_TYPE_OPTIONS = [
    { value: 'RELATIONAL', label: 'Relational (SQL)' },
    { value: 'NOSQL', label: 'NoSQL' },
    { value: 'BOTH', label: 'Both' },
];

const DATABASE_NAME_OPTIONS = [
    { value: 'MYSQL', label: 'MySQL' },
    { value: 'POSTGRESQL', label: 'PostgreSQL' },
    { value: 'ORACLE', label: 'Oracle' },
    { value: 'MONGODB', label: 'MongoDB' },
    { value: 'FIREBASE', label: 'Firebase' },
    { value: 'OTHER', label: 'Other' },
];

const DB_COMFORT_OPTIONS = [
    { value: 'BASIC_QUERIES', label: 'Basic queries' },
    { value: 'SCHEMA_DESIGN', label: 'Schema design' },
    { value: 'INDEXING', label: 'Indexing' },
    { value: 'TRANSACTIONS', label: 'Transactions' },
];

const SKILL_TYPE_OPTIONS = [
    { value: 'WEB_DEVELOPMENT', label: 'Web Development' },
    { value: 'ANDROID_DEVELOPMENT', label: 'Android Development' },
    { value: 'BACKEND_DEVELOPMENT', label: 'Backend Development' },
    { value: 'DSA', label: 'Data Structures & Algorithms' },
    { value: 'OTHER', label: 'Other' },
];

const SKILL_LEVEL_OPTIONS = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
];

const CODING_FREQUENCY_OPTIONS = [
    { value: 'RARELY', label: 'Rarely' },
    { value: 'SOMETIMES', label: 'Sometimes' },
    { value: 'DAILY', label: 'Daily' },
];

const DEBUGGING_CONFIDENCE_OPTIONS = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
];

const PROBLEM_SOLVING_OPTIONS = [
    { value: 'LOOPS_AND_CONDITIONS', label: 'Loops & conditionals' },
    { value: 'FUNCTIONS', label: 'Functions' },
    { value: 'OOP', label: 'Object-Oriented Programming' },
    { value: 'DSA_BASICS', label: 'Data Structures & Algorithms basics' },
    { value: 'ADVANCED_DSA', label: 'Advanced DSA' },
];

// ─── Types ──────────────────────────────────────────────────────────────────

interface Skill {
    id: string;
    skill: string;   // SkillType
    level: string;   // SkillLevel
}

interface FormData {
    education: string;
    background: string;
    coreSubjects: string[];
    skills: Skill[];
    primaryGoal: string;
    timeline: string;
    frontendTechnology: string;
    backendTechnology: string;
    apiKnowledge: string;
    architectureExperience: string;
    familiarConcepts: string[];
    databaseType: string;
    databasesKnown: string[];   // ← was a single string, now a list
    dbComfortLevel: string;
    codingFrequency: string;
    debuggingConfidence: string;
    problemSolvingArea: string;
}

const STEPS = [
    { label: 'About You', icon: GraduationCap },
    { label: 'Skills', icon: Code2 },
    { label: 'Goals', icon: Target },
    { label: 'Coding Habits', icon: Bug },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ProfileSetupPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        education: '',
        background: '',
        coreSubjects: [],
        skills: [{ id: '1', skill: '', level: 'BEGINNER' }],
        primaryGoal: '',
        timeline: '',
        frontendTechnology: '',
        backendTechnology: '',
        apiKnowledge: '',
        architectureExperience: '',
        familiarConcepts: [],
        databaseType: '',
        databasesKnown: [],
        dbComfortLevel: '',
        codingFrequency: '',
        debuggingConfidence: '',
        problemSolvingArea: '',
    });

    const update = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const toggleArrayValue = (
        field: 'coreSubjects' | 'familiarConcepts' | 'databasesKnown',
        value: string
    ) => {
        setFormData((prev) => {
            const arr = prev[field];
            return {
                ...prev,
                [field]: arr.includes(value)
                    ? arr.filter((v) => v !== value)
                    : [...arr, value],
            };
        });
        setError(null);
    };

    const updateSkill = (id: string, field: 'skill' | 'level', value: string) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
        }));
    };
    const addSkill = () => {
        if (formData.skills.length >= 5) return;
        setFormData((prev) => ({
            ...prev,
            skills: [...prev.skills, { id: Date.now().toString(), skill: '', level: 'BEGINNER' }],
        }));
    };
    const removeSkill = (id: string) => {
        if (formData.skills.length <= 1) return;
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((s) => s.id !== id),
        }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return !!(formData.education && formData.background && formData.coreSubjects.length > 0);
            case 1:
                return !!(
                    formData.frontendTechnology &&
                    formData.backendTechnology &&
                    formData.apiKnowledge &&
                    formData.architectureExperience &&
                    formData.skills.every((s) => s.skill)
                );
            case 2:
                return !!(
                    formData.primaryGoal &&
                    formData.timeline &&
                    formData.databaseType &&
                    formData.databasesKnown.length > 0 &&
                    formData.dbComfortLevel
                );
            case 3:
                return !!(
                    formData.codingFrequency &&
                    formData.debuggingConfidence &&
                    formData.problemSolvingArea
                );
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        const payload = {
            education: formData.education,
            background: formData.background,
            coreSubjects: formData.coreSubjects,
            skills: formData.skills.map(({ skill, level }) => ({
                skill,
                level,
            })),
            primaryGoal: formData.primaryGoal,
            timeline: formData.timeline,
            frontendTechnology: formData.frontendTechnology,
            backendTechnology: formData.backendTechnology,
            apiKnowledge: formData.apiKnowledge,
            architectureExperience: formData.architectureExperience,
            familiarConcepts: formData.familiarConcepts,
            databaseKnowledge: {
                databaseType: formData.databaseType,
                comfortLevel: formData.dbComfortLevel,
                databasesKnown: formData.databasesKnown,
            },
            codingFrequency: formData.codingFrequency,
            debuggingConfidence: formData.debuggingConfidence,
            problemSolvingArea: formData.problemSolvingArea,
        };

        try {
            const res = await fetchWithAuth('/profile', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? 'Failed to save profile');
            }

            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message ?? 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen pt-24 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-3xl mx-auto">

                    {/* Header */}
                    <div className="mb-12 animate-in fade-in slide-in-from-top duration-700">
                        <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
                            Complete Your Profile
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Help us tailor ArchFlow to your skill level and goals.
                        </p>
                    </div>

                    {/* Stepper */}
                    <div className="mb-12 animate-in fade-in duration-700" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center mb-4">
                            {STEPS.map((step, idx) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.label} className="flex items-center flex-1 last:flex-none">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${idx < currentStep
                                                        ? 'bg-primary text-primary-foreground'
                                                        : idx === currentStep
                                                            ? 'bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110'
                                                            : 'bg-muted text-muted-foreground border-2 border-border'
                                                    }`}
                                            >
                                                {idx < currentStep ? (
                                                    <CheckCircle2 className="w-5 h-5" />
                                                ) : (
                                                    <Icon className="w-4 h-4" />
                                                )}
                                            </div>
                                            <span
                                                className={`text-xs mt-2 hidden sm:block transition-colors duration-300 ${idx <= currentStep
                                                        ? 'text-foreground font-medium'
                                                        : 'text-muted-foreground'
                                                    }`}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                        {idx < STEPS.length - 1 && (
                                            <div
                                                className={`h-0.5 flex-1 mx-2 transition-all duration-500 ${idx < currentStep ? 'bg-primary' : 'bg-border'
                                                    }`}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3 animate-in fade-in duration-300">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* ── STEP 1: About You ── */}
                    {currentStep === 0 && (
                        <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    Education Level
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {EDUCATION_OPTIONS.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`flex items-center p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 ${formData.education === opt.value
                                                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                                                    : 'hover:bg-secondary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="education"
                                                value={opt.value}
                                                checked={formData.education === opt.value}
                                                onChange={(e) => update('education', e.target.value)}
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm font-medium">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    Background
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {BACKGROUND_OPTIONS.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`flex items-center p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 ${formData.background === opt.value
                                                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                                                    : 'hover:bg-secondary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="background"
                                                value={opt.value}
                                                checked={formData.background === opt.value}
                                                onChange={(e) => update('background', e.target.value)}
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm font-medium">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    Core Subjects You've Studied{' '}
                                    <span className="text-muted-foreground font-normal">
                                        ({formData.coreSubjects.length} selected)
                                    </span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {CORE_SUBJECT_OPTIONS.map((opt) => {
                                        const isSelected = formData.coreSubjects.includes(opt.value);
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => toggleArrayValue('coreSubjects', opt.value)}
                                                className={`p-3 text-sm text-left rounded-lg border transition-all duration-200 ${isSelected
                                                        ? 'bg-primary/15 border-primary text-primary font-medium'
                                                        : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Skills ── */}
                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Frontend Technology
                                    </label>
                                    <select
                                        value={formData.frontendTechnology}
                                        onChange={(e) => update('frontendTechnology', e.target.value)}
                                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="">Select an option</option>
                                        {FRONTEND_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Backend Technology
                                    </label>
                                    <select
                                        value={formData.backendTechnology}
                                        onChange={(e) => update('backendTechnology', e.target.value)}
                                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="">Select an option</option>
                                        {BACKEND_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        API Knowledge
                                    </label>
                                    <select
                                        value={formData.apiKnowledge}
                                        onChange={(e) => update('apiKnowledge', e.target.value)}
                                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="">Select an option</option>
                                        {API_KNOWLEDGE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Architecture Experience
                                    </label>
                                    <select
                                        value={formData.architectureExperience}
                                        onChange={(e) => update('architectureExperience', e.target.value)}
                                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="">Select an option</option>
                                        {ARCHITECTURE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-semibold text-foreground">
                                        Skills{' '}
                                        <span className="text-muted-foreground font-normal">
                                            ({formData.skills.length})
                                        </span>
                                    </label>
                                    {formData.skills.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={addSkill}
                                            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Add Skill
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {formData.skills.map((skill, index) => (
                                        <div
                                            key={skill.id}
                                            className="flex gap-2 items-center p-3 bg-card border border-border rounded-lg animate-in fade-in slide-in-from-left duration-300"
                                            style={{ animationDelay: `${index * 40}ms` }}
                                        >
                                            <select
                                                value={skill.skill}
                                                onChange={(e) => updateSkill(skill.id, 'skill', e.target.value)}
                                                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            >
                                                <option value="">Select a skill</option>
                                                {SKILL_TYPE_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <select
                                                value={skill.level}
                                                onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                                                className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            >
                                                {SKILL_LEVEL_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {formData.skills.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSkill(skill.id)}
                                                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors shrink-0"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Goals ── */}
                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    What's your primary goal?
                                </label>
                                <div className="space-y-2">
                                    {PRIMARY_GOAL_OPTIONS.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`flex items-center p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 ${formData.primaryGoal === opt.value
                                                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                                                    : 'hover:bg-secondary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="primaryGoal"
                                                value={opt.value}
                                                checked={formData.primaryGoal === opt.value}
                                                onChange={(e) => update('primaryGoal', e.target.value)}
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm font-medium">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Timeline
                                </label>
                                <select
                                    value={formData.timeline}
                                    onChange={(e) => update('timeline', e.target.value)}
                                    className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    <option value="">Select a timeline</option>
                                    {TIMELINE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    Concepts You're Familiar With{' '}
                                    <span className="text-muted-foreground font-normal">
                                        ({formData.familiarConcepts.length} selected · optional)
                                    </span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {CONCEPT_OPTIONS.map((opt) => {
                                        const isSelected = formData.familiarConcepts.includes(opt.value);
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => toggleArrayValue('familiarConcepts', opt.value)}
                                                className={`p-3 text-sm text-left rounded-lg border transition-all duration-200 ${isSelected
                                                        ? 'bg-primary/15 border-primary text-primary font-medium'
                                                        : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Database Type
                                    </label>
                                    <select
                                        value={formData.databaseType}
                                        onChange={(e) => update('databaseType', e.target.value)}
                                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="">Select</option>
                                        {DATABASE_TYPE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Comfort Level
                                    </label>
                                    <select
                                        value={formData.dbComfortLevel}
                                        onChange={(e) => update('dbComfortLevel', e.target.value)}
                                        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="">Select</option>
                                        {DB_COMFORT_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Databases Known — multi-select (matches List<DatabaseName>) */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    Which databases have you used?{' '}
                                    <span className="text-muted-foreground font-normal">
                                        ({formData.databasesKnown.length} selected)
                                    </span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {DATABASE_NAME_OPTIONS.map((opt) => {
                                        const isSelected = formData.databasesKnown.includes(opt.value);
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => toggleArrayValue('databasesKnown', opt.value)}
                                                className={`p-3 text-sm text-left rounded-lg border transition-all duration-200 ${isSelected
                                                        ? 'bg-primary/15 border-primary text-primary font-medium'
                                                        : 'bg-card border-border text-muted-foreground hover:border-primary/40'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: Coding Habits ── */}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    How often do you code?
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {CODING_FREQUENCY_OPTIONS.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`flex items-center p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 ${formData.codingFrequency === opt.value
                                                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                                                    : 'hover:bg-secondary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="codingFrequency"
                                                value={opt.value}
                                                checked={formData.codingFrequency === opt.value}
                                                onChange={(e) => update('codingFrequency', e.target.value)}
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm font-medium">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    Debugging Confidence
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {DEBUGGING_CONFIDENCE_OPTIONS.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`flex items-center p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 ${formData.debuggingConfidence === opt.value
                                                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                                                    : 'hover:bg-secondary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="debuggingConfidence"
                                                value={opt.value}
                                                checked={formData.debuggingConfidence === opt.value}
                                                onChange={(e) => update('debuggingConfidence', e.target.value)}
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm font-medium">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    Main Problem-Solving Area
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {PROBLEM_SOLVING_OPTIONS.map((opt) => (
                                        <label
                                            key={opt.value}
                                            className={`flex items-center p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 ${formData.problemSolvingArea === opt.value
                                                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                                                    : 'hover:bg-secondary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="problemSolvingArea"
                                                value={opt.value}
                                                checked={formData.problemSolvingArea === opt.value}
                                                onChange={(e) => update('problemSolvingArea', e.target.value)}
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                            />
                                            <span className="ml-3 text-sm font-medium">{opt.label}</span>
                                        </label>
                                    ))}
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
                            disabled={isSubmitting}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {currentStep === 0 ? 'Skip for now' : 'Back'}
                        </Button>

                        {currentStep < STEPS.length - 1 ? (
                            <Button
                                type="button"
                                onClick={() => setCurrentStep((s) => s + 1)}
                                disabled={!canProceed()}
                                size="lg"
                                className="flex items-center gap-2"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!canProceed() || isSubmitting}
                                size="lg"
                                className="flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        Complete Profile
                                        <CheckCircle2 className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}