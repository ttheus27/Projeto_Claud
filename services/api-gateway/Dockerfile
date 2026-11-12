FROM node:22-alpine AS frontend
WORKDIR /build
COPY Projeto/package*.json ./
RUN npm ci
COPY Projeto/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY services/api-gateway/package*.json ./
RUN npm ci --omit=dev
COPY services/api-gateway/src ./src
COPY --from=frontend /build/dist ./public
EXPOSE 8090
CMD ["npm", "start"]
