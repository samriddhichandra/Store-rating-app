import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Role } from '../common/enums/role.enum';

const SORTABLE_FIELDS = ['name', 'email', 'address', 'role', 'createdAt'];

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** Strips the password hash before anything goes back to a client. */
  toSafeUser(user: User) {
    if (!user) return user;
    const { password, ...safe } = user as any;
    return safe;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, password: hashed });
    return this.userRepo.save(user);
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.userRepo.update(userId, { password: newPasswordHash });
  }

  /**
   * Admin listing: supports filters by name/email/address/role and sorting.
   * Store owners get an `avgRating` (average across the store(s) they own).
   */
  async findAll(query: QueryUserDto) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.stores', 'store')
      .leftJoin('store.ratings', 'rating')
      .select([
        'user.id AS "id"',
        'user.name AS "name"',
        'user.email AS "email"',
        'user.address AS "address"',
        'user.role AS "role"',
        'user.createdAt AS "createdAt"',
      ])
      .addSelect('ROUND(AVG(rating.rating)::numeric, 2)', 'avgRating')
      .groupBy('user.id');

    if (query.name) {
      qb.andWhere('user.name ILIKE :name', { name: `%${query.name}%` });
    }
    if (query.email) {
      qb.andWhere('user.email ILIKE :email', { email: `%${query.email}%` });
    }
    if (query.address) {
      qb.andWhere('user.address ILIKE :address', { address: `%${query.address}%` });
    }
    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    const sortBy = SORTABLE_FIELDS.includes(query.sortBy) ? query.sortBy : 'name';
    const order = query.order === 'DESC' ? 'DESC' : 'ASC';
    qb.orderBy(`user.${sortBy}`, order);

    const rows = await qb.getRawMany();
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      role: row.role,
      createdAt: row.createdAt,
      rating: row.role === Role.STORE_OWNER ? (row.avgRating ? Number(row.avgRating) : null) : undefined,
    }));
  }

  /** Full detail view for the admin "view user" screen. */
  async findOneDetailed(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['stores', 'stores.ratings'],
    });
    if (!user) throw new NotFoundException('User not found');

    const safe = this.toSafeUser(user);
    delete safe.stores;

    if (user.role === Role.STORE_OWNER) {
      const allRatings = (user.stores || []).flatMap((s) => s.ratings || []);
      const avg = allRatings.length
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        : null;
      safe.rating = avg !== null ? Math.round(avg * 100) / 100 : null;
    }

    return safe;
  }

  async getCounts() {
    const totalUsers = await this.userRepo.count();
    return totalUsers;
  }
}
