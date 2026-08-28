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
      repository.save.mockRejectedValue(new Error('ER_DUP_ENTRY'));

      await expect(
        service.register({
          username: 'johndoe',
          email: 'john@example.com',
          password: 'S3cret!pass',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
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
