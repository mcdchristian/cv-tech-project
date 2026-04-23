import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CvEntity } from './entities/cv.entity/cv.entity';
import { AddcvDto } from './dto/add-cv.dto';
import { UpdatecvDto } from './dto/update-cv.dto';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity/user.entity';

@Controller('cv')
export class CvController {
  constructor(private CvService: CvService) {}

  // Retourne uniquement les CVs de l'utilisateur connecté
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllCvs(
    @User() user: Partial<UserEntity>,
  ): Promise<CvEntity[]> {
    return await this.CvService.getCvs(user);
  }

  // Crée un CV et l'associe à l'utilisateur connecté
  @Post()
  @UseGuards(JwtAuthGuard)
  async addCv(
    @Body() cv: AddcvDto,
    @User() user: Partial<UserEntity>,
  ): Promise<CvEntity> {
    return await this.CvService.addCv(cv, user);
  }

  // Met à jour un CV (ownership vérifié dans le service)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateCv(
    @Body() cv: UpdatecvDto,
    @Param('id', ParseIntPipe) id: number,
    @User() user: Partial<UserEntity>,
  ): Promise<CvEntity> {
    return await this.CvService.updateCv(id, cv, user);
  }

  // Soft-delete d'un CV (ownership vérifié dans le service)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async softDeleteCv(
    @Param('id', ParseIntPipe) id: number,
    @User() user: Partial<UserEntity>,
  ) {
    return await this.CvService.softDeleteCv(id, user);
  }

  // Restaure un CV soft-supprimé
  @Get('recover/:id')
  @UseGuards(JwtAuthGuard)
  async restoreCv(@Param('id', ParseIntPipe) id: number) {
    return await this.CvService.restoreCv(id);
  }

  // Statistiques : nombre de CVs par tranche d'âge
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getCvNumberByAge() {
    return await this.CvService.getCvNumberByAge(50, 18);
  }

  // Récupère un CV par ID (ownership vérifié dans le service)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCvById(
    @Param('id', ParseIntPipe) id: number,
    @User() user: Partial<UserEntity>,
  ): Promise<CvEntity> {
    return await this.CvService.getCvById(id, user);
  }
}
