import { TableCell, TableRow } from '@/components/ui/table';
import type { RequestStatus } from '../types/request-status';
import { RequestStatusBadge } from './request-status-badge';

type AttendanceRecord = {
  id: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hours: string;
  requestStatus: RequestStatus | null;
};

type AttendanceRowProps = {
  readonly record: AttendanceRecord;
};

export const AttendanceRow = ({ record }: AttendanceRowProps) => {
  const { date, clockIn, clockOut, hours, requestStatus } = record;

  return (
    <TableRow>
      <TableCell className="font-medium">{date}</TableCell>
      <TableCell>{clockIn}</TableCell>
      <TableCell>{clockOut}</TableCell>
      <TableCell>{hours}</TableCell>
      <TableCell>
        <RequestStatusBadge status={requestStatus} />
      </TableCell>
    </TableRow>
  );
};
