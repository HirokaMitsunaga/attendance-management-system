import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { CustomLoggerService } from './custom-logger.service';
import { TraceService } from '../common/services/trace.service';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
  ],
  providers: [CustomLoggerService, TraceService],
  exports: [CustomLoggerService, TraceService],
})
export class LoggerModule {}
