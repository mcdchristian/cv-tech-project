import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            register: jest.fn(),
            login: jest.fn().mockResolvedValue({ access_token: 'jwt' }),
          },
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UserController);
    service = module.get(UserService);
  });

  it('never returns the password or salt from registration', async () => {
    service.register.mockResolvedValue({
      id: 1,
      username: 'johndoe',
      email: 'john@example.com',
      role: 'user',
    });

    const created = await controller.register({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'S3cret!pass',
    });

    expect(created).not.toHaveProperty('password');
    expect(created).not.toHaveProperty('salt');
  });

  it('returns only the token on login', async () => {
    const result = await controller.login({
      username: 'johndoe',
      password: 'S3cret!pass',
    });

    expect(Object.keys(result)).toEqual(['access_token']);
  });
});
