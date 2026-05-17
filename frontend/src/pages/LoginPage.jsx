import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { Button, Input } from '../components/index.js';
import { authApi } from '../api/authApi.js';
import { ROUTES } from '../constants/app.js';
import { useAsyncAction } from '../hooks/useAsyncAction.js';
import { useAuthStore } from '../store/authStore.js';
import { loginSchema } from '../validators/auth.validator.js';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [validationError, setValidationError] = useState(null);
  const setSession = useAuthStore((state) => state.setSession);
  const { execute, error, isLoading } = useAsyncAction(authApi.login);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsedPayload = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!parsedPayload.success) {
      setValidationError(parsedPayload.error.issues[0]?.message ?? 'Please check your login details');
      return;
    }

    setValidationError(null);
    const payload = parsedPayload.data;
    const response = await execute(payload);

    setSession(response.data);
    navigate(location.state?.from?.pathname ?? ROUTES.DASHBOARD, { replace: true });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Welcome back</p>
        <h1>Login</h1>
      </div>
      {location.state?.message && (
        <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
          {location.state.message}
        </div>
      )}
      <Input autoComplete="email" id="email" label="Email" name="email" type="email" />
      <Input autoComplete="current-password" id="password" label="Password" name="password" type="password" />
      {validationError || error ? (
        <p className="form-error">{validationError ?? error.message}</p>
      ) : null}
      <Button isLoading={isLoading} type="submit">Login</Button>
      <p className="auth-switch">
        New here? <Link to={ROUTES.SIGNUP}>Create an account</Link>
      </p>
    </form>
  );
};
