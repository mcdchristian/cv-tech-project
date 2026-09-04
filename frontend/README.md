# CV Tech — frontend

Client React + Vite de l'[API CV Tech](../README.md).

## Démarrer

```bash
cp .env.example .env
npm install
npm run dev
```

Le serveur écoute sur http://localhost:4200 (voir `vite.config.ts`) et appelle
l'API à l'URL de `VITE_API_URL`. Cette origine doit correspondre au
`FRONTEND_URL` du backend, sinon CORS bloque les requêtes.

## Vérifications

```bash
npm run lint && npm run build
```

Les deux tournent en CI sur chaque push et chaque pull request.

## Repères

- `src/api/api.ts` — client HTTP. Consomme les payloads bruts de l'API : ne pas
  activer `TransformInterceptor` côté backend sans adapter ce fichier.
- `src/context/auth-context.ts` — contexte, hook `useAuth`, décodage du JWT.
  Séparé de `AuthContext.tsx` pour ne pas casser le Fast Refresh.
- `src/context/AuthContext.tsx` — le provider. Purge la session à l'expiration
  du token et sur tout 401 renvoyé par l'API.
