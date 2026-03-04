import { TimestampEntities } from '../../../generics/timestamp.entities';
import {
  Column,
  // CreateDateColumn,
  // DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  // UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../../user/entities/user.entity/user.entity';

@Entity('cv')
export class CvEntity extends TimestampEntities {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'name', length: 50 })
  name!: string;

  @Column({ length: 50 })
  firstname!: string;

  @Column()
  age!: number;

  @Column()
  cin!: number;

  @Column()
  job!: string;

  @Column({ nullable: true })
  path!: string;

  @ManyToOne(() => UserEntity, (user) => user.cvs, {
    cascade: ['insert', 'update'],
    // eager: true,
    nullable: true,
  })
  user!: UserEntity;
}
