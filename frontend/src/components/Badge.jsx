import { classNames } from '../utils/classNames.js';

export const Badge = ({ children, tone = 'neutral' }) => (
  <span className={classNames('badge', `badge--${tone}`)}>{children}</span>
);
