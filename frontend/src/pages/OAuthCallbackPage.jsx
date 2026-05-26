import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { authApi } from '../api/authApi.js';
import { Loader } from '../components/common/Loader.jsx';
import { ROUTES } from '../constants/app.js';
import { useAuthStore } from '../store/authStore.js';

const GENERIC_ERROR = 'We could not complete sign-in. Please try again.';

// Landing route after an OAuth round-trip. The backend has already set the
// session cookies (or appended ?error=...); this page turns that into either a
// populated store + dashboard redirect, or a bounce back to login with a reason.
export const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const providerError = searchParams.get('error');
    if (providerError) {
      navigate(ROUTES.LOGIN, { replace: true, state: { error: providerError } });
      return;
    }

    const finalize = async () => {
      try {
        // Confirms the session cookie the callback set and captures the CSRF
        // token (returned in the body) for subsequent mutating requests.
        const response = await authApi.getMe();
        if (response?.success && response.data?.user) {
          setSession({ user: response.data.user });
          navigate(ROUTES.DASHBOARD, { replace: true });
          return;
        }
        throw new Error('No session');
      } catch (_error) {
        navigate(ROUTES.LOGIN, { replace: true, state: { error: GENERIC_ERROR } });
      }
    };

    finalize();
  }, [navigate, searchParams, setSession]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg">
      <Loader label="Signing you in..." size={22} />
    </div>
  );
};
