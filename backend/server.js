import express from "express";
import multer from "multer";
import cors from "cors";
import session from "express-session";
import connectSqlite3 from "connect-sqlite3";
import "express-zip";
import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { pagesToCommands } from "./utils/index.js";

const exec = promisify(execCallback);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS = path.resolve(__dirname, "uploads");
const FRONTEND_DIST = path.resolve(__dirname, "../dist");
const DATA_DIR = path.resolve(__dirname, "data");

if (!fs.existsSync(UPLOADS)) {
  fs.mkdirSync(UPLOADS, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SQLiteStore = connectSqlite3(session);

const upload = multer({
  storage: multer.diskStorage({
    async destination(req, _file, cb) {
      const dir = path.join(UPLOADS, req.session.id);
      await mkdir(dir, { recursive: true });
      cb(null, dir);
    },
  }),
});

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "pdfui-dev-secret",
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: DATA_DIR,
    }),
    cookie: {
      secure: false,
      httpOnly: true,
    },
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOADS));

function ensureSession(req) {
  if (!req.session.next) {
    req.session.next = 65;
    req.session.fileMapping = {};
    req.session.pages = [];
  }
}

async function ensureThumbsFolder(thumbsFolder) {
  if (!fs.existsSync(thumbsFolder)) {
    await mkdir(thumbsFolder, { recursive: true });
  }
}

const zbarSplitRegex = /num='(\d*?)'[\s\S]*?type='(.*?)' quality='(.*?)'.*?\[CDATA\[(.*?)\]\]/g;

async function scanForSplitCodes(filePath) {
  try {
    const splits = [];
    const { stdout } = await exec(`zbarimg --quiet --xml ${filePath}`);
    let matches;

    while ((matches = zbarSplitRegex.exec(stdout)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (matches.index === zbarSplitRegex.lastIndex) {
        zbarSplitRegex.lastIndex += 1;
      }
      splits[matches[1]] = {
        type: matches[2],
        quality: matches[3],
        name: matches[4],
      };
    }
    return splits;
  } catch (e) {
    return [];
  }
}

const bookmarksRegex =
  /BookmarkBegin\nBookmarkTitle: (.*?)\nBookmarkLevel: (\d+)\nBookmarkPageNumber: (\d+)/g;

async function scanForSplitBookmarks(filePath) {
  try {
    const splits = [];
    const { stdout } = await exec(`pdftk ${filePath} dump_data_utf8`);
    let matches;

    while ((matches = bookmarksRegex.exec(stdout)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (matches.index === bookmarksRegex.lastIndex) {
        bookmarksRegex.lastIndex += 1;
      }
      // 0 index but pdftk starts at page 1
      splits[matches[3] - 1] = {
        type: "bookmark",
        level: matches[2],
        name: matches[1],
      };
    }
    return splits;
  } catch (e) {
    return [];
  }
}

async function convertAndSplit(filePath, thumbsFolder) {
  const zbarPromise = scanForSplitCodes(filePath);
  const bookmarksPromise = scanForSplitBookmarks(filePath);
  await ensureThumbsFolder(thumbsFolder);
  await exec(`convert ${filePath} -resize 600x600\\> ${thumbsFolder}/%03d.png`);
  const split = await zbarPromise;
  Object.assign(split, await bookmarksPromise);
  return split;
}

function nextSplitName(previousName, fallbackPrefix = "A") {
  const current = (previousName || "").trim();
  if (!current) {
    return `${fallbackPrefix}0`;
  }

  const letterMatch = current.match(/^(.*?)([A-Za-z])$/);
  if (letterMatch) {
    const [, prefix, letter] = letterMatch;
    if (letter === "Z") {
      return `${prefix}A`;
    }
    if (letter === "z") {
      return `${prefix}a`;
    }
    return `${prefix}${String.fromCharCode(letter.charCodeAt(0) + 1)}`;
  }

  const numberMatch = current.match(/^(.*?)(\d+)$/);
  if (numberMatch) {
    const [, prefix, number] = numberMatch;
    const normalizedPrefix = prefix || fallbackPrefix;
    return `${normalizedPrefix}${Number.parseInt(number, 10) + 1}`;
  }

  return `${current}1`;
}

async function addFileToSession(filename, thumbsFolder, split, req) {
  ensureSession(req);
  const files = await readdir(thumbsFolder);
  const webThumbsFolder = `/uploads/${req.session.id}/${filename}_thumbs`;
  const char = String.fromCharCode(req.session.next);
  req.session.next += 1;
  req.session.fileMapping[char] = filename;
  let previousSplitName = "";

  const thumbs = files.map((thumbnailName, i) => {
    const splitData = split[i] ? { ...split[i] } : null;

    if (splitData && (!splitData.name || !`${splitData.name}`.trim())) {
      splitData.name = nextSplitName(previousSplitName, char);
    }

    if (i === 0 || splitData) {
      previousSplitName = (splitData?.name || `${char}${i}`).trim();
    }

    return {
      src: char,
      page: i + 1,
      thumb: `${webThumbsFolder}/${thumbnailName}`,
      cutBefore: !!splitData,
      data: splitData || { name: `${char}${i}` },
      remove: false,
      angle: 0,
    };
  });
  req.session.pages = req.session.pages.concat(thumbs);
  req.session.save();
  return thumbs;
}

/* ROUTES */

app.get("/session", (req, res) => {
  const pages = req.session.pages || [];
  res.json(pages);
});

app.get("/reset", (req, res) => {
  req.session.regenerate(() => {
    res.end();
  });
});

app.post("/upload", upload.single("file"), (req, res) => {
  const thumbsFolder = path.join(UPLOADS, req.session.id, `${req.file.filename}_thumbs`);
  convertAndSplit(req.file.path, thumbsFolder)
    .then(async (split) => {
      const thumbs = await addFileToSession(req.file.filename, thumbsFolder, split, req);
      res.send(thumbs);
    })
    .catch((e) => {
      res.status(500).send(e.message);
    });
});

app.post("/export", (req, res) => {
  const commands = pagesToCommands(req.session.fileMapping, req.body);
  Promise.all(commands.map((c) => exec(c, { cwd: path.join(UPLOADS, req.session.id) })))
    .then(() => {
      res.json(commands.map((c) => `/uploads/${req.session.id}/${c.split("output ").pop()}`));
    })
    .catch((e) => {
      res.status(500).json(e);
    });
});

app.post("/zip", (req, res) => {
  let json = req.body;
  if (json.json) {
    json = JSON.parse(json.json);
  }
  res.zip(
    json.map((f) => ({ path: path.join(UPLOADS, req.session.id, f), name: f })),
    "files.zip",
  );
});

app.post("/mafp", async (req, res) => {
  let json = req.body;
  if (json.json) {
    json = JSON.parse(json.json);
  }
  const host = req.headers.origin || `${req.protocol}://${req.get("host")}`;
  const files = json.map((f) => `${host}/uploads/${req.session.id}/${f}`);
  try {
    const outPath = path.join(UPLOADS, req.session.id, "out.json");
    await writeFile(outPath, JSON.stringify(files));
    res.redirect(
      `https://bfritscher.github.io/moodle-assignment-feedback-packager/?url=${host}/uploads/${req.session.id}/out.json`,
    );
  } catch (e) {
    res.sendStatus(500);
  }
});

if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  });
}

const port = process.env.PORT || 80;
app.listen(port);
