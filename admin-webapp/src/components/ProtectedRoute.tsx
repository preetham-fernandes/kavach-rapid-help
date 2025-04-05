'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Changed from next/router to next/navigation
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
    
    // If user exists but is not admin, redirect to unauthorized page
    if (!loading && user && !isAdmin()) {
      router.push('/unauthorized');
    }
  }, [user, profile, loading, router, isAdmin]);

  // Show loading or nothing while checking authentication
  if (loading || !user || !isAdmin()) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return children;
}