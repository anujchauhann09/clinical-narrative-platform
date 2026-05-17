import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { authApi } from '../api/authApi.js';
import { useAuthStore } from '../store/authStore.js';

export const AuthProvider = ({ children }) => {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const setSession = useAuthStore((state) => state.setSession);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      try {
        const response = await authApi.refreshToken();
        if (response.success && response.data) {
          setSession({
            user: response.data.user,
            accessToken: response.data.accessToken,
          });
        }
      } catch (error) {
        // Silent failure is expected if there is no valid refresh cookie
      } finally {
        setInitialized(false);
      }
    };

    initAuth();
  }, [setSession, setInitialized]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return children;
};
