import { useEffect } from 'react';

import { authApi } from '../../api/authApi.js';
import { useAuthStore } from '../../store/authStore.js';
import { Loader } from './Loader.jsx';

// Module-level guard. React StrictMode mounts components twice in dev; this
// keeps the bootstrap request from racing with itself.
let hasInitialized = false;

export const AuthProvider = ({ children }) => {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const setSession = useAuthStore((state) => state.setSession);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    if (hasInitialized) return;
    hasInitialized = true;

    const bootstrap = async () => {
      try {
        // The browser sends the access cookie automatically. If it's expired,
        // the apiClient response interceptor will silently refresh and retry.
        const response = await authApi.getMe();
        if (response?.success && response.data?.user) {
          setSession({ user: response.data.user });
        }
      } catch (_error) {
        // No valid session — user must sign in. Store stays cleared.
      } finally {
        setInitialized(false);
      }
    };

    bootstrap();
  }, [setSession, setInitialized]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg">
        <Loader label="Just a moment..." size={22} />
      </div>
    );
  }

  return children;
};
