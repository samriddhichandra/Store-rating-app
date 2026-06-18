import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UsersModule } from '../users/users.module';
import { StoresModule } from '../stores/stores.module';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [UsersModule, StoresModule, RatingsModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
