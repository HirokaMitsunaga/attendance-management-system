import { Module } from '@nestjs/common';
import { ATTENDANCE_RULE_REPOSITORY } from './domain/attendance-rule/attendance-rule.tokens';
import { AttendanceRuleRepositoryPrisma } from './infra/attendance-rule.repository.prisma';
import { CreateAttendanceRuleUseCase } from './useCase/attendance-rule/create-attendance-rule.use-case';
import { UpdateAttendanceRuleUseCase } from './useCase/attendance-rule/update-attendance-rule.use-case';
import { DeleteAttendanceRuleUseCase } from './useCase/attendance-rule/delete-attendance-rule.use-case';
import { AttendanceRuleController } from './controller/attendance-rule/attendance-rule-controller';

@Module({
  controllers: [AttendanceRuleController],
  providers: [
    CreateAttendanceRuleUseCase,
    UpdateAttendanceRuleUseCase,
    DeleteAttendanceRuleUseCase,
    {
      provide: ATTENDANCE_RULE_REPOSITORY,
      useClass: AttendanceRuleRepositoryPrisma,
    },
  ],
  exports: [
    CreateAttendanceRuleUseCase,
    UpdateAttendanceRuleUseCase,
    DeleteAttendanceRuleUseCase,
    ATTENDANCE_RULE_REPOSITORY,
  ],
})
export class AttendanceRuleModule {}
