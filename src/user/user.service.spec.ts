import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity/user.entity';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<Repository<UserEntity>>;
  let jwtService: jest.Mocked<JwtService>;
  let queryBuilder: Record<string, jest.Mock>;

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            create: jest.fn((data: Partial<UserEntity>) => ({ ...data }) as UserEntity),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => queryBuilder),
          },
        },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('jwt-token') } },
      ],
    }).compile();

    service = module.get(UserService);
    repository = module.get(getRepositoryToken(UserEntity));
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('hashes the password and never returns it', async () => {
      const created = await service.register({
        username: 'johndoe',
        email: 'john@example.com',
        password: 'S3cret!pass',
      });

      const saved = repository.save.mock.calls[0][0] as UserEntity;
      expect(saved.password).not.toBe('S3cret!pass');
      await expect(bcrypt.compare('S3cret!pass', saved.password)).resolves.toBe(true);
      expect(created).not.toHaveProperty('password');
      expect(created).not.toHaveProperty('salt');
    });

    it('turns a unique-constraint violation into a 409', async () => {
      const duplicate = new Error('duplicate') as Error & { driverError: unknown };
      duplicate.driverError = { code: 'ER_DUP_ENTRY', errno: 1062 };
      repository.save.mockRejectedValue(duplicate);

      await expect(
        service.register({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'S3cret!pass',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('lets any other database failure surface instead of masking it as a 409', async () => {
      // Le cas réel : schéma absent. Le renvoyer en 409 « déjà existant »
      // envoyait le diagnostic dans la mauvaise direction.
      const missingTable = new Error("Table 'cv_tech.users' doesn't exist") as Error & {
        driverError: unknown;
      };
      missingTable.driverError = { code: 'ER_NO_SUCH_TABLE', errno: 1146 };
      repository.save.mockRejectedValue(missingTable);

      await expect(
        service.register({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'S3cret!pass',
        }),
      ).rejects.toThrow("Table 'cv_tech.users' doesn't exist");
    });
  });

  describe('login', () => {
    const buildUser = async (password: string): Promise<UserEntity> => {
      const salt = await bcrypt.genSalt();
      return {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        role: 'user',
        salt,
        password: await bcrypt.hash(password, salt),
      } as UserEntity;
    };

    it('returns a token when the password matches', async () => {
      queryBuilder.getOne.mockResolvedValue(await buildUser('S3cret!pass'));

      await expect(
        service.login({ username: 'johndoe', password: 'S3cret!pass' }),
      ).resolves.toEqual({ access_token: 'jwt-token' });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.not.objectContaining({ password: expect.anything() }),
      );
    });

    it('rejects a wrong password', async () => {
      queryBuilder.getOne.mockResolvedValue(await buildUser('S3cret!pass'));

      await expect(
        service.login({ username: 'johndoe', password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('answers 401 rather than 404 for an unknown account, to avoid enumeration', async () => {
      queryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.login({ username: 'ghost', password: 'S3cret!pass' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
