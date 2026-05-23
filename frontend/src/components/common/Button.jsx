import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '../../utils/cn.js';

const buttonStyles = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium',
    'transition-all duration-150 ease-smooth select-none',
    'disabled:cursor-not-allowed disabled:opacity-60',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-contrast shadow-soft hover:bg-primary-strong active:translate-y-px',
        secondary:
          'bg-surface text-text border border-border hover:bg-surface-2 active:translate-y-px',
        ghost: 'bg-transparent text-muted hover:bg-surface-2 hover:text-text',
        danger:
          'bg-danger text-white shadow-soft hover:opacity-90 active:translate-y-px',
        ai: 'text-white bg-ai-grad shadow-glow hover:opacity-95 active:translate-y-px',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
        icon: 'h-9 w-9 px-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export const Button = forwardRef(
  (
    {
      as: Component = 'button',
      children,
      className,
      icon: Icon,
      iconRight: IconRight,
      isLoading = false,
      size,
      type = 'button',
      variant,
      ...props
    },
    ref,
  ) => {
    const disabled = isLoading || props.disabled;
    return (
      <Component
        className={cn(buttonStyles({ variant, size }), className)}
        disabled={disabled}
        ref={ref}
        type={Component === 'button' ? type : undefined}
        {...props}
      >
        {isLoading ? (
          <Loader2 aria-hidden="true" className="animate-spin" size={size === 'lg' ? 18 : 16} />
        ) : Icon ? (
          <Icon aria-hidden="true" size={size === 'lg' ? 18 : 16} strokeWidth={2} />
        ) : null}
        {children ? <span>{children}</span> : null}
        {IconRight && !isLoading ? (
          <IconRight aria-hidden="true" size={size === 'lg' ? 18 : 16} strokeWidth={2} />
        ) : null}
      </Component>
    );
  },
);

Button.displayName = 'Button';
