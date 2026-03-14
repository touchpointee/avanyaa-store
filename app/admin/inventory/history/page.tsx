'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface HistoryItem {
    _id: string;
    productId: string;
    productName: string;
    variant: {
        size: string;
        color: string;
    };
    changeAmount: number;
    reason: string;
    referenceId?: string;
    createdAt: string;
}

export default function AdminInventoryHistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
            router.push('/admin/signin');
            return;
        }

        if (status === 'authenticated') {
            fetchHistory();
        }
    }, [status, session, router]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/inventory/history?limit=100');
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            } else {
                toast({ title: 'Failed to fetch history', variant: 'destructive' });
            }
        } catch (error) {
            console.error('Error:', error);
            toast({ title: 'Error fetching history', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/admin/inventory')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Inventory History</h2>
                    <p className="text-muted-foreground">Recent stock adjustments and order deductions.</p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Variant (Size, Color)</TableHead>
                            <TableHead className="text-right">Change</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Reference ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : history.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No history records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            history.map((record) => (
                                <TableRow key={record._id}>
                                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                        {format(new Date(record.createdAt), 'MMM d, yyyy h:mm a')}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {record.productName}
                                    </TableCell>
                                    <TableCell>
                                        {record.variant ? (
                                            <div className="flex gap-1.5">
                                                <Badge variant="outline" className="text-xs font-normal">{record.variant.size || 'N/A'}</Badge>
                                                <Badge variant="outline" className="text-xs font-normal">{record.variant.color || 'N/A'}</Badge>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge
                                            variant={record.changeAmount > 0 ? "default" : record.changeAmount < 0 ? "destructive" : "secondary"}
                                            className="text-sm px-2"
                                        >
                                            {record.changeAmount > 0 ? '+' : ''}{record.changeAmount}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {record.reason}
                                    </TableCell>
                                    <TableCell className="text-sm font-mono text-muted-foreground">
                                        {record.referenceId || '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
