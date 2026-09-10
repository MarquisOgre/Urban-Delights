import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
      return;
    }
    navigate('/admin', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-orange-50 text-stone-900">
      <main className="relative flex flex-1 items-center justify-center px-4 py-16">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/?preview=1')}
          className="absolute left-4 top-4 gap-2 border-orange-200 bg-white/90 text-orange-900 hover:bg-white sm:left-6 sm:top-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <Home className="h-4 w-4" />
          Home
        </Button>

        <Card className="w-full max-w-sm rounded-2xl border-orange-100 shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <img src="/logo.png" alt="Urban Delights" className="mx-auto h-14 w-auto object-contain" />
            <CardTitle className="text-lg">Admin Sign In</CardTitle>
            {session && <p className="text-xs text-stone-500">You are currently signed in. Sign in again to switch accounts.</p>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-3">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Button type="submit" className="w-full bg-stone-900 hover:bg-orange-700" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
