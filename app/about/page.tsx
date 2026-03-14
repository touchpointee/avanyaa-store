'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AnimatedStat from '@/components/AnimatedStat';
import { Heart, Sparkles, Shield, Leaf, Star, Truck, RotateCcw, Award, Globe, Users } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  heart: Heart, sparkles: Sparkles, shield: Shield, leaf: Leaf,
  star: Star, truck: Truck, rotateCCW: RotateCcw, award: Award,
  globe: Globe, users: Users,
};

const VALUE_STYLES: Record<string, { color: string; bg: string }> = {
  heart:     { color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-950/30' },
  sparkles:  { color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-950/30' },
  shield:    { color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/30' },
  leaf:      { color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  star:      { color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/30' },
  truck:     { color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/30' },
  rotateCCW: { color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-950/30' },
  award:     { color: 'text-yellow-500',  bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
  globe:     { color: 'text-teal-500',    bg: 'bg-teal-50 dark:bg-teal-950/30' },
  users:     { color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
};

interface AboutContent {
  heroEyebrow: string;
  heroHeadline: string;
  heroSubtext: string;
  stats: { value: string; label: string }[];
  storyHeading: string;
  storyParagraphs: string[];
  storyTagline: string;
  storyLocation: string;
  valuesHeading: string;
  valuesSubtext: string;
  values: { icon: string; title: string; desc: string }[];
  ctaHeading: string;
  ctaSubtext: string;
}

const DEFAULT_ABOUT: AboutContent = {
  heroEyebrow: 'Our Story',
  heroHeadline: 'Dressing Women.\nCelebrating Confidence.',
  heroSubtext: 'AVANYAA was born from a simple belief — every woman deserves to feel beautiful, every day, in clothing made just for her.',
  stats: [
    { value: '5,000+', label: 'Happy Customers' },
    { value: '200+', label: 'Styles Available' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '7-Day', label: 'Easy Returns' },
  ],
  storyHeading: 'Where It All Began',
  storyParagraphs: [
    'AVANYAA started as a small boutique in Murukkumpuzha, Thiruvananthapuram — a dream nurtured by a passion for fashion that feels personal. We noticed a gap: beautiful, well-crafted ethnic and contemporary dresses that were actually affordable and accessible across India.',
    'So we set out to build that brand ourselves. From hand-picking fabrics to working closely with skilled craftspeople, every AVANYAA piece carries the care and attention of a small team that genuinely loves what it does.',
    'Today, we ship hundreds of orders every month — but our goal remains the same as day one: make a woman feel effortlessly confident the moment she puts on one of our pieces.',
  ],
  storyTagline: 'AVANYAA',
  storyLocation: 'Est. Murukkumpuzha, Thiruvananthapuram',
  valuesHeading: 'What We Stand For',
  valuesSubtext: 'Our values shape every decision — from which fabrics we source to how we handle returns.',
  values: [
    { icon: 'heart',    title: 'Made with Love',          desc: 'Every piece in our collection is thoughtfully curated with care for the woman who wears it.' },
    { icon: 'sparkles', title: 'Premium Quality',         desc: 'We work only with fabrics and finishes that meet our high standards — because you deserve the best.' },
    { icon: 'shield',   title: 'Trusted & Transparent',   desc: 'Honest pricing, clear sizing, and a no-hassle return policy — we stand behind every order.' },
    { icon: 'leaf',     title: 'Mindful Fashion',         desc: 'We believe in thoughtful production — styles made to last, not just for a season.' },
  ],
  ctaHeading: 'Ready to Explore?',
  ctaSubtext: "Browse our latest collection or reach out — we'd love to help you find your perfect look.",
};

export default function AboutPage() {
    const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT);

    useEffect(() => {
        fetch('/api/settings/about')
            .then(r => r.json())
            .then(data => { if (data && data.heroHeadline) setAbout(data); })
            .catch(() => {});
    }, []);

    const headlines = about.heroHeadline.split('\n');

    return (
        <main id="main-content" className="min-h-screen bg-background">

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="bg-primary text-primary-foreground py-16 md:py-24">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <p className="text-sm uppercase tracking-widest opacity-70 mb-3">{about.heroEyebrow}</p>
                    <h1 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight">
                        {headlines.map((line, i) => (
                            <span key={i}>{line}{i < headlines.length - 1 && <br />}</span>
                        ))}
                    </h1>
                    <p className="text-base md:text-lg opacity-80 max-w-xl mx-auto leading-relaxed">
                        {about.heroSubtext}
                    </p>
                </div>
            </section>

            {/* ── Stats bar ──────────────────────────────────── */}
            <section className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
                        {about.stats.map(({ value, label }) => (
                            <div key={label} className="py-8 px-4">
                                <AnimatedStat
                                    value={value}
                                    label={label}
                                    className="text-3xl font-bold text-primary"
                                    labelClassName="text-sm text-muted-foreground"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Our Story ──────────────────────────────────── */}
            <section className="container mx-auto px-4 py-16 md:py-20 max-w-4xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-5">
                            {about.storyHeading}
                        </h2>
                        <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                            {about.storyParagraphs.map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/15 flex items-center justify-center aspect-[4/3]">
                        <div className="text-center p-8">
                            <p className="font-heading text-5xl font-bold text-primary/30">{about.storyTagline}</p>
                            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">{about.storyLocation}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Values ─────────────────────────────────────── */}
            <section className="bg-muted/40 border-t border-border py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-3">{about.valuesHeading}</h2>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">{about.valuesSubtext}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {about.values.map((v) => {
                            const Icon = ICON_MAP[v.icon] || Heart;
                            const { color, bg } = VALUE_STYLES[v.icon] || VALUE_STYLES.heart;
                            return (
                                <div key={v.title} className={`rounded-2xl ${bg} border border-border/60 p-6 flex flex-col gap-3`}>
                                    <div className="w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center">
                                        <Icon className={`h-5 w-5 ${color}`} />
                                    </div>
                                    <h3 className="font-semibold text-sm">{v.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────── */}
            <section className="container mx-auto px-4 py-16 text-center max-w-xl">
                <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-4">{about.ctaHeading}</h2>
                <p className="text-sm text-muted-foreground mb-7">{about.ctaSubtext}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                        Shop the Collection
                    </Link>
                    <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted/50 transition-colors">
                        Contact Us
                    </Link>
                </div>
            </section>

        </main>
    );
}
