import { TimestampEntities } from '../../../generics/timestamp.entities';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../../user/entities/user.entity/user.entity';

@Entity('cv')
// Toutes les lectures filtrent sur le propriétaire ; /cv/stats y ajoute une
// tranche d'âge et groupe dessus. L'index FK seul laissait MySQL parcourir
// chaque ligne du propriétaire pour appliquer le filtre d'âge et trier.
@Index(['user', 'age'])
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
