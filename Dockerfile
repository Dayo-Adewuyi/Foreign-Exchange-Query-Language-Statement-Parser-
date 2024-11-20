FROM node:20-alpine AS builder

ARG NODE_VERSION=20
ARG NODE_ENV=production

RUN apk add --no-cache g++ make python3

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./

RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci

COPY . .

RUN npm run build && npm ci --only=production

FROM node:20-alpine

RUN apk add --no-cache tini wget && \
    addgroup -g 1001 nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

WORKDIR /usr/src/app

COPY --from=builder --chown=nodejs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/package*.json ./

ENV NODE_ENV=production
ENV TZ=UTC
ENV NODE_OPTIONS="--max-old-space-size=2048 --enable-source-maps"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
    CMD ["wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]

USER nodejs

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/main"]