FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are baked into the client bundle at build time — must be
# present here, not just at runtime.
ARG NEXT_PUBLIC_WEDDING_DATE
ENV NEXT_PUBLIC_WEDDING_DATE=$NEXT_PUBLIC_WEDDING_DATE
ENV NODE_ENV=production

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone output bundles its own node_modules — no npm install needed.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# lib/config.ts reads this file at runtime via fs.readFileSync(process.cwd()).
COPY --from=builder /app/wedding.config.yaml ./wedding.config.yaml

EXPOSE 3000
CMD ["node", "server.js"]
