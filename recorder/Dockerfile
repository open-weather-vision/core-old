FROM "node:20-alpine"

WORKDIR api
ADD ./ ./

RUN npm install
RUN npm run build
WORKDIR ./build
RUN npm ci --omit="dev"
EXPOSE 3334
ENTRYPOINT npm run fresh && node bin/server.js