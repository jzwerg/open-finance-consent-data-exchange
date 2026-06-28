# Gateway + auth API — Node/TS (Fastify). Node 20 to match CI and MILESTONE.md.
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV FAPI_KEYS_DIR=/keys
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
# Migrations are applied at startup (see src/db/migrate.ts).
COPY drizzle ./drizzle

# Signing keys are generated here at startup; make the dir writable by the node user.
RUN mkdir -p /keys && chown -R node:node /keys
USER node

EXPOSE 3000
CMD ["node", "dist/server.js"]
