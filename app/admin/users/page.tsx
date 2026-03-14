'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, Users, Phone, Mail, Calendar, X, AlertTriangle, Loader2, Ban, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  status: 'active' | 'blocked';
  createdAt: string;
}

/* ── Main page ───────────────────────────────────────── */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const searchTimer = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const fetchUsers = async (q = search, s = statusFilter) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (q) queryParams.set('search', q);
      if (s !== 'all') queryParams.set('status', s);
      
      const res = await fetch(`/api/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      if (res.ok) setUsers(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [statusFilter]);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchUsers(val), 350);
  };

  const handleStatusUpdate = async (user: UserRecord) => {
    const isCurrentlyBlocked = user.status === 'blocked';
    const newStatus = isCurrentlyBlocked ? 'active' : 'blocked';
    setStatusUpdating(user._id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user._id, status: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
        );
        toast({
          title: `User ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`,
          description: `${user.name}'s status has been updated.`,
          variant: newStatus === 'blocked' ? 'destructive' : 'default',
        });
      } else {
        const data = await res.json();
        toast({ title: 'Update failed', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setStatusUpdating(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const getStatusBadge = (status?: string) => {
    if (status === 'blocked') {
      return <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 gap-1"><Ban className="h-3 w-3" /> Blocked</Badge>;
    }
    return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1"><ShieldCheck className="h-3 w-3" /> Active</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> User Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? '…' : `${users.length} registered customer${users.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex bg-muted p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'active' ? 'bg-background shadow-sm text-emerald-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                statusFilter === 'blocked' ? 'bg-background shadow-sm text-destructive' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Blocked
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 rounded-lg h-9 text-sm"
            />
            {search && (
              <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border shadow overflow-hidden bg-card">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Name / Email</span>
          <span>Mobile</span>
          <span>Joined</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-4 py-4 border-b border-border last:border-0 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
                <div className="h-4 w-28 bg-muted rounded self-center" />
                <div className="h-4 w-20 bg-muted rounded self-center" />
                <div className="h-6 w-16 bg-muted rounded self-center" />
                <div className="h-8 w-24 bg-muted rounded self-center justify-self-end" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">
              {search ? 'No users match your search.' : 'No registered users yet.'}
            </p>
          </div>
        ) : (
          <div>
            {users.map((user, idx) => (
              <div
                key={user._id}
                className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 items-center px-4 py-4 hover:bg-muted/30 transition-colors ${idx !== users.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                    <Mail className="h-3 w-3 shrink-0" />{user.email}
                  </p>
                </div>

                <div className="min-w-0">
                  {user.mobile ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{user.mobile}
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground font-normal border-dashed">No mobile</Badge>
                  )}
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <Calendar className="h-3.5 w-3.5" />{formatDate(user.createdAt)}
                  </span>
                </div>

                <div className="shrink-0">
                  {getStatusBadge(user.status)}
                </div>

                <div className="text-right">
                  <Button
                    size="sm"
                    variant={user.status !== 'blocked' ? 'outline' : 'default'}
                    className={`h-8 rounded-lg text-xs font-semibold px-3 transition-all ${
                      user.status !== 'blocked'
                        ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white border-0'
                    }`}
                    onClick={() => handleStatusUpdate(user)}
                    disabled={statusUpdating === user._id}
                  >
                    {statusUpdating === user._id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    ) : user.status !== 'blocked' ? (
                      <Ban className="h-3.5 w-3.5 mr-1.5" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {user.status !== 'blocked' ? 'Block User' : 'Unblock User'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
