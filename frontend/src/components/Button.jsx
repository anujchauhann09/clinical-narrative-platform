import { classNames } from '../utils/classNames.js';

export const Button = ({
  as: Component = 'button',
  children,
  className,
  icon: Icon,
  isLoading = false,
  type = 'button',
  variant = 'primary',
  ...props
}) => (
  <Component
    className={classNames('button', `button--${variant}`, className)}
    disabled={isLoading || props.disabled}
    type={Component === 'button' ? type : undefined}
    {...props}
  >
    {Icon ? <Icon aria-hidden="true" size={18} strokeWidth={2} /> : null}
    <span>{isLoading ? 'Working...' : children}</span>
  </Component>
);
