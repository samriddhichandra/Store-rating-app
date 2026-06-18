import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Rating } from '../../ratings/entities/rating.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 60 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 400 })
  address: string;

  // The user (role = STORE_OWNER) who owns/manages this store. Nullable
  // because an admin can register a store before assigning an owner.
  @ManyToOne(() => User, (user) => user.stores, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  owner: User | null;

  @Column({ nullable: true })
  ownerId: string | null;

  @OneToMany(() => Rating, (rating) => rating.store)
  ratings: Rating[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
