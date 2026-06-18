import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from '../ratings/entities/rating.entity';
import { User } from '../users/entities/user.entity';
import { Store } from '../stores/entities/store.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
  ) {}

  async getAdminStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.userRepo.count(),
      this.storeRepo.count(),
      this.ratingRepo.count(),
    ]);
    return { totalUsers, totalStores, totalRatings };
  }

  async getUserRatingsWithAverages() {
    const results = await this.ratingRepo
      .createQueryBuilder('rating')
      .innerJoin(User, 'user', 'user.id = rating.userId')
      .innerJoin(Store, 'store', 'store.id = rating.storeId')
      .leftJoin(
        Rating,
        'avgRating',
        'avgRating.storeId = rating.storeId',
      )
      .select([
        'user.id AS userId',
        'user.name AS userName',
        'user.email AS userEmail',
        'store.id AS storeId',
        'store.name AS storeName',
        'rating.rating AS userRating',
      ])
      .addSelect('AVG(avgRating.rating)', 'averageRating')
      .groupBy('user.id, user.name, user.email, store.id, store.name, rating.rating')
      .orderBy('user.name', 'ASC')
      .getRawMany();

    return results.map((row) => ({
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail,
      storeId: row.storeId,
      storeName: row.storeName,
      userRating: Number(row.userRating),
      averageRating: Number(parseFloat(row.averageRating).toFixed(2)),
    }));
  }
}
