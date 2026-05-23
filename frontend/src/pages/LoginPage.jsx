import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { authApi } from '../api/authApi.js';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { ROUTES } from '../constants/app.js';
import { useAuthStore } from '../store/authStore.js';
import { loginSchema } from '../validators/auth.validator.js';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    try {
      const response = await authApi.login(values);
      setSession({ user: response.data.user });
      navigate(location.state?.from?.pathname ?? ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      setError('root', { message: error?.message ?? 'Login failed. Please try again.' });
    }
  };

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <header className="flex flex-col gap-1">
        <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-primary">Welcome back</p>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-text">Sign in to your account</h1>
        <p className="text-sm text-muted">
          Securely access your clinical timeline, AI summaries, and reports.
        </p>
      </header>

      {location.state?.message ? (
        <div
          aria-live="polite"
          className="flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          <CheckCircle2 aria-hidden="true" className="mt-0.5" size={16} />
          <span>{location.state.message}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <Input
          autoComplete="email"
          error={errors.email?.message}
          label="Email"
          required
          type="email"
          {...register('email')}
        />
        <Input
          autoComplete="current-password"
          error={errors.password?.message}
          label="Password"
          required
          type="password"
          {...register('password')}
        />
      </div>

      {errors.root ? (
        <p className="text-sm font-medium text-danger" role="alert">
          {errors.root.message}
        </p>
      ) : null}

      <Button icon={LogIn} isLoading={isSubmitting} size="lg" type="submit">
        Sign in
      </Button>

      <p className="text-center text-sm text-muted">
        New here?{' '}
        <Link className="font-medium text-primary hover:text-primary-strong" to={ROUTES.SIGNUP}>
          Create an account
        </Link>
      </p>
    </form>
  );
};
