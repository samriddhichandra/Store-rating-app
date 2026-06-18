import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';
import { Rating } from '../ratings/entities/rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Store, Rating])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
