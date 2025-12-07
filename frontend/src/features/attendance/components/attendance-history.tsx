import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { REQUEST_STATUS, RequestStatus } from '../types/request-status';
import { EmptyValue } from '@/components/ui/empty-value';

const attendanceHistory = [
  {
    id: '01JGXM8K2PQRSTUVWXYZ123456',
    date: '2025/01/05',
    clockIn: '09:00',
    clockOut: '18:05',
    hours: '8時間05分',
    requestStatus: null,
  },
  {
    id: '01JGXM7N3QABCDEFGHIJK78901',
    date: '2025/01/04',
    clockIn: '09:15',
    clockOut: '18:30',
    hours: '8時間15分',
    requestStatus: REQUEST_STATUS.APPROVED,
  },
  {
    id: '01JGXM6P4RLMNOPQRSTUVWX234',
    date: '2025/01/03',
    clockIn: '08:55',
    clockOut: '17:50',
    hours: '7時間55分',
    requestStatus: null,
  },
  {
    id: '01JGXM5Q5SYZABCDEFGHIJK567',
    date: '2025/01/02',
    clockIn: '09:30',
    clockOut: '18:00',
    hours: '7時間30分',
    requestStatus: REQUEST_STATUS.PENDING,
  },
  {
    id: '01JGXM4R6TKLMNOPQRSTUVWX890',
    date: '2025/01/01',
    clockIn: '09:00',
    clockOut: '18:00',
    hours: '8時間00分',
    requestStatus: REQUEST_STATUS.REJECTED,
  },
];

function RequestStatusBadge({ status }: { status: RequestStatus }) {
  if (!status) return <EmptyValue />;
  const variants = {
    申請中: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
    承認: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
    却下: 'bg-destructive/15 text-destructive border-destructive/20',
  };
  return (
    <Badge variant="outline" className={`${variants[status]} font-medium`}>
      {status}
    </Badge>
  );
}

export const AttendanceHistory = () => {
  return (
    <div>
      {' '}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>最近の勤怠履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>出勤</TableHead>
                  <TableHead>退勤</TableHead>
                  <TableHead>勤務時間</TableHead>
                  <TableHead>修正申請</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.date}</TableCell>
                    <TableCell>{record.clockIn}</TableCell>
                    <TableCell>{record.clockOut}</TableCell>
                    <TableCell>{record.hours}</TableCell>
                    <TableCell>
                      <RequestStatusBadge status={record.requestStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
