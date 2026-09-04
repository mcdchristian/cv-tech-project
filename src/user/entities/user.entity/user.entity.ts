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

  @Column({ enum: UserRoleEnum, type: 'enum', default: UserRoleEnum.USER })
  role!: string;

  // Pas de `eager` : la stratégie JWT charge l'utilisateur à chaque requête
  // authentifiée et jette la relation. La charger coûtait deux requêtes SQL
  // supplémentaires par appel, dont une qui grandit avec le nombre de CVs.
  // Les consommateurs qui en ont besoin la demandent via `relations`.
  @OneToMany(() => CvEntity, (cv) => cv.user, {
    cascade: true,
    nullable: true,
  })
  cvs!: CvEntity[];
}
