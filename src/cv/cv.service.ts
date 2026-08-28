import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CvEntity } from './entities/cv.entity/cv.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AddcvDto } from './dto/add-cv.dto';
import { UpdatecvDto } from './dto/update-cv.dto';
import { UserEntity } from '../user/entities/user.entity/user.entity';
import { CvStatsQueryDto } from './dto/cv-stats-query.dto';

// Le QueryBuilder renvoie l'alias SQL `nombreDeCv`, consommé tel quel par le frontend.
export interface CvAgeStat {
  age: number;
  nombreDeCv: string;
}

@Injectable()
export class CvService {
  constructor(@InjectRepository(CvEntity) private cvRepository: Repository<CvEntity>) {}

  // Récupère un CV par ID en vérifiant qu'il appartient à l'utilisateur
  async getCvById(id: number, user: Partial<UserEntity>): Promise<CvEntity> {
    const cv = await this.cvRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!cv) {
      throw new NotFoundException(`Le CV d'id ${id} n'existe pas ou ne vous appartient pas`);
    }
    return cv;
  }

  // Récupère uniquement les CVs de l'utilisateur connecté
  async getCvs(user: Partial<UserEntity>): Promise<CvEntity[]> {
    return await this.cvRepository.find({
      where: { user: { id: user.id } },
    });
  }

  // Crée un CV et l'associe à l'utilisateur connecté
  async addCv(cv: AddcvDto, user: Partial<UserEntity>): Promise<CvEntity> {
    const newCv = this.cvRepository.create(cv);
    newCv.user = user as UserEntity;
    return await this.cvRepository.save(newCv);
  }

  // Met à jour un CV en vérifiant l'ownership
  async updateCv(id: number, cv: UpdatecvDto, user: Partial<UserEntity>): Promise<CvEntity> {
    // Vérifie que le CV existe et appartient à l'utilisateur
    const existing = await this.cvRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!existing) {
      throw new ForbiddenException(`Le CV d'id ${id} n'existe pas ou ne vous appartient pas`);
    }
    const updatedCv = await this.cvRepository.preload({ id, ...cv });
    return await this.cvRepository.save(updatedCv!);
  }

  // Soft-delete en vérifiant l'ownership
  async softDeleteCv(id: number, user: Partial<UserEntity>) {
    const existing = await this.cvRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!existing) {
      throw new ForbiddenException(`Le CV d'id ${id} n'existe pas ou ne vous appartient pas`);
    }
    return await this.cvRepository.softDelete(id);
  }

  // Restaure un CV soft-supprimé
  async restoreCv(id: number, user: Partial<UserEntity>) {
    const existing = await this.cvRepository.findOne({
      where: { id, user: { id: user.id } },
      withDeleted: true,
    });
    if (!existing) {
      throw new ForbiddenException(`Le CV d'id ${id} n'existe pas ou ne vous appartient pas`);
    }
    return await this.cvRepository.restore(id);
  }

  // Statistiques : nombre de CVs par tranche d'âge (bornes incluses)
  async getCvNumberByAge(
    user: Partial<UserEntity>,
    { minAge = 0, maxAge = 120 }: CvStatsQueryDto = {},
  ): Promise<CvAgeStat[]> {
    const qb = this.cvRepository.createQueryBuilder('cv');
    qb.select('cv.age', 'age')
      .addSelect('count(cv.id)', 'nombreDeCv')
      .leftJoin('cv.user', 'user')
      .where('cv.age between :minAge and :maxAge')
      .andWhere('user.id = :userId')
      .setParameters({ minAge, maxAge, userId: user.id })
      .groupBy('cv.age')
      .orderBy('cv.age', 'ASC');
    return await qb.getRawMany<CvAgeStat>();
  }
}
