import { DomainError } from '../../../common/errors/domain.error';
import { AttendanceStatus } from './attendance-status';

/**
 * 勤怠記録の状態が不正で操作できない場合のエラー
 */
export class InvalidWorkRecordStateError extends DomainError {
  constructor({
    operation,
    currentStatus,
  }: {
    operation: string;
    currentStatus: AttendanceStatus;
  }) {
    super(`${operation}ができません。現在のステータス: ${currentStatus}`);
    this.name = 'InvalidWorkRecordStateError';
  }
}
