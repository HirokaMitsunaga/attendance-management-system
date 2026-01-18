import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { GetAttendanceRecordUseCase } from '../usecase/attendance-record/get-attendance-record.use-case';
import {
  type GetEventRequestDto,
  getEventRequestSchema,
} from '../request/getEventRequest';
import type { GetEventResponseDto } from '../response/getEventResponse';

@Controller('attendance-record')
export class AttendanceRecordController {
  constructor(
    private readonly getAttendanceRecordUseCase: GetAttendanceRecordUseCase,
  ) {}

  @Post()
  @HttpCode(200)
  async getAttendanceEvents(
    @Body(new ZodValidationPipe(getEventRequestSchema))
    body: GetEventRequestDto,
  ): Promise<GetEventResponseDto> {
    return this.getAttendanceRecordUseCase.execute(body);
  }
}
