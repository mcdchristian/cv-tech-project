import { CvEntity } from '../../../cv/entities/cv.entity/cv.entity';
import { TimestampEntities } from './../../../generics/timestamp.entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity extends TimestampEntities {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ nullable: true, unique: true, length: 50 })
  name?: string;

  @Column({ nullable: true, unique: true, length: 100 })
  email?: string;

  @OneToMany(() => CvEntity, (cv) => cv.user, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  cvs?: CvEntity[];
}
