# Etapa 1: instalar dependências
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Etapa 2: build da aplicação
FROM node:18-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Recebe a URL da API do docker-compose e expõe pro build do Vite
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Etapa 3: servidor para o build (vite preview)
FROM node:18-alpine
WORKDIR /app
# Apenas os arquivos finais
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
