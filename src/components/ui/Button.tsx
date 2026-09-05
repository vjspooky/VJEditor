import { cx } from '@/utils/cx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-app hover:bg-accent-hover font-medium',
  secondary:
    'bg-panel-hover text-fg border border-border hover:border-border-strong',
  ghost: 'text-muted hover:text-fg hover:bg-panel-hover',
  danger: 'text-danger hover:bg-danger/10',
  subtle: 'bg-accent-soft text-accent hover:bg-accent/20',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-9 px-3.5 text-sm rounded-lg',
  lg: 'h-11 px-5 text-sm rounded-xl',
  icon: 'h-8 w-8 rounded-lg p-0 inline-flex items-center justify-center',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
