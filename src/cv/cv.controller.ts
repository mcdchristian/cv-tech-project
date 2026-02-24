import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CvEntity } from './entities/cv.entity/cv.entity';
import { AddcvDto } from './dto/add-cv.dto';
import { UpdatecvDto } from './dto/update-cv.dto';
// import { FindOptionsWhere } from 'typeorm';

@Controller('cv')
export class CvController {
  constructor(private CvService: CvService) {}
  @Get()
  async getAllCvs(): Promise<CvEntity[]> {
    return await this.CvService.getCvs();
  }

  @Post()
  async addCv(@Body() cv: AddcvDto): Promise<CvEntity> {
    return await this.CvService.addCv(cv);
  }
  @Patch(':id')
  async updateCv(
    @Body() cv: UpdatecvDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CvEntity> {
    return await this.CvService.updateCv(id, cv);
  }
  // dans le cas d'une mise a jour partielle selon des criteres de recherche

  // @Patch()
  // async updatecv2(@Body() updateObject: any) {
  //   const { updateCriteria, data } = updateObject;

  //   if (!data || Object.keys(data).length === 0) {
  //     return { message: 'Aucune valeur à mettre à jour' };
  //   }

  //   return this.CvService.updateCv2(updateCriteria, data);
  // }
  @Delete(':id')
  async deleteCv(@Param('id', ParseIntPipe) id: number) {
    return await this.CvService.deleteCv(id);
  }

  // @Delete(':id')
  // async deleteCv2(@Param('id', ParseIntPipe) id: number) {
  //   return await this.CvService.deleteCv2(id);
  // }

  //soft delete/remove (suppression logique)

  // @Delete(':id')
  // async softRemoveCv(@Param('id', ParseIntPipe) id: number) {
  //   return await this.CvService.softRemoveCv(id);
  // }

  // @Get('recover/:id')
  // async recoverCv(@Param('id', ParseIntPipe) id: number) {
  //   return await this.CvService.recoverCv(id);
  // }

  @Delete(':id')
  async softDeleteCv(@Param('id', ParseIntPipe) id: number) {
    return await this.CvService.softDeleteCv(id);
  }

  @Get('recover/:id')
  async restoreCv(@Param('id', ParseIntPipe) id: number) {
    return await this.CvService.restoreCv(id);
  }
  // Query builder
  @Get('stats')
  async getCvNumberByAge() {
    return await this.CvService.getCvNumberByAge(50, 18);
  }

  @Get(':id')
  async getCvById(@Param('id', ParseIntPipe) id: number): Promise<CvEntity> {
    return await this.CvService.getCvById(id);
  }
}
