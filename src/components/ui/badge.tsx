import * as React from 'react';
import { cn } from '../../lib/cn';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary';
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variant === 'default'
          ? 'border-transparent bg-primary/20 text-primary-foreground'
          : 'border-border bg-secondary/60 text-muted-foreground',
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';
