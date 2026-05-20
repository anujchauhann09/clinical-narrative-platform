import { Link } from 'react-router-dom';

import { Button, Card } from '../components/index.js';
import { ROUTES } from '../constants/app.js';
import { useAuthStore } from '../store/authStore.js';

export const NotFoundPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const destination = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME;

  return (
    <div className="page page--centered">
      <Card className="not-found">
        <h1>Page not found</h1>
        <p>The page you opened is not part of this clinical workspace.</p>
        <Button as={Link} to={destination}>
          {isAuthenticated ? 'Back to overview' : 'Back to home'}
        </Button>
      </Card>
    </div>
  );
};
