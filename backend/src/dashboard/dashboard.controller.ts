import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }

  @Get('user-ratings')
  @Roles(Role.ADMIN)
  getUserRatingsWithAverages() {
    return this.dashboardService.getUserRatingsWithAverages();
  }
}
