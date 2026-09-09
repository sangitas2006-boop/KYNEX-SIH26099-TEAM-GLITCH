FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
# Vite and TypeScript are dev dependencies needed during the build.
RUN npm ci

COPY . .
RUN npm run build

# Keep the runtime image smaller after the frontend has been compiled.
RUN npm prune --omit=dev

ENV PORT=8787
EXPOSE 8787
CMD ["node", "server/index.mjs"]
