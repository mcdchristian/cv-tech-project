import { TimestampEntities } from '../../../generics/timestamp.entities';
import {
  Column,
  // CreateDateColumn,
  // DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  // UpdateDateColumn,
} from 'typeorm';

@Entity('cv')
export class CvEntity extends TimestampEntities {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ name: 'name', length: 50 })
  name?: string;

  @Column({ length: 50 })
  firstname?: string;

  @Column()
  age?: number;

  @Column()
  cin?: number;

  @Column()
  job?: string;

  @Column({ nullable: true })
  path?: string;

  // @CreateDateColumn()
  // createdAt?: Date;

  // @UpdateDateColumn()
  // updatedAt?: Date;

  // @DeleteDateColumn()
  // deletedAt?: Date;
}
