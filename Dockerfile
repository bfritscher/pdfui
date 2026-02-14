FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y \
  zbar-tools \
  ghostscript \
  pdftk \
  imagemagick \
  && rm -rf /var/lib/apt/lists/*
RUN sed -i '/disable ghostscript format types/,+6d' /etc/ImageMagick-6/policy.xml
RUN sed -i 's/<policy domain="resource" name="memory" value="256MiB"\/>/<policy domain="resource" name="memory" value="1GiB"\/>/' /etc/ImageMagick-6/policy.xml
RUN sed -i 's/<policy domain="resource" name="map" value="512MiB"\/>/<policy domain="resource" name="map" value="1GiB"\/>/' /etc/ImageMagick-6/policy.xml

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./
COPY --from=frontend-build /app/dist /app/dist

ENV NODE_ENV=production
EXPOSE 80
CMD ["node", "server.js"]
