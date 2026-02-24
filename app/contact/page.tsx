'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mail, Phone, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

export default function ContactPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast({ title: 'Please fill in all required fields', variant: 'destructive' });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                toast({ title: 'Message sent!', description: 'We\'ll get back to you within 24 hours.' });
                setForm({ name: '', email: '', phone: '', subject: '', message: '' });
            } else {
                throw new Error();
            }
        } catch {
            toast({ title: 'Failed to send', description: 'Please try WhatsApp or email us directly.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main id="main-content" className="min-h-screen bg-background">

            {/* ── Hero banner ───────────────────────────────── */}
            <section className="bg-primary text-primary-foreground py-14 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm uppercase tracking-widest opacity-70 mb-3">Get in touch</p>
                    <h1 className="font-heading text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                        We'd Love to Hear From You
                    </h1>
                    <p className="text-base opacity-80 max-w-xl mx-auto">
                        Have a question about an order, sizing, or our collection? Reach out and we'll respond promptly.
                    </p>
                </div>
            </section>

            {/* ── Info cards ────────────────────────────────── */}
            <section className="container mx-auto px-4 -mt-8 mb-12 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        {
                            icon: <Phone className="h-5 w-5" />,
                            title: 'Phone',
                            lines: ['+91 98765 43210'],
                            href: 'tel:+919876543210',
                        },
                        {
                            icon: <MessageCircle className="h-5 w-5" />,
                            title: 'WhatsApp',
                            lines: ['Chat with us'],
                            href: 'https://wa.me/919876543210?text=Hi%20Avanyaa!%20I%20need%20help.',
                        },
                        {
                            icon: <Mail className="h-5 w-5" />,
                            title: 'Email',
                            lines: ['support@avanyaa.in'],
                            href: 'mailto:support@avanyaa.in',
                        },
                        {
                            icon: <Clock className="h-5 w-5" />,
                            title: 'Hours',
                            lines: ['Mon–Sat', '10 AM – 7 PM'],
                            href: null,
                        },
                    ].map(({ icon, title, lines, href }) => (
                        <Card key={title} className="rounded-xl border border-border shadow hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    {icon}
                                </div>
                                <p className="font-semibold text-sm">{title}</p>
                                {lines.map((l) => (
                                    <p key={l} className="text-xs text-muted-foreground leading-snug">{l}</p>
                                ))}
                                {href && (
                                    <a href={href} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-primary font-medium hover:underline mt-0.5">
                                        {title === 'WhatsApp' ? 'Open WhatsApp →' : title === 'Email' ? 'Send email →' : 'Call now →'}
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ── Form + Map ────────────────────────────────── */}
            <section className="container mx-auto px-4 pb-16">
                <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-5xl mx-auto">

                    {/* Contact form */}
                    <div className="lg:col-span-3">
                        <h2 className="font-heading text-2xl font-semibold mb-1 tracking-tight">Send a Message</h2>
                        <p className="text-sm text-muted-foreground mb-6">We reply within 24 business hours.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                                    <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Your name" className="rounded-lg" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="rounded-lg" />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Phone (optional)</Label>
                                    <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 ..." className="rounded-lg" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="Order query, sizing, etc." className="rounded-lg" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    placeholder="Describe how we can help you…"
                                    className="w-full rounded-lg border border-border bg-white shadow-sm px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button type="submit" className="flex-1 h-11 font-semibold" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Send Message
                                </Button>
                                <a
                                    href="https://wa.me/919876543210?text=Hi%20Avanyaa!%20I%20need%20help."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-[10px] border-2 border-[#25D366] text-[#25D366] font-semibold text-sm hover:bg-[#25D366]/10 transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    WhatsApp Instead
                                </a>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar: Store info + location */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="rounded-xl border border-border shadow overflow-hidden">
                            <div className="bg-primary/5 px-5 py-4 border-b border-border">
                                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                    <MapPin className="h-4 w-4" />
                                    Our Store
                                </div>
                            </div>
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <p className="font-semibold text-sm">AVANYAA Fashion</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                                        123 Fashion Street, Rose Garden,<br />
                                        Palakkad, Kerala – 678001<br />
                                        India
                                    </p>
                                </div>
                                <a
                                    href="https://maps.google.com/?q=Palakkad,Kerala,India"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full rounded-lg overflow-hidden border border-border hover:opacity-90 transition-opacity"
                                >
                                    <img
                                        src="https://maps.googleapis.com/maps/api/staticmap?center=Palakkad,Kerala,India&zoom=13&size=400x180&markers=color:0x2d5f8a%7CPalakkad,Kerala,India&style=feature:all|element:labels.text.fill|color:0x555555&key="
                                        alt="Map showing store location in Palakkad"
                                        className="w-full h-36 object-cover bg-muted"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    <div className="px-3 py-2 text-xs text-primary font-medium hover:underline flex items-center justify-center gap-1 bg-muted/30">
                                        <MapPin className="h-3 w-3" />
                                        Open in Google Maps
                                    </div>
                                </a>
                            </CardContent>
                        </Card>

                        {/* Social quick links */}
                        <Card className="rounded-xl border border-border shadow">
                            <CardContent className="p-5">
                                <p className="font-semibold text-sm mb-3">Follow Us</p>
                                <div className="flex gap-3">
                                    {/* Instagram */}
                                    <a href="https://instagram.com/avanyaa" target="_blank" rel="noopener noreferrer"
                                        className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 transition-all text-center group">
                                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                                            <defs>
                                                <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                                                    <stop offset="0%" stopColor="#fdf497" />
                                                    <stop offset="10%" stopColor="#fdf497" />
                                                    <stop offset="50%" stopColor="#fd5949" />
                                                    <stop offset="68%" stopColor="#d6249f" />
                                                    <stop offset="100%" stopColor="#285AEB" />
                                                </radialGradient>
                                            </defs>
                                            <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad)" />
                                            <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
                                            <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
                                        </svg>
                                        <span className="text-[11px] text-muted-foreground font-medium">Instagram</span>
                                    </a>
                                    {/* Facebook */}
                                    <a href="https://facebook.com/avanyaa" target="_blank" rel="noopener noreferrer"
                                        className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all text-center group">
                                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                                            <rect width="24" height="24" rx="5.5" fill="#1877F2" />
                                            <path d="M13.5 21v-7.5h2.5l.375-3H13.5V8.625c0-.863.422-1.625 1.75-1.625H16.5V4.28S15.345 4 14.258 4C11.5 4 9.75 5.75 9.75 8.375v2.125H7.5v3H9.75V21h3.75z" fill="white" />
                                        </svg>
                                        <span className="text-[11px] text-muted-foreground font-medium">Facebook</span>
                                    </a>
                                    {/* YouTube */}
                                    <a href="https://youtube.com/@avanyaa" target="_blank" rel="noopener noreferrer"
                                        className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all text-center group">
                                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                                            <rect width="24" height="24" rx="5.5" fill="#FF0000" />
                                            <path d="M20.6 8.2s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C15.6 5 12 5 12 5s-3.6 0-5.8.3c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S3 9.8 3 11.4v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.9C7.6 19 12 19 12 19s3.6 0 5.8-.3c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C20.8 9.8 20.6 8.2 20.6 8.2z" fill="#FF0000" stroke="white" strokeWidth="0.5" />
                                            <polygon points="10,8.5 10,15.5 16,12" fill="white" />
                                        </svg>
                                        <span className="text-[11px] text-muted-foreground font-medium">YouTube</span>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

        </main>
    );
}
