import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component } from 'react';

import { Button } from './Button.jsx';

const initialState = { error: null };

const FallbackUI = ({ onReset }) => (
  <div className="flex min-h-[60vh] w-full items-center justify-center px-6">
    <div className="flex max-w-md flex-col items-center gap-4 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle aria-hidden="true" size={22} />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-lg font-semibold tracking-tight text-text">
          Something went wrong
        </h1>
        <p className="m-0 text-sm leading-relaxed text-muted">
          The page hit an unexpected error and stopped rendering. Your data is
          safe — reloading or returning to the dashboard should get you going
          again. If this keeps happening, please report it.
        </p>
      </div>
      <div className="flex gap-2">
        <Button icon={RefreshCw} onClick={onReset} variant="secondary">
          Try again
        </Button>
        <Button as="a" href="/dashboard" variant="primary">
          Go to dashboard
        </Button>
      </div>
    </div>
  </div>
);


export class ErrorBoundary extends Component {
  state = initialState;

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState(initialState);
  };

  render() {
    if (this.state.error) {
      const { fallback: Fallback } = this.props;
      if (Fallback) {
        return <Fallback error={this.state.error} onReset={this.handleReset} />;
      }
      return <FallbackUI onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}
