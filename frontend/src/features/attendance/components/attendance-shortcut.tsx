// frontend/src/features/attendance/components/attendance-shortcut.tsx
import { FileEdit, Calculator, CalendarDays } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ShortcutCard } from './shortcut-card';

type ShortcutItem = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
};

const shortcutItems: ShortcutItem[] = [
  {
    id: 'attendance-correction',
    icon: FileEdit,
    title: '勤怠修正申請',
    description: '打刻時間を修正',
    href: '/attendance/correction',
  },
  {
    id: 'work-hours-input',
    icon: Calculator,
    title: '工数入力',
    description: 'プロジェクト工数を登録',
    href: '/work-hours',
  },
  {
    id: 'leave-request',
    icon: CalendarDays,
    title: '有給申請',
    description: '休暇の申請',
    href: '/leave/request',
  },
];

export const AttendanceShortcut = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground">
        ショートカット
      </h2>
      <div className="flex flex-col gap-3">
        {shortcutItems.map((item) => (
          <ShortcutCard
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
            href={item.href}
          />
        ))}
      </div>
    </div>
  );
};
