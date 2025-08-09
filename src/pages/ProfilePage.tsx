import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  full_name: string;
  email: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({ full_name: '', email: '' });

  useEffect(() => {
    document.title = 'My Profile | Artisan Delights';
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name,email')
        .eq('user_id', user.id)
        .single();
      if (!error && data) {
        setProfile({ full_name: data.full_name || '', email: data.email || user.email || '' });
      } else {
        setProfile({ full_name: '', email: user.email || '' });
      }
    };
    loadProfile();
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      // Update profile table
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({ full_name: profile.full_name, email: profile.email })
        .eq('user_id', user.id);
      if (profileErr) throw profileErr;

      // If email changed from auth email, trigger auth email update
      if (profile.email && profile.email !== user.email) {
        const { error: authErr } = await supabase.auth.updateUser({ email: profile.email });
        if (authErr) throw authErr;
        toast({ title: 'Email update requested', description: 'Please check your inbox to confirm the new email.' });
      } else {
        toast({ title: 'Profile saved' });
      }
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </header>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" value={profile.full_name}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com" />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default ProfilePage;
