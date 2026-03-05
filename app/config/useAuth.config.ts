/**
 * Hook personnalisé pour protéger les pages authentifiées
 * Vérifie si l'utilisateur est connecté et redirige vers login si nécessaire
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from './cookies.config';

/**
 * Hook pour vérifier l'authentification
 * Redirige automatiquement vers /login si pas authentifié
 *
 * Utilisation:
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
    // Vérifier si l'utilisateur est authentifié
    const checkAuth = () => {
      const authenticated = isAuthenticated();

      if (!authenticated) {
        // Rediriger vers login si pas authentifié
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
