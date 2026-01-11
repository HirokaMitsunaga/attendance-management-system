import { Module } from '@nestjs/common';
import { AttendanceCorrectionRequestController } from './controller/attendance-correction/attendance-correction-request-controller';
import { ATTENDANCE_CORRECTION_REPOSITORY } from './domain/attendance-correction/attendance-correction.tokens';
import { AttendanceCorrectionRepositoryPrisma } from './infra/attendance-correction.repository.prisma';
import { RequestBreakEndAttendanceCorrectionUseCase } from './useCase/attendance-correction/request/request-break-end-attendance-correction.use-case';
import { RequestBreakStartAttendanceCorrectionUseCase } from './useCase/attendance-correction/request/request-break-start-attendance-correction.use-case';
import { RequestClockInAttendanceCorrectionUseCase } from './useCase/attendance-correction/request/request-clock-in-attendance-correction.use-case';
import { RequestClockOutAttendanceCorrectionUseCase } from './useCase/attendance-correction/request/request-clock-out-attendance-correction.use-case';

@Module({
  controllers: [AttendanceCorrectionRequestController],
  providers: [
    RequestClockInAttendanceCorrectionUseCase,
    RequestClockOutAttendanceCorrectionUseCase,
    RequestBreakStartAttendanceCorrectionUseCase,
    RequestBreakEndAttendanceCorrectionUseCase,
    {
      provide: ATTENDANCE_CORRECTION_REPOSITORY,
      useClass: AttendanceCorrectionRepositoryPrisma,
    },
  ],
})
export class AttendanceCorrectionModule {}
