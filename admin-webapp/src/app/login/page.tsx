'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Card,
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  
  // Check Supabase connection on load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setDebug('Checking Supabase connection...');
        const { data, error } = await supabase.from('profiles').select('count');
        
        if (error) {
          setDebug(prev => `${prev}\nDatabase error: ${error.message}`);
        } else {
          setDebug(prev => `${prev}\nDatabase connection successful`);
        }
      } catch (e) {
        setDebug(prev => `${prev}\nUnexpected error: ${e.message}`);
      }
    };
    
    checkConnection();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setDebug(prev => `${prev}\n\nAttempting login for ${email}...`);

    try {
      // Try direct Supabase auth first for debugging
      setDebug(prev => `${prev}\nTrying direct Supabase auth...`);
      const directAuth = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (directAuth.error) {
        setDebug(prev => `${prev}\nDirect auth error: ${directAuth.error.message}`);
      } else {
        setDebug(prev => `${prev}\nDirect auth successful!`);
      }
      
      // Now try with the context login
      setDebug(prev => `${prev}\nTrying context login...`);
      const { data, error } = await login(email, password);
      
      if (error) {
        setDebug(prev => `${prev}\nContext login error: ${error.message}`);
        throw error;
      }
      
      setDebug(prev => `${prev}\nContext login successful!`);
      
      if (!data || !data.user) {
        setDebug(prev => `${prev}\nNo user data returned`);
        throw new Error('No user data returned after login');
      }
      
      // Check if user is admin before redirecting
      setDebug(prev => `${prev}\nChecking if user is admin...`);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        setDebug(prev => `${prev}\nProfile fetch error: ${profileError.message}`);
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }
      
      setDebug(prev => `${prev}\nProfile fetched: ${JSON.stringify(profile)}`);
      
      if (!profile || profile.role !== 'admin') {
        setDebug(prev => `${prev}\nUser is not an admin`);
        throw new Error('Unauthorized: Admin access only');
      }
      
      setDebug(prev => `${prev}\nUser is admin, redirecting...`);
      router.push('/');
    } catch (error) {
      console.error('Error during login:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md mb-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Kavach Admin Portal</CardTitle>
          <CardDescription>
            Sign in to access the emergency response control unit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@kavach.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}