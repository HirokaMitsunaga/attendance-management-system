import { Controller, Get } from '@nestjs/common';
import { MeService } from './me.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { MeResponseDto } from './dto/me-response.dto';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  async getMe(@CurrentUser() userId: string): Promise<MeResponseDto> {
    return this.meService.getMe(userId);
  }
}
