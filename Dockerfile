FROM node:26-slim AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:26-slim
RUN apt-get update && apt-get install -y \
  zbar-tools \
  ghostscript \
  pdftk \
  imagemagick \
  && rm -rf /var/lib/apt/lists/*
RUN policy_file=$(find /etc -path '*ImageMagick*/policy.xml' 2>/dev/null | head -n1); \
    if [ -n "$policy_file" ] && grep -q 'disable ghostscript format types' "$policy_file"; then \
        sed -i '/disable ghostscript format types/,+6d' "$policy_file"; \
    fi
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=frontend-build /app/dist /app/dist

ENV NODE_ENV=production
EXPOSE 80
CMD ["node", "server.js"]
