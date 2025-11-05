# Dockerfile para Fly.io
FROM node:18-alpine

WORKDIR /app

# Copiar package.json primeiro
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci --only=production

# Copiar resto do código
COPY backend/ ./backend/

# Expor porta (Fly.io gerencia isso, mas é bom ter)
EXPOSE 8080

# Comando para iniciar
CMD ["node", "backend/server.js"]

