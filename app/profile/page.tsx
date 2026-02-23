'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, LogOut, ChevronRight, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

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

    if (status === 'loading') {
        return (
            <div className="container mx-auto px-4 py-16 pb-24 md:pb-16 flex items-center justify-center">
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
        <div className="container mx-auto px-4 py-8 pb-28 md:pb-10 max-w-lg">
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
                    <div className="flex items-center gap-3 px-4 py-3.5">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium truncate">{user?.email ?? '—'}</p>
                        </div>
                    </div>
                    <Separator className="bg-border" />
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
                        className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-muted/50 transition-colors"
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
