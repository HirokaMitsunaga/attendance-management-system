import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  createAttendanceRuleRequestSchema,
  updateAttendanceRuleRequestSchema,
  type CreateAttendanceRuleRequestDto,
  type UpdateAttendanceRuleRequestDto,
} from '../../request/attendanceRuleRequest';
import { CreateAttendanceRuleUseCase } from '../../useCase/attendance-rule/create-attendance-rule.use-case';
import { UpdateAttendanceRuleUseCase } from '../../useCase/attendance-rule/update-attendance-rule.use-case';
import { DeleteAttendanceRuleUseCase } from '../../useCase/attendance-rule/delete-attendance-rule.use-case';

@Controller('attendance-rule')
export class AttendanceRuleController {
  constructor(
    private readonly createAttendanceRuleUseCase: CreateAttendanceRuleUseCase,
    private readonly updateAttendanceRuleUseCase: UpdateAttendanceRuleUseCase,
    private readonly deleteAttendanceRuleUseCase: DeleteAttendanceRuleUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async create(
    @Body(new ZodValidationPipe(createAttendanceRuleRequestSchema))
    body: CreateAttendanceRuleRequestDto,
  ): Promise<void> {
    await this.createAttendanceRuleUseCase.execute({
      targets: body.targets,
      type: body.type,
      setting: body.setting,
      enabled: body.enabled,
    });
  }

  @Put(':ruleId')
  @HttpCode(200)
  async update(
    @Param('ruleId') ruleId: string,
    @Body(new ZodValidationPipe(updateAttendanceRuleRequestSchema))
    body: UpdateAttendanceRuleRequestDto,
  ): Promise<void> {
    await this.updateAttendanceRuleUseCase.execute({
      ruleId,
      targets: body.targets,
      type: body.type,
      setting: body.setting,
      enabled: body.enabled,
    });
  }

  @Delete(':ruleId')
  @HttpCode(200)
  async delete(@Param('ruleId') ruleId: string): Promise<void> {
    await this.deleteAttendanceRuleUseCase.execute({
      ruleId,
    });
  }
}
