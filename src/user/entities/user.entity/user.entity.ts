import { CvEntity } from '../../../cv/entities/cv.entity/cv.entity';
import { UserRoleEnum } from '../../../enums/user-role.enum';
import { TimestampEntities } from './../../../generics/timestamp.entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class UserEntity extends TimestampEntities {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true, unique: true, length: 50 })
  username!: string;

  @Column({ nullable: true, unique: true, length: 100 })
  email!: string;

  @Column()
  password!: string;

  @Column()
  salt!: string;

  @Column({ enum: UserRoleEnum, type: 'enum', default: UserRoleEnum.USER })
  role!: string;

  @OneToMany(() => CvEntity, (cv) => cv.user, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  cvs!: CvEntity[];
}
