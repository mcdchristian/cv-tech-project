# syntax=docker/dockerfile:1

# @nestjs/core exige Node >= 20 et @nestjs/cli >= 20.11 : l'image node:18
# précédente ne pouvait pas exécuter `nest build`.
# Base Debian (glibc) plutôt qu'Alpine : bcrypt est un module natif et ne
# publie pas de binaire prébuilt pour musl.
FROM node:22-bookworm-slim AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# --- Étape de production : ni sources, ni devDependencies ---
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

# L'image node fournit déjà un utilisateur non-root.
USER node

EXPOSE 3000
CMD ["node", "dist/main"]
