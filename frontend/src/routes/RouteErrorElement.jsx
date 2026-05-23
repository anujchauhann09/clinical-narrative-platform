import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { Button } from '../components/common/Button.jsx';
import { ROUTES } from '../constants/app.js';


export const RouteErrorElement = () => {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : null;
  const message =
    (isRouteErrorResponse(error) ? error.statusText : error?.message) ??
    'This page failed to load.';

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle aria-hidden="true" size={22} />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-lg font-semibold tracking-tight text-text">
            {status ? `Couldn't load this page (${status})` : "Couldn't load this page"}
          </h1>
          <p className="m-0 text-sm leading-relaxed text-muted">{message}</p>
        </div>
        <div className="flex gap-2">
          <Button
            icon={RefreshCw}
            onClick={() => window.location.reload()}
            variant="secondary"
          >
            Reload
          </Button>
          <Button as={Link} icon={ArrowLeft} to={ROUTES.DASHBOARD} variant="primary">
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
