import { Link } from 'react-router-dom';

import { Button, Card } from '../components/index.js';
import { ROUTES } from '../constants/app.js';

export const NotFoundPage = () => (
  <div className="page page--centered">
    <Card className="not-found">
      <h1>Page not found</h1>
      <p>The page you opened is not part of this clinical workspace.</p>
      <Button as={Link} to={ROUTES.HOME}>Back to overview</Button>
    </Card>
  </div>
);
