'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminSignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (result?.error) {
        toast({
          title: 'Sign in failed',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Signed in successfully' });
        router.push('/admin');
        router.refresh();
      }
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md rounded-xl border border-slate-200 shadow-lg overflow-hidden bg-white">
        <CardHeader className="text-center space-y-2 pb-2 bg-slate-50 border-b border-slate-200">
          <Image src="/logo.png" alt="Avanyaa" width={100} height={40} className="h-12 w-auto mx-auto object-contain" />
          <CardTitle className="text-2xl font-semibold text-slate-800">Admin portal</CardTitle>
          <CardDescription className="text-slate-500">Sign in to manage Avanyaa. This is not the customer store login.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@avanyaa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="rounded-lg border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="rounded-lg border-slate-200 bg-white"
              />
            </div>
            <Button type="submit" className="w-full rounded-lg bg-slate-800 hover:bg-slate-900 text-white" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in to Admin
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Customer? <Link href="/auth/signin" className="text-slate-700 underline">Sign in to the store</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
