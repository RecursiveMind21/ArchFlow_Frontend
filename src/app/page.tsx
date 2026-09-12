'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Card {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const featureCards: Card[] = [
  {
    id: '1',
    icon: <span className="text-2xl">1</span>,
    title: 'Conversational Requirement Engine',
    description: 'AI converts natural discussions into structured functional and non-functional requirements.',
  },
  {
    id: '2',
    icon: <span className="text-2xl">2</span>,
    title: 'Architecture Designer',
    description: 'Generate system design, component boundaries, database schemas, and APIs.',
  },
  {
    id: '3',
    icon: <span className="text-2xl">3</span>,
    title: 'Task Decomposer',
    description: 'Break architecture into actionable backend, frontend, and DevOps tasks.',
  },
  {
    id: '4',
    icon: <span className="text-2xl">4</span>,
    title: 'Traceability Engine',
    description: 'Track every commit back to the original requirement.',
  },
];

function CardComponent({ card, index }: { card: Card; index: number }) {
  return (
    <div
      className="group relative animate-in fade-in zoom-in duration-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="absolute -inset-1 bg-linear-to-r from-foreground/5 to-foreground/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
      <div className="relative p-8 border border-border rounded-xl bg-card hover:bg-secondary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform duration-300">
            {card.icon}
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          {card.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {card.description}
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="w-full bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="font-bold text-lg">ArchFlow</span>
          </div>
          <Button variant="outline" size="sm">
            <Link href="/register">
              Get Started Free
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block animate-in fade-in slide-in-from-top duration-500">
            <span className="text-sm font-mono text-muted-foreground border border-border rounded-full px-4 py-2">
              From Ideas to Code
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight text-balance animate-in fade-in slide-in-from-top duration-500" style={{ animationDelay: '100ms' }}>
            From Idea to Architecture.
            <br />
            <span className="text-muted-foreground">Structured by AI.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-top duration-500" style={{ animationDelay: '200ms' }}>
            ArchFlow transforms raw product ideas into structured requirements, system architecture, actionable tasks, and traceable implementation workflows. Instead of scattered documents and disconnected tickets, you get a unified engineering system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in fade-in slide-in-from-top duration-500" style={{ animationDelay: '300ms' }}>
            <Button asChild size="lg" className="text-base">
              <Link href="/register">
                Get Started Free
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base">
              See How It Works
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Flow Diagram */}
          <div className="relative mt-16 p-8 bg-card border border-border rounded-lg overflow-hidden animate-in fade-in zoom-in duration-500" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-primary/10 border border-border rounded text-sm font-mono">Idea</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-primary/10 border border-border rounded text-sm font-mono">Requirements</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-primary/10 border border-border rounded text-sm font-mono">Architecture</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-primary/10 border border-border rounded text-sm font-mono">Tasks</span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-primary/10 border border-border rounded text-sm font-mono">Commits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-balance">
            Stop Building in Chaos.
          </h2>

          <div className="bg-card border border-border rounded-lg p-8 sm:p-12">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Modern software development breaks down when structure breaks down. Requirements live in chat threads. Architecture lives in someone's head. Tasks drift from intent. Commits lose context. Over time, complexity increases and clarity disappears.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ArchFlow solves this by creating a unified system where every decision is tracked, every component is documented, and every change is connected to its original purpose.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-center text-balance">
            AI That Understands Software Engineering.
          </h2>

          <p className="text-lg text-muted-foreground text-center mb-12 leading-relaxed max-w-2xl mx-auto">
            ArchFlow acts as an AI-powered engineering co-pilot. It extracts structured requirements from conversation, designs scalable architecture, decomposes systems into executable tasks, and maintains complete traceability across your workflow.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureCards.map((card, index) => (
              <CardComponent key={card.id} card={card} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Traceability Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-balance">
            Complete Traceability.
            <br />
            <span className="text-muted-foreground">Zero Drift.</span>
          </h2>

          <div className="bg-card border border-border rounded-lg p-8 sm:p-12 mb-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every requirement connects to architecture. Every architecture component connects to tasks. Every task connects to commits. You always know why a piece of code exists. This eliminates drift, maintains alignment, and ensures your codebase remains true to its original vision.
            </p>
          </div>

          {/* Traceability Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center animate-in fade-in zoom-in duration-500" style={{ animationDelay: '0ms' }}>
              <div className="mb-4 mx-auto w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-sm text-muted-foreground">Structured and documented</p>
            </div>
            <div className="text-center animate-in fade-in zoom-in duration-500" style={{ animationDelay: '100ms' }}>
              <div className="mb-4 mx-auto w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Architecture</h3>
              <p className="text-sm text-muted-foreground">Designed and validated</p>
            </div>
            <div className="text-center animate-in fade-in zoom-in duration-500" style={{ animationDelay: '200ms' }}>
              <div className="mb-4 mx-auto w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Implementation</h3>
              <p className="text-sm text-muted-foreground">Traced and connected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Start Building With Structure.
          </h2>

          <p className="text-lg text-muted-foreground mb-8">
            Free for individual developers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base">
              Create Free Account
            </Button>
            <Button variant="outline" size="lg" className="text-base">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition">GitHub</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; 2025 ArchFlow. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition">Twitter</a>
              <a href="#" className="hover:text-foreground transition">GitHub</a>
              <a href="#" className="hover:text-foreground transition">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
