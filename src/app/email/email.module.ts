import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { InternalEmailController } from './email.controller';
import { ConfigModule } from '@nestjs/config';
import { InternalSecretGuard } from 'src/core/guards/internal-secret.guard';

@Module({
  imports: [ConfigModule],
  controllers: [InternalEmailController],
  providers: [EmailService, InternalSecretGuard],
  exports: [EmailService],
})
export class EmailModule {}
