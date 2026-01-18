import { Module } from '@nestjs/common';
import { AttendanceRecordDaoPrisma } from './dao/attendance-record.dao.prisma';
import { ATTENDANCE_RECORD_DAO } from './usecase/attendance-record/attendance-record-dao.tokens';
import { GetAttendanceRecordUseCase } from './usecase/attendance-record/get-attendance-record.use-case';
import { AttendanceRecordController } from './controller/attendance-record-controller';

@Module({
  controllers: [AttendanceRecordController],
  providers: [
    GetAttendanceRecordUseCase,
    {
      provide: ATTENDANCE_RECORD_DAO,
      useClass: AttendanceRecordDaoPrisma,
    },
  ],
  exports: [ATTENDANCE_RECORD_DAO],
})
export class AttendanceRecordModule {}
