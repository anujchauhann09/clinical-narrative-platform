import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { userApi } from '../../api/userApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { dateService } from '../../services/dateService.js';
import { useAuthStore } from '../../store/authStore.js';
import { updateProfileSchema } from '../../validators/user.validator.js';
import { Button } from '../common/Button.jsx';
import { Card } from '../common/Card.jsx';
import { Input, Textarea } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';

const SEX_OPTIONS = ['Female', 'Male', 'Non-binary', 'Prefer not to say', 'Other'];

const toIsoDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

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

export const ProfileEditForm = ({ profile, onDone }) => {
  const setSession = useAuthStore((state) => state.setSession);
  const { showToast } = useToast();

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

  const onSubmit = async (values) => {
    const diff = buildDiff(values, defaults);
    if (Object.keys(diff).length === 0) {
      onDone?.();
      return;
    }
    try {
      const response = await userApi.updateProfile(diff);
      setSession({ user: response.data.user });
      showToast({ message: 'Profile updated', tone: 'success' });
      onDone?.();
    } catch (error) {
      setError('root', {
        message: error?.message ?? 'Could not update your profile. Please try again.',
      });
    }
  };

  return (
    <Card>
      <Card.Header>
        <div>
          <Card.Title as="h3">Edit profile</Card.Title>
          <Card.Subtitle>Update the details we use on your clinical narrative.</Card.Subtitle>
        </div>
      </Card.Header>
      <Card.Body>
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit(onSubmit)}>
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
              max={dateService.todayYyyyMmDd()}
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
              onClick={() => {
                reset(defaults);
                onDone?.();
              }}
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button disabled={!isDirty} icon={Save} isLoading={isSubmitting} type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
};
