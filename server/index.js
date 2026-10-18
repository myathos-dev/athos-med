import "dotenv/config";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isProd = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 3000;

// Records live in a local JSON file (git-ignored). It starts empty.
const DATA_FILE = path.join(root, "data", "records.json");

async function readRecords() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeRecords(records) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2));
}

const app = express();
app.use(express.json({ limit: "1mb" }));

// Local development user (see .env.example).
app.get("/api/me", (_req, res) => {
  res.json({
    id: process.env.DEV_USER_ID || "local-user",
    fullName: process.env.DEV_USER_NAME || "Local User",
    email: process.env.DEV_USER_EMAIL || "",
    role: process.env.DEV_USER_ROLE || "Admin",
  });
});

app.get("/api/records", async (req, res, next) => {
  try {
    const records = await readRecords();
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));
    const items = records.slice(offset, offset + limit);
    const nextOffset = offset + limit < records.length ? offset + limit : null;
    res.json({ items, nextOffset });
  } catch (err) {
    next(err);
  }
});

app.patch("/api/records/:id", async (req, res, next) => {
  try {
    const fields = req.body?.fields;
    if (!fields || typeof fields !== "object") return res.status(400).send("Missing fields");
    const records = await readRecords();
    const record = records.find((r) => r.id === req.params.id);
    if (!record) return res.status(404).send("Record not found");
    record.fields = { ...record.fields, ...fields };
    await writeRecords(records);
    res.json(record);
  } catch (err) {
    next(err);
  }
});

app.use("/api", (_req, res) => res.status(404).send("Not found"));

if (isProd) {
  const dist = path.join(root, "dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send(err.message || "Server error");
});

app.listen(PORT, () => {
  console.log(`Athos Med running at http://localhost:${PORT}`);
});
