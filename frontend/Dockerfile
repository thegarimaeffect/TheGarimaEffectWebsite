# =============================================================================
# The Garima Effect — Frontend (Next.js 14 / production)
# Multi-stage build: deps → build → runtime
# Final image is small (~200MB) and uses Next.js standalone output.
# =============================================================================

# ---- 1) deps stage ----------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Install only production-relevant packages first for cache reuse
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---- 2) build stage ---------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Build-time env. NEXT_PUBLIC_* values are inlined at build time.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---- 3) runtime stage -------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# sharp = native image optimization for next/image in standalone builds.
# Without it, every <Image> render throws and the page can hang during hydration.
RUN apk add --no-cache vips-dev && \
    npm install --omit=dev sharp@0.33.5

# Non-root user for safety
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
