FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@12.5.1 --activate

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install || (pnpm approve-builds --all && pnpm install)

RUN pnpm prisma generate

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN pnpm build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@12.5.1 --activate

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY tsconfig.json ./

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "pnpm prisma db push && node dist/prisma/seed.js && node dist/src/main.js"]
