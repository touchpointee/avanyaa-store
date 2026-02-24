'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Mail, MailOpen, CheckCheck, ChevronDown, ChevronUp, Phone, Tag } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Status = 'new' | 'read' | 'replied';

interface ContactMsg {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    status: Status;
    createdAt: string;
}

const STATUS_META: Record<Status, { label: string; color: string }> = {
    new: { label: 'New', color: 'bg-blue-500' },
    read: { label: 'Read', color: 'bg-slate-400' },
    replied: { label: 'Replied', color: 'bg-green-500' },
};

type FilterTab = 'all' | Status;

export default function AdminMessagesPage() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<ContactMsg[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterTab>('all');
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => { fetchMessages(); }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/messages');
            if (res.ok) setMessages(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: Status) => {
        const res = await fetch(`/api/admin/messages/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (res.ok) {
            setMessages((msgs) => msgs.map((m) => m._id === id ? { ...m, status } : m));
            toast({ title: `Marked as ${status}` });
        }
    };

    const deleteMessage = async (id: string) => {
        const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            setMessages((msgs) => msgs.filter((m) => m._id !== id));
            toast({ title: 'Message deleted' });
        }
    };

    const gmailLink = (email: string, name: string, subject?: string) =>
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent('Re: ' + (subject || 'Your message'))}&body=${encodeURIComponent('Hi ' + name + ',\n\n')}`;

    const newCount = messages.filter((m) => m.status === 'new').length;
    const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter);

    const tabs: { key: FilterTab; label: string }[] = [
        { key: 'all', label: `All (${messages.length})` },
        { key: 'new', label: `New (${newCount})` },
        { key: 'read', label: 'Read' },
        { key: 'replied', label: 'Replied' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold">Contact Messages</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {newCount > 0 ? `${newCount} unread message${newCount > 1 ? 's' : ''}` : 'All messages read'}
                </p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${filter === key
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="py-20 text-center text-muted-foreground">
                        No messages in this category.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map((msg) => {
                        const isOpen = expanded === msg._id;
                        const meta = STATUS_META[msg.status];
                        return (
                            <Card
                                key={msg._id}
                                className={`rounded-xl border transition-all overflow-hidden ${msg.status === 'new'
                                        ? 'border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/10'
                                        : 'border-border bg-card'
                                    }`}
                            >
                                <CardContent className="p-0">
                                    {/* ── Header row (always visible) ───────────────── */}
                                    <button
                                        type="button"
                                        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-muted/30 transition-colors"
                                        onClick={() => {
                                            setExpanded(isOpen ? null : msg._id);
                                            if (!isOpen && msg.status === 'new') updateStatus(msg._id, 'read');
                                        }}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {msg.status === 'new'
                                                ? <Mail className="h-4 w-4 text-blue-500" />
                                                : <MailOpen className="h-4 w-4 text-muted-foreground" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`font-semibold text-sm ${msg.status === 'new' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {msg.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{msg.email}</span>
                                                <Badge className={`text-[10px] px-2 py-0 ${meta.color}`}>{meta.label}</Badge>
                                            </div>
                                            <p className="text-sm font-medium mt-0.5 truncate">
                                                {msg.subject || '(no subject)'}
                                            </p>
                                            {!isOpen && (
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">{msg.message}</p>
                                            )}
                                        </div>

                                        <div className="shrink-0 flex flex-col items-end gap-1">
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </span>
                                            {isOpen
                                                ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                                                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                                        </div>
                                    </button>

                                    {/* ── Expanded body ──────────────────────────────── */}
                                    {isOpen && (
                                        <div className="border-t border-border">
                                            {/* Sender meta strip */}
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-5 py-2.5 bg-muted/40 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5 font-medium text-foreground">
                                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                                    {msg.email}
                                                </span>
                                                {msg.phone && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 shrink-0" /> {msg.phone}
                                                    </span>
                                                )}
                                                {msg.subject && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Tag className="h-3.5 w-3.5 shrink-0" /> {msg.subject}
                                                    </span>
                                                )}
                                                <span className="ml-auto">
                                                    {new Date(msg.createdAt).toLocaleString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>

                                            {/* Message body */}
                                            <div className="px-5 py-4">
                                                <div className="border-l-4 border-primary/30 bg-muted/40 rounded-r-lg pl-4 pr-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                                    {msg.message}
                                                </div>
                                            </div>

                                            {/* Action bar */}
                                            <div className="flex items-center gap-2 flex-wrap px-5 pb-4">
                                                <Button size="sm" variant="outline" className="gap-1.5" asChild>
                                                    <a
                                                        href={gmailLink(msg.email, msg.name, msg.subject)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Mail className="h-3.5 w-3.5" />
                                                        Reply via Gmail
                                                    </a>
                                                </Button>

                                                {msg.status !== 'replied' && (
                                                    <Button size="sm" variant="outline" className="gap-1.5"
                                                        onClick={() => updateStatus(msg._id, 'replied')}>
                                                        <CheckCheck className="h-3.5 w-3.5 text-green-600" />
                                                        Mark as Replied
                                                    </Button>
                                                )}

                                                {msg.status === 'replied' && (
                                                    <Button size="sm" variant="outline" className="gap-1.5"
                                                        onClick={() => updateStatus(msg._id, 'read')}>
                                                        <MailOpen className="h-3.5 w-3.5" />
                                                        Mark as Read
                                                    </Button>
                                                )}

                                                <Button size="sm" variant="ghost"
                                                    className="gap-1.5 text-destructive hover:bg-destructive/10 ml-auto"
                                                    onClick={() => deleteMessage(msg._id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
