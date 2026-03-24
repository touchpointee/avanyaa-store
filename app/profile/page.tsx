'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, LogOut, ChevronRight, Mail, ShieldCheck, Phone, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    const [mobile, setMobile] = useState('');
    const [editingMobile, setEditingMobile] = useState(false);
    const [mobileInput, setMobileInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (
            status === 'authenticated' &&
            (session?.user as { role?: string })?.role === 'admin'
        ) {
            router.push('/auth/signin');
        }
    }, [status, session, router]);

    // Fetch mobile directly from DB via API
    useEffect(() => {
        if (status !== 'authenticated') return;

        const loadProfile = async () => {
            setProfileLoaded(false);
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const data = await res.json();
                    console.log('[Profile] fetched from DB:', data);
                    setMobile(data.mobile ?? '');
                    setMobileInput(data.mobile ?? '');
                } else {
                    console.error('[Profile] API error:', res.status, await res.text());
                }
            } catch (err) {
                console.error('[Profile] fetch failed:', err);
            } finally {
                setProfileLoaded(true);
            }
        };

        loadProfile();
    }, [status]);

    const saveMobile = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: mobileInput }),
            });
            if (res.ok) {
                const data = await res.json();
                setMobile(data.mobile ?? '');
                setMobileInput(data.mobile ?? '');
                setEditingMobile(false);
                toast({ title: 'Mobile number saved' });
            } else {
                toast({ title: 'Failed to save', variant: 'destructive' });
            }
        } catch {
            toast({ title: 'Network error', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setMobileInput(mobile);
        setEditingMobile(false);
    };

    if (status === 'loading') {
        return (
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const user = session?.user;
    const initials = user?.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';

    return (
        <div className="container mx-auto px-4 py-8 max-w-lg">
            <h1 className="font-heading text-2xl md:text-3xl font-semibold mb-6 tracking-tight">
                My Profile
            </h1>

            {/* Avatar + name */}
            <div className="flex items-center gap-4 mb-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-primary">{initials}</span>
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-lg truncate">{user?.name ?? 'Customer'}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email ?? ''}</p>
                </div>
            </div>

            {/* Account info card */}
            <Card className="rounded-xl border border-border shadow mb-4">
                <CardContent className="p-0">
                    {/* Email */}
                    <div className="flex items-center gap-3 px-4 py-3.5">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium truncate">{user?.email ?? '—'}</p>
                        </div>
                    </div>

                    <Separator className="bg-border" />

                    {/* Mobile — editable */}
                    <div className="flex items-center gap-3 px-4 py-3.5 min-h-[60px]">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-0.5">Mobile Number</p>
                            {editingMobile ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="tel"
                                        value={mobileInput}
                                        onChange={(e) => setMobileInput(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="h-8 text-sm rounded-lg border-border flex-1"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveMobile();
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                    />
                                    <button
                                        onClick={saveMobile}
                                        disabled={saving}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                                        aria-label="Save"
                                    >
                                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        disabled={saving}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted/60 transition-colors shrink-0"
                                        aria-label="Cancel"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ) : !profileLoaded ? (
                                <span className="inline-block h-4 w-32 bg-muted rounded animate-pulse" />
                            ) : mobile ? (
                                <p className="text-sm font-medium text-foreground">{mobile}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Not added yet — click ✏️ to add</p>
                            )}
                        </div>
                        {/* Edit icon — always visible (not in edit mode) */}
                        {!editingMobile && (
                            <button
                                onClick={() => { setMobileInput(mobile); setEditingMobile(true); }}
                                className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                aria-label="Edit mobile number"
                                title={mobile ? 'Edit mobile number' : 'Add mobile number'}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>


                    <Separator className="bg-border" />

                    {/* Account type */}
                    <div className="flex items-center gap-3 px-4 py-3.5">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Account type</p>
                            <p className="text-sm font-medium">Customer</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick links card */}
            <Card className="rounded-xl border border-border shadow mb-6">
                <CardContent className="p-0">
                    <Link
                        href="/orders"
                        className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-muted/50 transition-colors rounded-t-xl"
                    >
                        <div className="flex items-center gap-3">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">My Orders</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <Separator className="bg-border" />
                    <Link
                        href="/wishlist"
                        className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-muted/50 transition-colors rounded-b-xl"
                    >
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Wishlist</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                </CardContent>
            </Card>

            {/* Sign out */}
            <Button
                variant="outline"
                className="w-full rounded-lg border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={() => signOut({ callbackUrl: '/' })}
            >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
            </Button>
        </div>
    );
}
