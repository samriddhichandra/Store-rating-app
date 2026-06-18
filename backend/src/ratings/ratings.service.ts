import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { Store } from '../stores/entities/store.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  /** Submits a new rating, or updates the existing one (one rating per user per store). */
  async upsert(userId: string, dto: CreateRatingDto): Promise<Rating> {
    const store = await this.storeRepo.findOne({ where: { id: dto.storeId } });
    if (!store) throw new NotFoundException('Store not found');

    let rating = await this.ratingRepo.findOne({
      where: { userId, storeId: dto.storeId },
    });

    if (rating) {
      rating.rating = dto.rating;
    } else {
      rating = this.ratingRepo.create({ userId, storeId: dto.storeId, rating: dto.rating });
    }

    return this.ratingRepo.save(rating);
  }

  async count(): Promise<number> {
    return this.ratingRepo.count();
  }
}
