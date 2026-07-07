import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { AnalysisModule } from './analysis/analysis.module';
import { BillingModule } from './billing/billing.module';
import { LawyerReviewModule } from './lawyer-review/lawyer-review.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    HealthModule,
    CommonModule,
    AuthModule,
    UsersModule,
    DocumentsModule,
    AnalysisModule,
    BillingModule,
    LawyerReviewModule,
    NotificationsModule,
  ],
})
export class AppModule {}
