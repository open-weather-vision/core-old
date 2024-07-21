FROM "node:20-alpine"

WORKDIR /
RUN mkdir -p /interfaces
WORKDIR api
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm install
ADD ./ ./
RUN npm run build
EXPOSE 3334
ENTRYPOINT ./entrypoint.sh