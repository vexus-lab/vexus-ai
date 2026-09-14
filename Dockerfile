FROM node:20-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY backend ./backend
COPY frontend ./frontend
COPY .env.example ./.env.example
EXPOSE 8787
CMD ["node", "backend/server.js"]
