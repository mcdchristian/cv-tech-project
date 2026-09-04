# Contributing

## Before you start

Open an issue first for anything beyond a fix. It is cheaper to disagree about
an approach in an issue than in a finished branch.

## Setup

```bash
cp .env.example .env   # SECRET has no default: the app will not boot without it
npm install
docker compose up -d db
npm run start:dev
```

`docker compose up --build` runs the whole stack instead. MySQL is published on
**3307** on the host, because 3306 is usually taken by a local install.

## Before opening a pull request

```bash
npm run lint:check && npm test && npm run build
```

`npm run test:e2e` needs a reachable MySQL. CI runs it against a service
container, so a failure there will surface even if you skip it locally.

All five checks — lint, unit tests, e2e, build, `npm audit --audit-level=high` —
must pass. The audit gate is not decoration: it has caught advisories that
arrived through automated dependency updates.

## Commits

Conventional Commits: `type(scope): subject`, imperative mood.
Used types: `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `build`, `ci`,
`chore`, `style`.

Write the message for someone who will read it in a year without this context.
Say what was wrong and why the change is the right answer — the diff already
says what changed. If a claim can be measured, measure it and put the numbers
in the message.

## Things worth knowing

- **No migrations.** `DB_SYNCHRONIZE` lets TypeORM shape the schema at startup.
  Fine locally, never against a database that matters. An entity change takes
  effect on the next boot.
- **Nest stays on 11.** `@nestjs/throttler` has no release accepting Nest 12,
  and it provides the rate limiting on the auth routes. Dependabot is configured
  to skip those majors.
- **`TransformInterceptor` is deliberately not registered.** Wrapping responses
  in `{ data }` would break `frontend/src/api/api.ts` and the documented
  contract.
- **Ownership lives in `CvService`,** not in the controllers. Anything reaching
  a CV goes through `findOwned` / `assertOwned`.

## Reporting a vulnerability

See [SECURITY.md](SECURITY.md) — not a public issue.
