import { REQUEST_STATUS } from '@/features/attendance/types/request-status';
import AttendanceCorrectionHistoryCard from './attendance-correction-history-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const attendanceCorrectionHistory = [
  {
    id: '01KCDA4EVY9Z77ASAEVDD8J2HE',
    date: '2025/01/04',
    time: '09:15 → 09:00',
    status: REQUEST_STATUS.APPROVED,
    reason: '電車の遅延により遅刻',
  },
  {
    id: '01KCDA4F0Q3S6RQ7ZDRBZG7BRJ',
    date: '2025/01/02',
    time: '09:30 → 09:00',
    status: REQUEST_STATUS.PENDING,
    reason: '打刻忘れ',
  },
  {
    id: '01KCDA4F54WTRWM359JYR87J0Z',
    date: '2025/01/01',
    time: '18:00 → 19:30',
    status: REQUEST_STATUS.REJECTED,
    reason: '理由が不明確',
  },
];

export default function AttendanceCorrectionHistory() {
  return (
    <div className="space-y-4">
      <Card className="mt-6 shadow-lg">
        <CardContent>
          <CardHeader>
            <CardTitle className="text-lg">申請履歴</CardTitle>
          </CardHeader>
          {attendanceCorrectionHistory.map((request) => (
            <AttendanceCorrectionHistoryCard key={request.id} {...request} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
