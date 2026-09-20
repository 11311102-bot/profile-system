FROM node:22-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/server.js ./
COPY public ./public

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["npm", "start"]
