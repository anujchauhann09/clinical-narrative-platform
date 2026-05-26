import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { authApi } from '../api/authApi.js';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { ROUTES } from '../constants/app.js';
import { signupSchema } from '../validators/auth.validator.js';

export const SignupPage = () => {
  const navigate = useNavigate();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values) => {
    try {
      await authApi.signup(values);
      navigate(ROUTES.LOGIN, { state: { message: 'Account created. Sign in to begin tracking.' } });
    } catch (error) {
      setError('root', { message: error?.message ?? 'Sign up failed. Please try again.' });
    }
  };

  return (
    <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <header className="flex flex-col gap-1">
        <p className="inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-[0.14em] text-primary">
          <Sparkles aria-hidden="true" size={12} /> Start your timeline
        </p>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-text">Create your account</h1>
        <p className="text-sm text-muted">
          Log symptoms, generate AI-assisted narratives, and download clinician-ready reports.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <Input
          autoComplete="name"
          error={errors.name?.message}
          label="Full name"
          required
          {...register('name')}
        />
        <Input
          autoComplete="email"
          error={errors.email?.message}
          label="Email"
          required
          type="email"
          {...register('email')}
        />
        <Input
          autoComplete="new-password"
          error={errors.password?.message}
          hint="Use at least 8 characters."
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

      <Button icon={UserPlus} isLoading={isSubmitting} size="lg" type="submit">
        Create account
      </Button>

      <div className="flex items-center gap-3" role="separator">
        <span className="h-px flex-1 bg-border" />
        <span className="text-2xs font-medium uppercase tracking-wider text-muted">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton label="Sign up with Google" />

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link className="font-medium text-primary hover:text-primary-strong" to={ROUTES.LOGIN}>
          Sign in
        </Link>
      </p>
    </form>
  );
};
