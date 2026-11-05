import { cx } from '@/utils/cx';
import { Link } from 'react-router-dom';

export function Logo({
  compact = false,
  to = '/',
  className,
}: {
  compact?: boolean;
  to?: string;
  className?: string;
}) {
  return (
    <Link to={to} className={cx('flex items-center gap-2.5 no-underline', className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-app text-[13px] font-bold tracking-tight">
        VJ
      </span>
      {!compact ? (
        <span className="text-[15px] font-semibold tracking-tight text-fg">
          VJEditor
        </span>
      ) : null}
    </Link>
  );
}
