'use client';

import { useState } from 'react';
import { ChevronDown, Truck, RotateCcw, Ruler, CreditCard } from 'lucide-react';
import Link from 'next/link';

const FAQ_CATEGORIES = [
    {
        icon: Truck,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-100 dark:border-blue-900',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        category: 'Orders & Delivery',
        faqs: [
            {
                q: 'How long does delivery take?',
                a: 'Standard delivery takes 4–7 business days across India. Express delivery (2–3 days) is available in select metro cities at checkout.',
            },
            {
                q: 'How do I track my order?',
                a: "Once your order ships, you'll receive a tracking link via email and WhatsApp. You can also check order status under My Orders.",
            },
            {
                q: 'Can I change or cancel my order?',
                a: 'Orders can be modified or cancelled within 12 hours of placement. After that, contact us immediately via WhatsApp.',
            },
            {
                q: 'Do you offer Cash on Delivery?',
                a: 'Yes, COD is available for orders across India. Additional handling charges may apply for certain pin codes.',
            },
        ],
    },
    {
        icon: RotateCcw,
        color: 'text-rose-600',
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        border: 'border-rose-100 dark:border-rose-900',
        iconBg: 'bg-rose-100 dark:bg-rose-900/50',
        category: 'Returns & Exchanges',
        faqs: [
            {
                q: 'What is your return policy?',
                a: 'We accept returns within 7 days of delivery. Items must be unused, unwashed, and in original packaging with tags attached.',
            },
            {
                q: 'How do I initiate a return?',
                a: 'Contact us via WhatsApp or email with your order ID and reason. Our team will arrange a pickup from your address.',
            },
            {
                q: 'When will I get my refund?',
                a: 'Refunds are processed within 5–7 business days after we receive and inspect the returned item.',
            },
            {
                q: 'Are sale items returnable?',
                a: 'Sale items are eligible for exchange only — not refunds — unless the item is defective or damaged.',
            },
        ],
    },
    {
        icon: Ruler,
        color: 'text-violet-600',
        bg: 'bg-violet-50 dark:bg-violet-950/30',
        border: 'border-violet-100 dark:border-violet-900',
        iconBg: 'bg-violet-100 dark:bg-violet-900/50',
        category: 'Sizing & Products',
        faqs: [
            {
                q: 'How do I find my size?',
                a: "Each product page has a size chart with bust, waist, and hip measurements. If you're between sizes, we recommend sizing up.",
            },
            {
                q: 'Are the colours accurate?',
                a: 'We maintain colour accuracy as far as possible, but slight variations may occur due to screen settings and lighting.',
            },
            {
                q: 'Do you offer custom stitching?',
                a: "We don't currently offer custom stitching, but reach out via WhatsApp and we'll try our best to help.",
            },
            {
                q: 'Are all products in stock?',
                a: 'Most products are in stock. If an item shows as unavailable, you can contact us to check restock timelines.',
            },
        ],
    },
    {
        icon: CreditCard,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        border: 'border-emerald-100 dark:border-emerald-900',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
        category: 'Payments & Offers',
        faqs: [
            {
                q: 'What payment methods are accepted?',
                a: 'We currently accept Cash on Delivery (COD). Online payment options (UPI, cards) are coming soon.',
            },
            {
                q: 'How do I apply a discount code?',
                a: 'Enter your promo code at checkout. Only one code can be applied per order.',
            },
            {
                q: 'Do you have a loyalty programme?',
                a: "We're working on it! Subscribe to our newsletter to be the first to know when our rewards programme launches.",
            },
            {
                q: 'Do you ship outside India?',
                a: 'Currently we ship within India only. International shipping is coming soon — stay tuned!',
            },
        ],
    },
];

export default function FAQPage() {
    const [openItem, setOpenItem] = useState<string | null>(null);

    const toggle = (key: string) => setOpenItem(openItem === key ? null : key);

    return (
        <main id="main-content" className="min-h-screen bg-background">

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="bg-primary text-primary-foreground py-14 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm uppercase tracking-widest opacity-70 mb-3">Support</p>
                    <h1 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-base opacity-80 max-w-xl mx-auto">
                        Everything you need to know about shopping with AVANYAA. Can't find your answer?{' '}
                        <Link href="/contact" className="underline underline-offset-2 font-medium">
                            Contact us
                        </Link>
                        .
                    </p>
                </div>
            </section>

            {/* ── 4-pillar card grid ──────────────────────────── */}
            <section className="container mx-auto px-4 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {FAQ_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <div
                                key={cat.category}
                                className={`rounded-2xl border ${cat.border} ${cat.bg} flex flex-col overflow-hidden shadow-sm`}
                            >
                                {/* Card header */}
                                <div className="px-5 pt-6 pb-4 flex flex-col items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center`}>
                                        <Icon className={`h-5 w-5 ${cat.color}`} />
                                    </div>
                                    <h2 className={`font-heading text-base font-semibold tracking-tight ${cat.color}`}>
                                        {cat.category}
                                    </h2>
                                </div>

                                {/* Divider */}
                                <div className={`mx-5 mb-3 border-t ${cat.border}`} />

                                {/* FAQ accordion items */}
                                <div className="flex-1 px-4 pb-5 space-y-1.5">
                                    {cat.faqs.map((faq, i) => {
                                        const key = `${cat.category}-${i}`;
                                        const isOpen = openItem === key;
                                        return (
                                            <div
                                                key={key}
                                                className="rounded-xl bg-background/70 dark:bg-background/30 border border-border/60 overflow-hidden"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => toggle(key)}
                                                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/30 transition-colors"
                                                >
                                                    <span className={isOpen ? cat.color : 'text-foreground'}>{faq.q}</span>
                                                    <ChevronDown
                                                        className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? `rotate-180 ${cat.color}` : 'text-muted-foreground'
                                                            }`}
                                                    />
                                                </button>
                                                {isOpen && (
                                                    <div className="px-4 pb-3 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
                                                        <div className="pt-2">{faq.a}</div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Still need help */}
                <div className="mt-12 rounded-2xl bg-primary/5 border border-primary/15 px-8 py-10 text-center max-w-2xl mx-auto">
                    <h3 className="font-heading text-xl font-semibold mb-2">Still have questions?</h3>
                    <p className="text-sm text-muted-foreground mb-5">
                        Our team is happy to help via WhatsApp, email, or the contact form.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Contact Us →
                    </Link>
                </div>
            </section>
        </main>
    );
}
