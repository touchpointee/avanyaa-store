import Link from 'next/link';
import AnimatedStat from '@/components/AnimatedStat';
import { Heart, Sparkles, Shield, Leaf } from 'lucide-react';

const VALUES = [
    {
        icon: Heart,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        title: 'Made with Love',
        desc: 'Every piece in our collection is thoughtfully curated with care for the woman who wears it.',
    },
    {
        icon: Sparkles,
        color: 'text-violet-500',
        bg: 'bg-violet-50 dark:bg-violet-950/30',
        title: 'Premium Quality',
        desc: 'We work only with fabrics and finishes that meet our high standards — because you deserve the best.',
    },
    {
        icon: Shield,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        title: 'Trusted & Transparent',
        desc: 'Honest pricing, clear sizing, and a no-hassle return policy — we stand behind every order.',
    },
    {
        icon: Leaf,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        title: 'Mindful Fashion',
        desc: 'We believe in thoughtful production — styles made to last, not just for a season.',
    },
];

const STATS = [
    { value: '5,000+', label: 'Happy Customers' },
    { value: '200+', label: 'Styles Available' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '7-Day', label: 'Easy Returns' },
];

export default function AboutPage() {
    return (
        <main id="main-content" className="min-h-screen bg-background">

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="bg-primary text-primary-foreground py-16 md:py-24">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <p className="text-sm uppercase tracking-widest opacity-70 mb-3">Our Story</p>
                    <h1 className="font-heading text-4xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight">
                        Dressing Women.<br />Celebrating Confidence.
                    </h1>
                    <p className="text-base md:text-lg opacity-80 max-w-xl mx-auto leading-relaxed">
                        AVANYAA was born from a simple belief — every woman deserves to feel beautiful, every day,
                        in clothing made just for her.
                    </p>
                </div>
            </section>

            {/* ── Stats bar ──────────────────────────────────── */}
            <section className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
                        {STATS.map(({ value, label }) => (
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
                            Where It All Began
                        </h2>
                        <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                            <p>
                                AVANYAA started as a small boutique in Murukkumpuzha, Thiruvananthapuram — a dream nurtured by a passion
                                for fashion that feels personal. We noticed a gap: beautiful, well-crafted ethnic and
                                contemporary dresses that were actually affordable and accessible across India.
                            </p>
                            <p>
                                So we set out to build that brand ourselves. From hand-picking fabrics to working closely
                                with skilled craftspeople, every AVANYAA piece carries the care and attention of a small
                                team that genuinely loves what it does.
                            </p>
                            <p>
                                Today, we ship hundreds of orders every month — but our goal remains the same as day one:
                                make a woman feel effortlessly confident the moment she puts on one of our pieces.
                            </p>
                        </div>
                    </div>

                    {/* Visual block — gradient placeholder */}
                    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/15 flex items-center justify-center aspect-[4/3]">
                        <div className="text-center p-8">
                            <p className="font-heading text-5xl font-bold text-primary/30">AVANYAA</p>
                            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">Est. Murukkumpuzha, Thiruvananthapuram</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Values ─────────────────────────────────────── */}
            <section className="bg-muted/40 border-t border-border py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                            What We Stand For
                        </h2>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto">
                            Our values shape every decision — from which fabrics we source to how we handle returns.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                        {VALUES.map(({ icon: Icon, color, bg, title, desc }) => (
                            <div key={title} className={`rounded-2xl ${bg} border border-border/60 p-6 flex flex-col gap-3`}>
                                <div className={`w-10 h-10 rounded-xl bg-background/60 flex items-center justify-center`}>
                                    <Icon className={`h-5 w-5 ${color}`} />
                                </div>
                                <h3 className="font-semibold text-sm">{title}</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────── */}
            <section className="container mx-auto px-4 py-16 text-center max-w-xl">
                <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                    Ready to Explore?
                </h2>
                <p className="text-sm text-muted-foreground mb-7">
                    Browse our latest collection or reach out — we'd love to help you find your perfect look.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Shop the Collection
                    </Link>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted/50 transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </section>

        </main>
    );
}
