/**
 * Custom hook to protect authenticated pages
 * Checks whether the user is logged in and redirects to login if needed
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from './cookies.config';

/**
 * Hook to check authentication
 * Automatically redirects to /login if not authenticated
 *
 * Usage:
 * const { isLoading } = useAuth();
 *
 * if (isLoading) return <LoadingSpinner />;
 * return <ProtectedComponent />;
 */
export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check whether the user is authenticated
    const checkAuth = () => {
      const authenticated = isAuthenticated();

      if (!authenticated) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
      } else {
        setIsAuth(true);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  return { isLoading, isAuthenticated: isAuth };
};
