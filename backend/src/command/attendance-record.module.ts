import { Module } from '@nestjs/common';
import { AttendanceRecordController } from './controller/attendance-record/attendance-record-controller';
import { ATTENDANCE_RECORD_REPOSITORY } from './domain/attendance-record/attendance-record.tokens';
import { AttendanceRecordRepositoryPrisma } from './infra/attendance-record.repository.prisma';
import { ClockInAttendanceRecordUseCase } from './useCase/attendance-record/clock-in-attendance-record.use-case';

@Module({
  controllers: [AttendanceRecordController],
  providers: [
    ClockInAttendanceRecordUseCase,
    {
      provide: ATTENDANCE_RECORD_REPOSITORY,
      useClass: AttendanceRecordRepositoryPrisma,
    },
  ],
})
export class AttendanceRecordModule {}
