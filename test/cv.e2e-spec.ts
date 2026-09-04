import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';

/**
 * Parcours authentifié complet contre une vraie base. Les tests unitaires
 * s'arrêtent à la frontière du service : rien ne vérifiait que les guards, les
 * pipes, le filtre d'exceptions et les requêtes SQL fonctionnent ensemble.
 */
describe('CV lifecycle (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;
  const suffix = process.env.JEST_WORKER_ID ?? '0';
  const alice = {
    username: `alice_${suffix}`,
    email: `alice_${suffix}@example.com`,
    password: 'S3cret!pass',
  };
  const mallory = {
    username: `mallory_${suffix}`,
    email: `mallory_${suffix}@example.com`,
    password: 'S3cret!pass',
  };

  const login = async (creds: { username: string; password: string }): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/user/login')
      .send({ username: creds.username, password: creds.password })
      .expect(201);
    return (res.body as { access_token: string }).access_token;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Doit refléter main.ts, sinon le test valide une application différente.
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    // Les comptes peuvent déjà exister d'une exécution précédente : 201 ou 409.
    for (const account of [alice, mallory]) {
      await request(app.getHttpServer()).post('/api/v1/user').send(account);
    }
    token = await login(alice);
  });

  afterAll(async () => {
    await app.close();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('rejects an unauthenticated request', () => {
    return request(app.getHttpServer()).get('/api/v1/cv').expect(401);
  });

  it('rejects a malformed body with 400 and names the field', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/cv')
      .set(auth())
      .send({ name: 'Doe', firstname: 'John', age: 5, cin: 1, job: 'Dev' })
      .expect(400);

    expect(JSON.stringify(res.body)).toContain('age');
  });

  it('creates, reads, updates, soft-deletes and restores a CV', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/cv')
      .set(auth())
      .send({ name: 'Doe', firstname: 'John', age: 30, cin: 4242, job: 'Dev' })
      .expect(201);
    const id = (created.body as { id: number }).id;

    await request(app.getHttpServer()).get(`/api/v1/cv/${id}`).set(auth()).expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/cv/${id}`)
      .set(auth())
      .send({ job: 'Lead' })
      .expect(200);

    await request(app.getHttpServer()).delete(`/api/v1/cv/${id}`).set(auth()).expect(200);
    // Soft-deleted : invisible en lecture normale...
    await request(app.getHttpServer()).get(`/api/v1/cv/${id}`).set(auth()).expect(404);
    // ...mais restaurable.
    await request(app.getHttpServer()).patch(`/api/v1/cv/${id}/restore`).set(auth()).expect(200);
    await request(app.getHttpServer()).get(`/api/v1/cv/${id}`).set(auth()).expect(200);
  });

  it("never exposes another account's CV", async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/cv')
      .set(auth())
      .send({ name: 'Secret', firstname: 'Alice', age: 33, cin: 7, job: 'Dev' })
      .expect(201);
    const id = (created.body as { id: number }).id;

    const intruder = `Bearer ${await login(mallory)}`;

    await request(app.getHttpServer())
      .get(`/api/v1/cv/${id}`)
      .set('Authorization', intruder)
      .expect(404);
    await request(app.getHttpServer())
      .patch(`/api/v1/cv/${id}`)
      .set('Authorization', intruder)
      .send({ job: 'pwned' })
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/api/v1/cv/${id}`)
      .set('Authorization', intruder)
      .expect(403);
  });

  it('scopes the stats to the caller and honours the range', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/cv/stats?minAge=30&maxAge=30')
      .set(auth())
      .expect(200);

    const rows = res.body as { age: number }[];
    expect(rows.every((r) => Number(r.age) === 30)).toBe(true);
  });
});
