import { PageHeader } from '../../../components/layout/page-header';
import { AttendanceInfo } from './attendance-info';
import { AttendanceHistory } from './attendance-history';
import { AttendanceShortcut } from './attendance-shortcut';

export default function AttendanceDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="勤怠ダッシュボード" />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AttendanceInfo />
          </div>
          <AttendanceShortcut />
        </div>
        <AttendanceHistory />
      </main>
    </div>
  );
}
