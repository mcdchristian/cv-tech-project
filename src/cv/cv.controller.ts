import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CvService } from './cv.service';
import { CvEntity } from './entities/cv.entity/cv.entity';
import { AddcvDto } from './dto/add-cv.dto';
import { UpdatecvDto } from './dto/update-cv.dto';
import { CvStatsQueryDto } from './dto/cv-stats-query.dto';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity/user.entity';

@ApiTags('cv')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token absent, invalide ou expiré' })
@Controller('cv')
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(private CvService: CvService) {}

  // Retourne uniquement les CVs de l'utilisateur connecté
  @Get()
  @ApiOperation({ summary: "Lister les CVs de l'utilisateur connecté" })
  async getAllCvs(@User() user: Partial<UserEntity>): Promise<CvEntity[]> {
    return await this.CvService.getCvs(user);
  }

  // Crée un CV et l'associe à l'utilisateur connecté
  @Post()
  @ApiOperation({ summary: 'Créer un CV' })
  async addCv(@Body() cv: AddcvDto, @User() user: Partial<UserEntity>): Promise<CvEntity> {
    return await this.CvService.addCv(cv, user);
  }

  // Met à jour un CV (ownership vérifié dans le service)
  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un CV' })
  @ApiForbiddenResponse({ description: "Le CV n'existe pas ou ne vous appartient pas" })
  async updateCv(
    @Body() cv: UpdatecvDto,
    @Param('id', ParseIntPipe) id: number,
    @User() user: Partial<UserEntity>,
  ): Promise<CvEntity> {
    return await this.CvService.updateCv(id, cv, user);
  }

  // Soft-delete d'un CV (ownership vérifié dans le service)
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un CV (soft delete)' })
  @ApiForbiddenResponse({ description: "Le CV n'existe pas ou ne vous appartient pas" })
  async softDeleteCv(@Param('id', ParseIntPipe) id: number, @User() user: Partial<UserEntity>) {
    return await this.CvService.softDeleteCv(id, user);
  }

  // Restaure un CV soft-supprimé
  @Get('recover/:id')
  @ApiOperation({ summary: 'Restaurer un CV supprimé' })
  @ApiForbiddenResponse({ description: "Le CV n'existe pas ou ne vous appartient pas" })
  async restoreCv(@Param('id', ParseIntPipe) id: number, @User() user: Partial<UserEntity>) {
    return await this.CvService.restoreCv(id, user);
  }

  // Statistiques : nombre de CVs par tranche d'âge (bornes optionnelles)
  @Get('stats')
  @ApiOperation({ summary: 'Nombre de CVs par âge, sur une tranche optionnelle' })
  async getCvNumberByAge(@User() user: Partial<UserEntity>, @Query() query: CvStatsQueryDto) {
    return await this.CvService.getCvNumberByAge(user, query);
  }

  // Récupère un CV par ID (ownership vérifié dans le service)
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un CV par son identifiant' })
  @ApiNotFoundResponse({ description: "Le CV n'existe pas ou ne vous appartient pas" })
  async getCvById(
    @Param('id', ParseIntPipe) id: number,
    @User() user: Partial<UserEntity>,
  ): Promise<CvEntity> {
    return await this.CvService.getCvById(id, user);
  }
}
