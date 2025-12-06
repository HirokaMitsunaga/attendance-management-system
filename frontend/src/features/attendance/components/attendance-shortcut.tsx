import { FileEdit, Calculator, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const AttendanceShortcut = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground">
        ショートカット
      </h2>
      <div className="flex flex-col gap-3">
        <Card className="group cursor-pointer shadow-md transition-all hover:shadow-lg hover:ring-1 hover:ring-ring">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileEdit className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">勤怠修正申請</p>
              <p className="text-sm text-muted-foreground">打刻時間を修正</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer shadow-md transition-all hover:shadow-lg hover:ring-1 hover:ring-ring">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">工数入力</p>
              <p className="text-sm text-muted-foreground">
                プロジェクト工数を登録
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group cursor-pointer shadow-md transition-all hover:shadow-lg hover:ring-1 hover:ring-ring">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">有給申請</p>
              <p className="text-sm text-muted-foreground">休暇の申請</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
