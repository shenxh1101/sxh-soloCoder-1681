import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { UserRole } from '@/types';

export function useAuthGuard(requiredRoles?: UserRole[]) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (requiredRoles && requiredRoles.length > 0 && user) {
        if (!requiredRoles.includes(user.role)) {
          navigate('/', { replace: true });
        }
      }
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, requiredRoles, navigate]);

  return { user, isAuthenticated, loading };
}
