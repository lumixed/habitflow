FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl python3 make g++

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

# Run schema sync then start the server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]
