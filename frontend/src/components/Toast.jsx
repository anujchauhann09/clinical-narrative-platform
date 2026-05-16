import { classNames } from '../utils/classNames.js';

export const Toast = ({ children, tone = 'neutral' }) => (
  <div className={classNames('toast', `toast--${tone}`)} role="status">
    {children}
  </div>
);
