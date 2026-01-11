import { Module } from '@nestjs/common';
import { AttendanceRecordModule } from './attendance-record.module';
import { AttendanceCorrectionRequestController } from './controller/attendance-correction/attendance-correction-request-controller';
import { AttendanceCorrectionResubmitController } from './controller/attendance-correction/attendance-correction-resubmit-controller';
import { AttendanceCorrectionActionController } from './controller/attendance-correction/attendance-correction-action-controller';
import { ATTENDANCE_CORRECTION_REPOSITORY } from './domain/attendance-correction/attendance-correction.tokens';
import { AttendanceCorrectionRepositoryPrisma } from './infra/attendance-correction.repository.prisma';
import { ApproveAttendanceCorrectionUseCase } from './useCase/attendance-correction/approve-attendance-correction.use-case';
import { CancelAttendanceCorrectionUseCase } from './useCase/attendance-correction/cancel-attendance-correction.use-case';
import { RejectAttendanceCorrectionUseCase } from './useCase/attendance-correction/reject-attendance-correction.use-case';
import { RequestBreakEndAttendanceCorrectionUseCase } from './useCase/attendance-correction/request/request-break-end-attendance-correction.use-case';
import { RequestBreakStartAttendanceCorrectionUseCase } from './useCase/attendance-correction/request/request-break-start-attendance-correction.use-case';
import { RequestClockInAttendanceCorrectionUseCase } from './useCase/attendance-correction/request/request-clock-in-attendance-correction.use-case';
import { RequestClockOutAttendanceCorrectionUseCase } from './useCase/attendance-correction/request/request-clock-out-attendance-correction.use-case';
import { ResubmitBreakEndAttendanceCorrectionUseCase } from './useCase/attendance-correction/resubmit/resubmit-break-end-attendance-correction.use-case';
import { ResubmitBreakStartAttendanceCorrectionUseCase } from './useCase/attendance-correction/resubmit/resubmit-break-start-attendance-correction.use-case';
import { ResubmitClockInAttendanceCorrectionUseCase } from './useCase/attendance-correction/resubmit/resubmit-clock-in-attendance-correction.use-case';
import { ResubmitClockOutAttendanceCorrectionUseCase } from './useCase/attendance-correction/resubmit/resubmit-clock-out-attendance-correction.use-case';

@Module({
  imports: [AttendanceRecordModule],
  controllers: [
    AttendanceCorrectionRequestController,
    AttendanceCorrectionResubmitController,
    AttendanceCorrectionActionController,
  ],
  providers: [
    RequestClockInAttendanceCorrectionUseCase,
    RequestClockOutAttendanceCorrectionUseCase,
    RequestBreakStartAttendanceCorrectionUseCase,
    RequestBreakEndAttendanceCorrectionUseCase,
    ResubmitClockInAttendanceCorrectionUseCase,
    ResubmitClockOutAttendanceCorrectionUseCase,
    ResubmitBreakStartAttendanceCorrectionUseCase,
    ResubmitBreakEndAttendanceCorrectionUseCase,
    ApproveAttendanceCorrectionUseCase,
    RejectAttendanceCorrectionUseCase,
    CancelAttendanceCorrectionUseCase,
    {
      provide: ATTENDANCE_CORRECTION_REPOSITORY,
      useClass: AttendanceCorrectionRepositoryPrisma,
    },
  ],
})
export class AttendanceCorrectionModule {}
