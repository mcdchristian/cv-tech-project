import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CvEntity } from './entities/cv.entity/cv.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AddcvDto } from './dto/add-cv.dto';
import { UpdatecvDto } from './dto/update-cv.dto';
// import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(CvEntity) private cvRepository: Repository<CvEntity>,
  ) {}
  async getCvs(): Promise<CvEntity[]> {
    return await this.cvRepository.find();
  }
  async addCv(cv: AddcvDto): Promise<CvEntity> {
    return await this.cvRepository.save(cv);
  }
  async updateCv(id: number, cv: UpdatecvDto): Promise<CvEntity> {
    const newCv = await this.cvRepository.preload({ id, ...cv });
    if (!newCv) {
      throw new NotFoundException(`le cv d'id ${id} n'existe pas`);
    }
    return await this.cvRepository.save(newCv);
  }
  // dans le cas d'une mise a jour partielle selon des criteres de recherche

  // updateCv2(updateCriteria: FindOptionsWhere<CvEntity>, cv: UpdatecvDto) {
  //   return this.cvRepository.update(updateCriteria, cv);
  // }
  async deleteCv(id: number) {
    const removeCv = await this.cvRepository.findOne({ where: { id } });
    if (!removeCv) {
      throw new NotFoundException(`le cv d'id ${id} n'existe pas`);
    }
    return await this.cvRepository.remove(removeCv);
  }
  async deleteCv2(id: number) {
    return await this.cvRepository.delete(id);
    // return await this.cvRepository.delete([1, 2, 4]);
  }
}
