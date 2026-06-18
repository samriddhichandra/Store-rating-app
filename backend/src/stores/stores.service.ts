import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { Rating } from '../ratings/entities/rating.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { QueryStoreDto } from './dto/query-store.dto';

const SORTABLE_FIELDS = ['name', 'email', 'address'];

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const store = this.storeRepo.create({
      name: dto.name,
      email: dto.email,
      address: dto.address,
      ownerId: dto.ownerId ?? null,
    });
    return this.storeRepo.save(store);
  }

  /**
   * List stores with computed overall rating + (optionally) the current
   * user's own submitted rating for each store, for the "submit/modify
   * rating" UI on the normal user's store list.
   */
  async findAll(query: QueryStoreDto, currentUserId?: string) {
    const qb = this.storeRepo
      .createQueryBuilder('store')
      .leftJoin('store.ratings', 'rating')
      .select([
        'store.id AS "id"',
        'store.name AS "name"',
        'store.email AS "email"',
        'store.address AS "address"',
        'store.ownerId AS "ownerId"',
      ])
      .addSelect('ROUND(AVG(rating.rating)::numeric, 2)', 'overallRating')
      .addSelect('COUNT(rating.id)', 'ratingsCount')
      .groupBy('store.id');

    if (query.name) {
      qb.andWhere('store.name ILIKE :name', { name: `%${query.name}%` });
    }
    if (query.email) {
      qb.andWhere('store.email ILIKE :email', { email: `%${query.email}%` });
    }
    if (query.address) {
      qb.andWhere('store.address ILIKE :address', { address: `%${query.address}%` });
    }

    const order = query.order === 'DESC' ? 'DESC' : 'ASC';
    if (query.sortBy === 'rating') {
      qb.orderBy('"overallRating"', order, 'NULLS LAST');
    } else {
      const sortBy = SORTABLE_FIELDS.includes(query.sortBy) ? query.sortBy : 'name';
      qb.orderBy(`store.${sortBy}`, order);
    }

    const rows = await qb.getRawMany();

    let myRatings: Record<string, number> = {};
    if (currentUserId) {
      const ratings = await this.ratingRepo.find({ where: { userId: currentUserId } });
      myRatings = Object.fromEntries(ratings.map((r) => [r.storeId, r.rating]));
    }

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      overallRating: row.overallRating !== null ? Number(row.overallRating) : null,
      ratingsCount: Number(row.ratingsCount),
      myRating: currentUserId ? myRatings[row.id] ?? null : undefined,
    }));
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { id } });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  async count(): Promise<number> {
    return this.storeRepo.count();
  }

  /** Stats for the Store Owner dashboard: raters list + average rating. */
  async getOwnerDashboard(ownerId: string) {
    const stores = await this.storeRepo.find({ where: { ownerId } });
    const storeIds = stores.map((s) => s.id);

    if (storeIds.length === 0) {
      return { stores: [], raters: [], averageRating: null };
    }

    const ratings = await this.ratingRepo
      .createQueryBuilder('rating')
      .leftJoinAndSelect('rating.user', 'user')
      .leftJoinAndSelect('rating.store', 'store')
      .where('rating.storeId IN (:...storeIds)', { storeIds })
      .orderBy('rating.updatedAt', 'DESC')
      .getMany();

    const raters = ratings.map((r) => ({
      ratingId: r.id,
      rating: r.rating,
      submittedAt: r.updatedAt,
      storeId: r.storeId,
      storeName: r.store?.name,
      user: {
        id: r.user?.id,
        name: r.user?.name,
        email: r.user?.email,
        address: r.user?.address,
      },
    }));

    const averageRating = ratings.length
      ? Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 100) / 100
      : null;

    return {
      stores: stores.map((s) => ({ id: s.id, name: s.name, email: s.email, address: s.address })),
      raters,
      averageRating,
    };
  }
}
