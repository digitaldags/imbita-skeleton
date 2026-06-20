FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./

RUN npm ci

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

# Accept build arguments for environment variables
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG RESEND_API_KEY
ARG RESEND_FROM_EMAIL
ARG WEDDING_DATE

# Set them as environment variables for the build process
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_KEY=$SUPABASE_KEY
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV RESEND_FROM_EMAIL=$RESEND_FROM_EMAIL
ENV WEDDING_DATE=$WEDDING_DATE

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Next.js uses this at runtime
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Accept runtime environment variables
ARG SUPABASE_URL
ARG SUPABASE_KEY
ARG RESEND_API_KEY
ARG RESEND_FROM_EMAIL
ARG NEXT_PUBLIC_WEDDING_DATE
ARG WEDDING_DATE

# Set them as environment variables for runtime
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_KEY=$SUPABASE_KEY
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV RESEND_FROM_EMAIL=$RESEND_FROM_EMAIL
ENV NEXT_PUBLIC_WEDDING_DATE=$NEXT_PUBLIC_WEDDING_DATE
ENV WEDDING_DATE=$WEDDING_DATE

RUN apk add --no-cache libc6-compat

# Copy package files and install production dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./package-lock.json
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

CMD ["npm", "run", "start"]
