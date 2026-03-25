'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast({ title: 'Reset link sent!', description: data.message });
      } else {
        toast({ title: 'Request failed', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <Card className="max-w-md mx-auto rounded-xl border border-border shadow overflow-hidden">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-3xl font-semibold tracking-tight">Forgot Password</CardTitle>
          <CardDescription>
            Enter your account email and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200">
                <p className="font-medium text-sm">
                  If <strong>{email}</strong> is registered, we have sent a secure password reset link to it. Check your inbox and spam folder.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signin">Return to Sign In</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg border-border"
                />
              </div>

              <Button type="submit" className="w-full rounded-lg" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link href="/auth/signin" className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors">
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
