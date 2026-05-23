import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { ROUTES } from '../constants/app.js';
import { useAuthStore } from '../store/authStore.js';

export const NotFoundPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const destination = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-surface-grad"
      />
      <Card className="w-full max-w-md">
        <Card.Body className="flex flex-col items-center gap-4 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Compass aria-hidden="true" size={22} />
          </span>
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-primary">404</p>
            <h1 className="m-0 mt-1 text-2xl font-semibold tracking-tight text-text">Page not found</h1>
            <p className="mt-2 text-sm text-muted">
              The page you opened isn't part of this clinical workspace.
            </p>
          </div>
          <Button as={Link} icon={ArrowLeft} to={destination}>
            {isAuthenticated ? 'Back to overview' : 'Back to home'}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};
