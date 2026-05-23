import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { userApi } from '../../api/userApi.js';
import { ROUTES } from '../../constants/app.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { deleteAccountSchema } from '../../validators/user.validator.js';
import { Button } from '../common/Button.jsx';
import { Input } from '../common/Input.jsx';
import { Modal } from '../common/Modal.jsx';

export const DeleteAccountDialog = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const clearSession = useAuthStore((state) => state.clearSession);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: '' },
  });

  // Clear the password each time the modal closes so it doesn't stick around
  // in memory or auto-fill on reopen.
  useEffect(() => {
    if (!isOpen) reset({ password: '' });
  }, [isOpen, reset]);

  const onDelete = async ({ password }) => {
    try {
      // Server clears auth cookies as part of the delete response, so we just
      // wipe local state and bounce to the public landing.
      await userApi.deleteAccount(password);
      clearSession();
      showToast({ message: 'Your account has been deleted', tone: 'success' });
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      setError('root', {
        message: error?.message ?? 'Could not delete your account. Please try again.',
      });
    }
  };

  return (
    <Modal
      description="This permanently removes your profile, symptom entries, AI summaries, and reports."
      isOpen={isOpen}
      onClose={() => (isSubmitting ? null : onClose?.())}
      title="Delete your account?"
      footer={
        <>
          <Button disabled={isSubmitting} onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            form="delete-account-form"
            icon={Trash2}
            isLoading={isSubmitting}
            type="submit"
            variant="danger"
          >
            Delete forever
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-3"
        id="delete-account-form"
        noValidate
        onSubmit={handleSubmit(onDelete)}
      >
        <Input
          autoComplete="current-password"
          error={errors.password?.message}
          label="Confirm with your password"
          required
          type="password"
          {...register('password')}
        />
        {errors.root ? (
          <p className="text-sm font-medium text-danger" role="alert">
            {errors.root.message}
          </p>
        ) : null}
      </form>
    </Modal>
  );
};
