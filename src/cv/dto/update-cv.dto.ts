import { PartialType } from '@nestjs/swagger';
import { AddcvDto } from './add-cv.dto';

/**
 * Reprend AddcvDto en rendant chaque champ optionnel : les contraintes de
 * validation et la documentation Swagger restent définies à un seul endroit.
 */
export class UpdatecvDto extends PartialType(AddcvDto) {}
