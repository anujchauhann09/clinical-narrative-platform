import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { Toast } from '../components/Toast.jsx';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((nextToast) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), nextToast.duration ?? 3500);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <Toast tone={toast.tone}>{toast.message}</Toast> : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
};
