import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvService } from './cv.service';
import { CvEntity } from './entities/cv.entity/cv.entity';
import type { AuthenticatedUser } from '../decorators/user.decorator';

const owner: AuthenticatedUser = {
  id: 1,
  username: 'owner',
  email: 'owner@example.com',
  role: 'user',
};

describe('CvService', () => {
  let service: CvService;
  let repository: jest.Mocked<Repository<CvEntity>>;
  let queryBuilder: Record<string, jest.Mock>;

  beforeEach(async () => {
    queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CvService,
        {
          provide: getRepositoryToken(CvEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get(CvService);
    repository = module.get(getRepositoryToken(CvEntity));
  });

  describe('getCvById', () => {
    it('scopes the lookup to the authenticated user', async () => {
      const cv = { id: 7 } as CvEntity;
      repository.findOne.mockResolvedValue(cv);

      await expect(service.getCvById(7, owner)).resolves.toBe(cv);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 7, user: { id: 1 } },
      });
    });

    it('raises 404 when the CV belongs to somebody else', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getCvById(7, owner)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateCv', () => {
    it('refuses to touch a CV the user does not own', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.updateCv(7, { name: 'Doe' }, owner)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repository.preload).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteCv', () => {
    it('refuses to delete a CV the user does not own', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.softDeleteCv(7, owner)).rejects.toBeInstanceOf(ForbiddenException);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('restoreCv', () => {
    it('looks the CV up with withDeleted, otherwise it can never be found', async () => {
      repository.findOne.mockResolvedValue({ id: 7 } as CvEntity);

      await service.restoreCv(7, owner);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 7, user: { id: 1 } },
        withDeleted: true,
      });
      expect(repository.restore).toHaveBeenCalledWith(7);
    });
  });

  describe('getCvNumberByAge', () => {
    it('defaults to the full age range and filters on the owner', async () => {
      await service.getCvNumberByAge(owner);

      expect(queryBuilder.setParameters).toHaveBeenCalledWith({
        minAge: 0,
        maxAge: 120,
        userId: 1,
      });
    });

    it('forwards the requested bounds', async () => {
      await service.getCvNumberByAge(owner, { minAge: 18, maxAge: 50 });

      expect(queryBuilder.setParameters).toHaveBeenCalledWith({
        minAge: 18,
        maxAge: 50,
        userId: 1,
      });
    });
  });
});
