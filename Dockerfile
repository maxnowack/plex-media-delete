FROM node:slim as build

WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install --no-audit --production
COPY index.js index.js

ENTRYPOINT ["node", "/app/index.js"]
