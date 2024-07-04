FROM "node:20-alpine"

WORKDIR api
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm install
ADD ./ ./
RUN npm run build
WORKDIR ./build
RUN npm ci --omit="dev"
EXPOSE 3333
ENTRYPOINT npm run fresh && node bin/server.js