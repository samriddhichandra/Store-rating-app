import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Rating } from '../../ratings/entities/rating.entity';
import { Store } from '../../stores/entities/store.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 60 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  // bcrypt hash, never returned to client (see UsersService.toSafeUser)
  @Column()
  password: string;

  @Column({ length: 400 })
  address: string;

  @Column({ type: 'enum', enum: Role, default: Role.NORMAL_USER })
  role: Role;

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];

  // Only populated for users with role = STORE_OWNER
  @OneToMany(() => Store, (store) => store.owner)
  stores: Store[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
