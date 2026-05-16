import { useCallback, useState } from 'react';

export const useAsyncAction = (action) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);

      try {
        return await action(...args);
      } catch (caughtError) {
        setError(caughtError);
        throw caughtError;
      } finally {
        setIsLoading(false);
      }
    },
    [action],
  );

  return { execute, isLoading, error };
};
