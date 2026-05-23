import { motion } from 'framer-motion';
import { Mail, Pencil, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { Container, PageHeader } from '../components/layout/PageHeader.jsx';
import { DeleteAccountDialog } from '../components/profile/DeleteAccountDialog.jsx';
import { ProfileDetailRow } from '../components/profile/ProfileDetailRow.jsx';
import { ProfileEditForm } from '../components/profile/ProfileEditForm.jsx';
import { dateService } from '../services/dateService.js';
import { pageFadeRise } from '../services/motions.js';
import { useAuthStore } from '../store/authStore.js';

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

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const profile = user?.profile ?? {};
  const displayName = profile?.name ?? user?.email ?? 'Patient';
  const initials = initialsFor(profile?.name ?? user?.email);

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
          <ProfileEditForm profile={profile} onDone={() => setIsEditing(false)} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <Card.Header>
                <Card.Title as="h3">Contact</Card.Title>
              </Card.Header>
              <Card.Body className="flex flex-col gap-3">
                <ProfileDetailRow icon={Mail} label="Email" value={user?.email} />
                <ProfileDetailRow icon={UserRound} label="Phone" value={profile.phone} />
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title as="h3">Personal</Card.Title>
              </Card.Header>
              <Card.Body className="flex flex-col gap-3">
                <ProfileDetailRow
                  label="Date of birth"
                  value={dateService.formatDate(profile.dateOfBirth)}
                />
                <ProfileDetailRow label="Sex" value={profile.sex} />
                <ProfileDetailRow label="Role" value={formatRole(user?.role)} />
                <ProfileDetailRow
                  label="Member since"
                  value={dateService.formatDate(user?.createdAt)}
                />
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
          <Card.Pad
            padding="sm"
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
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

      <DeleteAccountDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} />
    </Container>
  );
};
