# Security Policy

## Supported versions

This project is at `0.0.1` and has no released versions. Only the `main`
branch receives fixes.

| Version       | Supported          |
| ------------- | ------------------ |
| `main`        | :white_check_mark: |
| anything else | :x:                |

## Reporting a vulnerability

Report privately through
[GitHub Security Advisories](https://github.com/mcdchristian/cv-tech-project/security/advisories/new).
Please do not open a public issue for a security report.

Include what you need to reproduce it: the endpoint, the request, and what
you observed versus what you expected. Expect an acknowledgement within a
week. If the report is accepted, the fix lands on `main` and the advisory is
published once it is merged; if it is declined, you get the reasoning.

## Scope

The API is unreleased and carries no deployment. Reports are most useful on:

- authentication and JWT handling (`src/user/strategy`, `src/user/guards`)
- CV ownership enforcement (`src/cv/cv.service.ts`)
- anything that lets one account read or modify another account's data

## Known limitations

These are understood and accepted for the current stage, so they are not
worth reporting:

- **`DB_SYNCHRONIZE`** lets TypeORM alter the schema at startup. The docker
  compose stack enables it because the project has no migrations. It must be
  off against any database that matters.
- **The JWT payload carries `id`, `username`, `email` and `role`.** Anyone
  holding a token can read them — a JWT is signed, not encrypted.
- **No token revocation.** A leaked token stays valid until it expires
  (`JWT_EXPIRES_IN`, one hour by default).
- **Rate limiting is per instance, in memory.** It resets on restart and is
  not shared across replicas.

## Automated checks

`npm audit --audit-level=high` gates CI on both manifests, and Dependabot
watches the root, `frontend/`, and the GitHub Actions used by the workflow.
