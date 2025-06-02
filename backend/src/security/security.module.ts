import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { InputSanitizationPipe } from './pipes/input-sanitization.pipe';
import { SecurityInterceptor } from './interceptors/security.interceptor';

@Module({
  providers: [SecurityService, InputSanitizationPipe, SecurityInterceptor],
  exports: [SecurityService, InputSanitizationPipe, SecurityInterceptor],
})
export class SecurityModule {}
