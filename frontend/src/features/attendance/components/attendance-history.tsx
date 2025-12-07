import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { REQUEST_STATUS } from '../types/request-status';
import { AttendanceRow } from './attendance-row';

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
const columns = [
  { header: '日付', accessor: 'date' },
  { header: '出勤', accessor: 'clockIn' },
  { header: '退勤', accessor: 'clockOut' },
  { header: '勤務時間', accessor: 'hours' },
  { header: '修正ステータス', accessor: 'requestStatus' },
];

export const AttendanceHistory = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>最近の勤怠履歴</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.accessor}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceHistory.map((record) => (
                <AttendanceRow key={record.id} record={record} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
