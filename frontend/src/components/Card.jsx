import { classNames } from '../utils/classNames.js';

export const Card = ({ children, className }) => (
  <section className={classNames('card', className)}>{children}</section>
);
