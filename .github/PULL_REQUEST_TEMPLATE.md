## What this changes

<!-- What was wrong, and why this is the right fix. The diff already says
     what changed — say why it needed changing. -->

## How it was verified

<!-- Not "tests pass" — what did you actually run, and what did it show?
     If the change claims a performance or behaviour improvement, put the
     before/after numbers here. -->

- [ ] `npm run lint:check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e` (needs a reachable MySQL)
- [ ] `npm --prefix frontend run lint && npm --prefix frontend run build`

## Impact

- [ ] Changes an API route, status code, or response shape
- [ ] Changes an entity — the schema shifts on next boot, there are no migrations
- [ ] Adds or bumps a dependency
- [ ] Needs a new environment variable (added to `.env.example` and to the env
      validation schema)

<!-- Anything checked above: say what a consumer has to do about it. A route or
     payload change means updating frontend/src/api/api.ts and the README table
     in the same PR. -->
