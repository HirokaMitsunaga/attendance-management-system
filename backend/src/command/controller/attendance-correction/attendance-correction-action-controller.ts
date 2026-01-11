import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  approveAttendanceCorrectionRequestSchema,
  cancelAttendanceCorrectionRequestSchema,
  rejectAttendanceCorrectionRequestSchema,
  type ApproveAttendanceCorrectionRequestDto,
  type CancelAttendanceCorrectionRequestDto,
  type RejectAttendanceCorrectionRequestDto,
} from '../../request/attendanceCorrectionActionRequest';
import { getCurrentDate } from '../../../common/utils/date.utils';
import { ApproveAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/approve-attendance-correction.use-case';
import { CancelAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/cancel-attendance-correction.use-case';
import { RejectAttendanceCorrectionUseCase } from '../../useCase/attendance-correction/reject-attendance-correction.use-case';

@Controller('attendance-correction')
export class AttendanceCorrectionActionController {
  constructor(
    private readonly approveAttendanceCorrectionUseCase: ApproveAttendanceCorrectionUseCase,
    private readonly rejectAttendanceCorrectionUseCase: RejectAttendanceCorrectionUseCase,
    private readonly cancelAttendanceCorrectionUseCase: CancelAttendanceCorrectionUseCase,
  ) {}

  @Post('approve')
  @HttpCode(200)
  async approve(
    @CurrentUser() approvedBy: string,
    @Body(new ZodValidationPipe(approveAttendanceCorrectionRequestSchema))
    body: ApproveAttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.approveAttendanceCorrectionUseCase.execute({
      userId: body.userId,
      workDate: body.workDate,
      approvedBy,
      approveAt: getCurrentDate(),
    });
  }

  @Post('reject')
  @HttpCode(200)
  async reject(
    @CurrentUser() rejectedBy: string,
    @Body(new ZodValidationPipe(rejectAttendanceCorrectionRequestSchema))
    body: RejectAttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.rejectAttendanceCorrectionUseCase.execute({
      userId: body.userId,
      workDate: body.workDate,
      rejectedBy,
      comment: body.comment ?? null,
    });
  }

  @Post('cancel')
  @HttpCode(200)
  async cancel(
    @CurrentUser() canceledBy: string,
    @Body(new ZodValidationPipe(cancelAttendanceCorrectionRequestSchema))
    body: CancelAttendanceCorrectionRequestDto,
  ): Promise<void> {
    await this.cancelAttendanceCorrectionUseCase.execute({
      userId: body.userId,
      workDate: body.workDate,
      canceledBy,
    });
  }
}
