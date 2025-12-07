// frontend/src/features/attendance/components/shortcut-card.tsx
import type { LucideIcon } from 'lucide-react';

type ShortcutCardProps = {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
};

export const ShortcutCard = ({
  icon: Icon,
  title,
  description,
}: ShortcutCardProps) => {
  return (
    <div
      className="group cursor-pointer rounded-lg border bg-card text-card-foreground shadow-md transition-all hover:shadow-lg hover:ring-1 hover:ring-ring"
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};
