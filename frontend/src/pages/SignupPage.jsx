import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { Button, Input } from '../components/index.js';
import { authApi } from '../api/authApi.js';
import { ROUTES } from '../constants/app.js';
import { useAsyncAction } from '../hooks/useAsyncAction.js';
import { useAuthStore } from '../store/authStore.js';
import { signupSchema } from '../validators/auth.validator.js';

export const SignupPage = () => {
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState(null);
  const { execute, error, isLoading } = useAsyncAction(authApi.signup);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const parsedPayload = signupSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!parsedPayload.success) {
      setValidationError(parsedPayload.error.issues[0]?.message ?? 'Please check your signup details');
      return;
    }

    setValidationError(null);
    const payload = parsedPayload.data;
    await execute(payload);

    navigate(ROUTES.LOGIN, { state: { message: 'Registration successful. Please log in.' } });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Start your timeline</p>
        <h1>Create account</h1>
      </div>
      <Input autoComplete="name" id="name" label="Name" name="name" />
      <Input autoComplete="email" id="email" label="Email" name="email" type="email" />
      <Input autoComplete="new-password" id="password" label="Password" name="password" type="password" />
      {validationError || error ? (
        <p className="form-error">{validationError ?? error.message}</p>
      ) : null}
      <Button isLoading={isLoading} type="submit">Create account</Button>
      <p className="auth-switch">
        Already have an account? <Link to={ROUTES.LOGIN}>Login</Link>
      </p>
    </form>
  );
};
