import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
import { RatingsService } from '../ratings/ratings.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersService: UsersService,
    private readonly storesService: StoresService,
    private readonly ratingsService: RatingsService,
  ) {}

  async getAdminStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.usersService.getCounts(),
      this.storesService.count(),
      this.ratingsService.count(),
    ]);
    return { totalUsers, totalStores, totalRatings };
  }
}
