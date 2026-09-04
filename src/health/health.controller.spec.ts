import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    dataSource = { query: jest.fn().mockResolvedValue([{ 1: 1 }]) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: getDataSourceToken(), useValue: dataSource }],
    }).compile();

    controller = module.get(HealthController);
  });

  describe('liveness', () => {
    it('answers without touching the database', () => {
      expect(controller.check().status).toBe('ok');
      // Une base en panne ne doit pas faire échouer la liveness : un
      // redémarrage n'y changerait rien et boucle.
      expect(dataSource.query).not.toHaveBeenCalled();
    });
  });

  describe('readiness', () => {
    it('reports ok when the database answers', async () => {
      await expect(controller.ready()).resolves.toMatchObject({
        status: 'ok',
        database: 'reachable',
      });
      expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('returns 503 when the database is unreachable', async () => {
      dataSource.query.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });
});
