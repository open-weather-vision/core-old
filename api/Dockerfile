FROM "node:20-alpine"

WORKDIR api
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN npm install
ADD ./ ./
RUN npm run build
EXPOSE 3333
ENTRYPOINT ./entrypoint.sh