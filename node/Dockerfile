FROM node:18-alpine as builder

WORKDIR /build

RUN npm install --location=global pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm test && pnpm run build
RUN pnpm prune --prod


FROM node:18-alpine

WORKDIR /app

# Add user so we don't need --no-sandbox.
RUN addgroup --system apiservice \
  && adduser --system --shell /bin/false --ingroup apiservice apiservice \
  && chown -R apiservice:apiservice /app \
  && apk update && apk upgrade --no-cache

COPY --from=builder /build/dist/ ./dist
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/package.json .

USER apiservice

CMD [ "node", "/app/dist/src/main.js" ]