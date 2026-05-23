import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Pencil, Save, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { userApi } from '../api/userApi.js';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { Input, Textarea } from '../components/common/Input.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Select } from '../components/common/Select.jsx';
import { Container, PageHeader } from '../components/layout/PageHeader.jsx';
import { ROUTES } from '../constants/app.js';
import { useToast } from '../context/ToastContext.jsx';
import { pageFadeRise } from '../services/motions.js';
import { useAuthStore } from '../store/authStore.js';
import { deleteAccountSchema, updateProfileSchema } from '../validators/user.validator.js';

const initialsFor = (value) => {
  if (!value) return 'U';
  const parts = String(value).trim().split(/[\s@]+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const formatRole = (role) => {
  if (!role) return 'Patient';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { dateStyle: 'long' });
};

const toIsoDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const SEX_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Other'];

const buildDefaults = (profile) => ({
  name: profile?.name ?? '',
  bio: profile?.bio ?? '',
  dateOfBirth: toIsoDateInput(profile?.dateOfBirth),
  sex: profile?.sex ?? '',
  phone: profile?.phone ?? '',
});

const buildDiff = (values, original) => {
  const diff = {};
  for (const key of Object.keys(values)) {
    const next = values[key] ?? null;
    const prev = original[key] === '' ? null : original[key] ?? null;
    if (next !== prev) {
      diff[key] = next === '' ? null : next;
    }
  }
  return diff;
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const profile = user?.profile ?? {};
  const displayName = profile?.name ?? user?.email ?? 'Patient';
  const initials = initialsFor(profile?.name ?? user?.email);
  const defaults = buildDefaults(profile);

  const {
    formState: { errors, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: defaults,
    values: defaults,
  });

  const {
    formState: { errors: deleteErrors, isSubmitting: isDeleting },
    handleSubmit: handleDeleteSubmit,
    register: registerDelete,
    reset: resetDelete,
    setError: setDeleteError,
  } = useForm({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: '' },
  });

  useEffect(() => {
    if (!isDeleteOpen) resetDelete({ password: '' });
  }, [isDeleteOpen, resetDelete]);

  const handleCancel = () => {
    reset(defaults);
    setIsEditing(false);
  };

  const onSubmit = async (values) => {
    const diff = buildDiff(values, defaults);
    if (Object.keys(diff).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      const response = await userApi.updateProfile(diff);
      setSession({ user: response.data.user });
      showToast({ message: 'Profile updated', tone: 'success' });
      setIsEditing(false);
    } catch (error) {
      setError('root', {
        message: error?.message ?? 'Could not update your profile. Please try again.',
      });
    }
  };

  const onDelete = async ({ password }) => {
    try {
      // Server clears auth cookies as part of the delete response, so we just
      // wipe local state and bounce to the public landing.
      await userApi.deleteAccount(password);
      clearSession();
      showToast({ message: 'Your account has been deleted', tone: 'success' });
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      setDeleteError('root', {
        message: error?.message ?? 'Could not delete your account. Please try again.',
      });
    }
  };

  return (
    <Container maxWidth="4xl">
      <motion.div className="flex flex-col gap-5 md:gap-6" {...pageFadeRise}>
        <PageHeader
          actions={
            !isEditing ? (
              <Button icon={Pencil} onClick={() => setIsEditing(true)} variant="secondary">
                Edit profile
              </Button>
            ) : null
          }
          description="The information clinicians and reports use to identify you."
          eyebrow="Account"
          title="Profile"
        />

        <Card>
          <Card.Pad padding="sm" className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ai-grad text-[15px] font-semibold leading-none text-white shadow-glow"
            >
              {initials}
            </span>
            <div className="flex min-w-0 flex-col">
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="m-0 truncate text-[15px] font-semibold leading-tight tracking-tight text-text">
                  {displayName}
                </h2>
                <Badge className="shrink-0" icon={ShieldCheck} tone="success">
                  {formatRole(user?.role)}
                </Badge>
              </div>
              <p className="m-0 mt-1 truncate text-[13px] leading-tight text-muted">
                {user?.email}
              </p>
            </div>
          </Card.Pad>
        </Card>

        {isEditing ? (
          <Card>
            <Card.Header>
              <div>
                <Card.Title as="h3">Edit profile</Card.Title>
                <Card.Subtitle>Update the details we use on your clinical narrative.</Card.Subtitle>
              </div>
            </Card.Header>
            <Card.Body>
              <form
                className="flex flex-col gap-4"
                noValidate
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    autoComplete="name"
                    error={errors.name?.message}
                    label="Full name"
                    required
                    {...register('name')}
                  />
                  <Input
                    autoComplete="tel"
                    error={errors.phone?.message}
                    label="Phone"
                    placeholder="+1 555 123 4567"
                    {...register('phone')}
                  />
                  <Input
                    error={errors.dateOfBirth?.message}
                    label="Date of birth"
                    type="date"
                    {...register('dateOfBirth')}
                  />
                  <Select
                    error={errors.sex?.message}
                    label="Sex"
                    placeholder="Select…"
                    {...register('sex')}
                  >
                    {SEX_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>

                <Textarea
                  error={errors.bio?.message}
                  hint="A short note clinicians may use for context."
                  label="Bio"
                  rows={4}
                  {...register('bio')}
                />

                {errors.root ? (
                  <p className="text-sm font-medium text-danger" role="alert">
                    {errors.root.message}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <Button
                    icon={X}
                    onClick={handleCancel}
                    type="button"
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    icon={Save}
                    isLoading={isSubmitting}
                    disabled={!isDirty}
                    type="submit"
                  >
                    Save changes
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <Card.Header>
                <Card.Title as="h3">Contact</Card.Title>
              </Card.Header>
              <Card.Body className="flex flex-col gap-3">
                <DetailRow icon={Mail} label="Email" value={user?.email} />
                <DetailRow icon={UserRound} label="Phone" value={profile.phone} />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title as="h3">Personal</Card.Title>
              </Card.Header>
              <Card.Body className="flex flex-col gap-3">
                <DetailRow label="Date of birth" value={formatDate(profile.dateOfBirth)} />
                <DetailRow label="Sex" value={profile.sex} />
                <DetailRow label="Role" value={formatRole(user?.role)} />
                <DetailRow label="Member since" value={formatDate(user?.createdAt)} />
              </Card.Body>
            </Card>

            <Card className="md:col-span-2">
              <Card.Header>
                <Card.Title as="h3">Bio</Card.Title>
              </Card.Header>
              <Card.Body>
                <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-text">
                  {profile.bio?.trim()
                    ? profile.bio
                    : 'No bio yet — add a short note to give clinicians extra context.'}
                </p>
              </Card.Body>
            </Card>
          </div>
        )}

        <Card className="border-danger/30">
          <Card.Pad padding="sm" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h3 className="m-0 text-sm font-semibold tracking-tight text-danger">Danger zone</h3>
              <p className="m-0 mt-1 text-[13px] leading-relaxed text-muted">
                Permanently delete your account and all symptom history. This cannot be undone.
              </p>
            </div>
            <Button
              className="shrink-0"
              icon={Trash2}
              onClick={() => setIsDeleteOpen(true)}
              size="sm"
              variant="danger"
            >
              Delete account
            </Button>
          </Card.Pad>
        </Card>
      </motion.div>

      <Modal
        description="This permanently removes your profile, symptom entries, AI summaries, and reports."
        isOpen={isDeleteOpen}
        onClose={() => (isDeleting ? null : setIsDeleteOpen(false))}
        title="Delete your account?"
        footer={
          <>
            <Button
              disabled={isDeleting}
              onClick={() => setIsDeleteOpen(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              form="delete-account-form"
              icon={Trash2}
              isLoading={isDeleting}
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
          onSubmit={handleDeleteSubmit(onDelete)}
        >
          <Input
            autoComplete="current-password"
            error={deleteErrors.password?.message}
            label="Confirm with your password"
            required
            type="password"
            {...registerDelete('password')}
          />
          {deleteErrors.root ? (
            <p className="text-sm font-medium text-danger" role="alert">
              {deleteErrors.root.message}
            </p>
          ) : null}
        </form>
      </Modal>
    </Container>
  );
};

const DetailRow = ({ icon: Icon, label, mono, value }) => (
  <div className="flex items-start gap-3">
    {Icon ? (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon aria-hidden="true" size={16} />
      </span>
    ) : (
      <span aria-hidden="true" className="h-9 w-9 shrink-0" />
    )}
    <div className="min-w-0">
      <p className="m-0 text-2xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p
        className={
          mono
            ? 'm-0 truncate font-mono text-xs text-text'
            : 'm-0 truncate text-sm text-text'
        }
      >
        {value || '—'}
      </p>
    </div>
  </div>
);
