# PDF UI

## Features

Visually organize pdf files online.

- SPLIT pdfs
- SPLIT by barcode (for example 3of9 barcode will be autosplit and name of file is value of barcode)
- MERGE pdfs
- ROTATE page
- REMOVE Page
- Download split pdfs in one zip or individually
- Send files to [Moodle Assignment Feedback Packager](https://bfritscher.github.io/moodle-assignment-feedback-packager/)

## Resources

- http://www.dafont.com/3of9-barcode.font
- pdftk, zbar-tools and ghostscript are used to manipulate the pdfs.

.env
SESSION_SECRET


## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Development setup (frontend local + backend in Docker)

Run backend with Docker Compose:

```sh
docker compose -f docker-compose.dev.yml up --build
```

If you previously hit `invalid ELF header` for `sqlite3`, recreate the backend volume once:

```sh
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

Run frontend locally in another terminal:

```sh
npm run dev
```

Vite proxies backend endpoints (`/session`, `/reset`, `/upload`, `/export`, `/zip`, `/mafp`, `/uploads`) to `http://localhost:3000`.

### Compile and Minify for Production

```sh
npm run build
```

### Docker Compose production volumes

For persistent storage in production, mount these container folders:

- `/app/backend/uploads` (generated uploads and thumbnails)
- `/app/backend/data` (sqlite session database)

Example:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      SESSION_SECRET: change-me
      UPLOAD_TTL_MS: "86400000"
      UPLOAD_CLEANUP_INTERVAL_MS: "3600000"
    volumes:
      - app_uploads:/app/backend/uploads
      - app_data:/app/backend/data

volumes:
  app_uploads:
  app_data:
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
