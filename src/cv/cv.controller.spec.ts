import { Test, TestingModule } from '@nestjs/testing';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { UserEntity } from '../user/entities/user.entity/user.entity';
import { CvEntity } from './entities/cv.entity/cv.entity';

const owner: Partial<UserEntity> = { id: 1, username: 'owner' };

describe('CvController', () => {
  let controller: CvController;
  let service: jest.Mocked<CvService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvController],
      providers: [
        {
          provide: CvService,
          useValue: {
            getCvs: jest.fn().mockResolvedValue([]),
            getCvById: jest.fn(),
            addCv: jest.fn(),
            updateCv: jest.fn(),
            softDeleteCv: jest.fn(),
            restoreCv: jest.fn(),
            getCvNumberByAge: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    })
      // Le guard est testé à part ; ici on vérifie le câblage du contrôleur.
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(CvController);
    service = module.get(CvService);
  });

  it('never lets a caller choose whose CVs are returned', async () => {
    await controller.getAllCvs(owner);

    // L'utilisateur vient du token, jamais d'un paramètre de requête.
    expect(service.getCvs).toHaveBeenCalledWith(owner);
  });

  it('attaches the authenticated user to a created CV', async () => {
    const body = {
      name: 'Doe',
      firstname: 'John',
      age: 30,
      cin: 1,
      job: 'Dev',
    };

    await controller.addCv(body, owner);

    expect(service.addCv).toHaveBeenCalledWith(body, owner);
  });

  it('passes the caller through on update, so ownership can be enforced', async () => {
    await controller.updateCv({ job: 'Lead' }, 7, owner);

    expect(service.updateCv).toHaveBeenCalledWith(7, { job: 'Lead' }, owner);
  });

  it('passes the caller through on delete and restore', async () => {
    await controller.softDeleteCv(7, owner);
    await controller.restoreCv(7, owner);

    expect(service.softDeleteCv).toHaveBeenCalledWith(7, owner);
    expect(service.restoreCv).toHaveBeenCalledWith(7, owner);
  });

  it('forwards the validated stats range', async () => {
    await controller.getCvNumberByAge(owner, { minAge: 18, maxAge: 50 });

    expect(service.getCvNumberByAge).toHaveBeenCalledWith(owner, {
      minAge: 18,
      maxAge: 50,
    });
  });

  it('scopes a lookup by id to the caller', async () => {
    service.getCvById.mockResolvedValue({ id: 7 } as CvEntity);

    await controller.getCvById(7, owner);

    expect(service.getCvById).toHaveBeenCalledWith(7, owner);
  });
});
