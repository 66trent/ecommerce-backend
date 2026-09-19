import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { InternalEmailController } from './email.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [InternalEmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
