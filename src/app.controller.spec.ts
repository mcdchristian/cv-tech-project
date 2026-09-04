import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  const build = async (nodeEnv?: string): Promise<AppController> => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: ConfigService, useValue: { get: () => nodeEnv } }],
    }).compile();
    return app.get<AppController>(AppController);
  };

  it('identifies the API', async () => {
    const controller = await build('development');

    expect(controller.getApiInfo()).toMatchObject({
      name: 'CV Tech API',
      version: '1.0',
    });
  });

  it('links to the docs outside production', async () => {
    const controller = await build('development');

    expect(controller.getApiInfo().docs).toBe('/api/v1/api-docs');
  });

  it('advertises no docs URL in production, where they are not mounted', async () => {
    const controller = await build('production');

    expect(controller.getApiInfo().docs).toBeNull();
  });
});
