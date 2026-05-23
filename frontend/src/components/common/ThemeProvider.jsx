import { useTheme } from '../../hooks/useTheme.js';

export const ThemeProvider = ({ children }) => {
  // The hook applies the html.dark class as a side-effect; no provider value needed.
  useTheme();
  return children;
};
