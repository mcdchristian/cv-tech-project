import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiInfo } from './app.service';
import { AppService } from './app.service';

@ApiTags('root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: "Identité de l'API et lien vers la documentation" })
  getApiInfo(): ApiInfo {
    return this.appService.getApiInfo();
  }
}
