// ---------------------------------------------------------------------------
// drive-loader.js — Fetches and preprocesses documents from Google Drive
// ---------------------------------------------------------------------------
require("dotenv").config();
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// Polyfill DOMMatrix for pdf-parse in Node.js (Vercel Serverless environment)
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
  };
}
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const CREDENTIALS_PATH =
  process.env.GOOGLE_CREDENTIALS_PATH ||
  path.join(__dirname, "Ischool-chatbot credential.json");
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// How often to re-fetch files (30 minutes)
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let knowledgeBase = ""; // preprocessed text ready for the system prompt
let lastRefresh = null;
let isLoading = false;

// ---------------------------------------------------------------------------
// Authenticate with the service account
// ---------------------------------------------------------------------------
function getAuth() {
  let credentials = null;

  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    } catch (e) {
      console.error("Failed to parse GOOGLE_CREDENTIALS_JSON:", e);
    }
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", e);
    }
  } else if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    try {
      const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString("utf8");
      credentials = JSON.parse(decoded);
    } catch (e) {
      console.error("Failed to parse GOOGLE_CREDENTIALS_BASE64:", e);
    }
  } else if (fs.existsSync(CREDENTIALS_PATH)) {
    try {
      credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    } catch (e) {
      console.error("Failed to read credentials file:", e);
    }
  }

  if (!credentials) {
    return null;
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

// ---------------------------------------------------------------------------
// List every file inside the shared folder (recursive — scans subfolders)
// ---------------------------------------------------------------------------
async function listFiles(drive, folderId = FOLDER_ID, depth = 0) {
  const files = [];
  let pageToken = null;
  const indent = "  ".repeat(depth + 1);

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
      pageSize: 100,
      pageToken,
    });
    if (res.data.files) files.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  console.log(`${indent}📂 Found ${files.length} item(s) in folder`);

  // Recursively scan subfolders
  const subfolders = files.filter(
    (f) => f.mimeType === "application/vnd.google-apps.folder"
  );
  const nonFolders = files.filter(
    (f) => f.mimeType !== "application/vnd.google-apps.folder"
  );

  for (const folder of subfolders) {
    console.log(`${indent}📁 Entering subfolder: ${folder.name}`);
    const subFiles = await listFiles(drive, folder.id, depth + 1);
    nonFolders.push(...subFiles);
  }

  return nonFolders;
}

// ---------------------------------------------------------------------------
// Download & extract text from a single file
// ---------------------------------------------------------------------------
async function extractText(drive, file) {
  const { id, name, mimeType } = file;

  try {
    // ── Google Docs → export as plain text ──────────────────────────
    if (mimeType === "application/vnd.google-apps.document") {
      const res = await drive.files.export(
        { fileId: id, mimeType: "text/plain" },
        { responseType: "text" }
      );
      return { name, text: res.data, type: "Google Doc" };
    }

    // ── Google Sheets → export as CSV ───────────────────────────────
    if (mimeType === "application/vnd.google-apps.spreadsheet") {
      const res = await drive.files.export(
        { fileId: id, mimeType: "text/csv" },
        { responseType: "text" }
      );
      return { name, text: res.data, type: "Google Sheet" };
    }

    // ── Google Slides → export as plain text ────────────────────────
    if (mimeType === "application/vnd.google-apps.presentation") {
      const res = await drive.files.export(
        { fileId: id, mimeType: "text/plain" },
        { responseType: "text" }
      );
      return { name, text: res.data, type: "Google Slides" };
    }

    // ── PDF ─────────────────────────────────────────────────────────
    if (mimeType === "application/pdf") {
      const res = await drive.files.get(
        { fileId: id, alt: "media" },
        { responseType: "arraybuffer" }
      );
      const buffer = Buffer.from(res.data);
      let pdfText = "";
      try {
        if (typeof pdfParse === "function") {
          const parsed = await pdfParse(buffer);
          pdfText = parsed.text;
        } else if (pdfParse && pdfParse.PDFParse) {
          const parser = new pdfParse.PDFParse({ data: buffer });
          const parsed = await parser.getText();
          pdfText = parsed.text;
        } else if (pdfParse && pdfParse.default) {
          const parsed = await pdfParse.default(buffer);
          pdfText = parsed.text;
        }
      } catch (e) {
        console.error(`  ⚠️ pdf-parse error on ${name}:`, e.message);
      }
      return { name, text: pdfText, type: "PDF" };
    }

    // ── DOCX ────────────────────────────────────────────────────────
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const res = await drive.files.get(
        { fileId: id, alt: "media" },
        { responseType: "arraybuffer" }
      );
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(res.data),
      });
      return { name, text: result.value, type: "DOCX" };
    }

    // ── Plain text / Markdown / CSV ─────────────────────────────────
    if (
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/csv"
    ) {
      const res = await drive.files.get(
        { fileId: id, alt: "media" },
        { responseType: "text" }
      );
      return { name, text: res.data, type: "Text" };
    }

    // ── Unsupported format ──────────────────────────────────────────
    console.log(`  ⚠️  Skipping "${name}" (unsupported: ${mimeType})`);
    return null;
  } catch (err) {
    console.error(`  ❌ Error reading "${name}":`, err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Preprocess text so the LLM can understand it effectively
// ---------------------------------------------------------------------------
function preprocessText(rawText) {
  let text = rawText;

  // 1. Normalise line endings
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2. Remove excessive blank lines (keep max 2)
  text = text.replace(/\n{4,}/g, "\n\n\n");

  // 3. Remove common PDF artefacts
  text = text.replace(/Page \d+ of \d+/gi, "");
  text = text.replace(/^\d+\s*$/gm, ""); // lone page numbers

  // 4. Collapse repeated whitespace within lines (but preserve indentation)
  text = text
    .split("\n")
    .map((line) => {
      const indent = line.match(/^(\s*)/)[0];
      const rest = line.slice(indent.length).replace(/\s{2,}/g, " ");
      return indent + rest;
    })
    .join("\n");

  // 5. Trim leading/trailing whitespace
  text = text.trim();

  return text;
}

// ---------------------------------------------------------------------------
// Build the full knowledge base from all Drive files
// ---------------------------------------------------------------------------
async function loadKnowledgeBase() {
  if (isLoading) {
    console.log("⏳ Already loading, skipping duplicate request");
    return knowledgeBase;
  }

  if (!FOLDER_ID) {
    console.warn(
      "⚠️  GOOGLE_DRIVE_FOLDER_ID not set — falling back to hardcoded knowledge base"
    );
    return knowledgeBase;
  }

  isLoading = true;
  console.log("\n📥 Loading knowledge base from Google Drive...");

  try {
    const auth = getAuth();
    if (!auth) {
      console.warn("⚠️ No Google Drive credentials found (file or environment variable) — using local course documents.");
      isLoading = false;
      return knowledgeBase;
    }
    const drive = google.drive({ version: "v3", auth });

    const files = await listFiles(drive);

    const documents = [];

    for (const file of files) {
      console.log(`  📄 Processing: ${file.name} (${file.mimeType})`);
      const doc = await extractText(drive, file);
      if (doc && doc.text && doc.text.trim().length > 0) {
        documents.push(doc);
      }
    }

    if (documents.length === 0) {
      console.warn("  ⚠️  No readable documents found in Drive folder");
      isLoading = false;
      return knowledgeBase;
    }

    // Build the knowledge base with clear separators per document
    const sections = documents.map((doc, i) => {
      const cleaned = preprocessText(doc.text);
      return `=== DOCUMENT ${i + 1}: ${doc.name} (${doc.type}) ===\n\n${cleaned}`;
    });

    knowledgeBase = sections.join("\n\n" + "=".repeat(60) + "\n\n");

    lastRefresh = new Date();
    console.log(
      `✅ Knowledge base loaded: ${documents.length} document(s), ${knowledgeBase.length} characters`
    );
    console.log(
      `   Documents: ${documents.map((d) => d.name).join(", ")}`
    );
  } catch (err) {
    console.error("❌ Failed to load from Drive:", err.message);
  } finally {
    isLoading = false;
  }

  return knowledgeBase;
}

// ---------------------------------------------------------------------------
// Auto-refresh on a timer
// ---------------------------------------------------------------------------
function startAutoRefresh() {
  setInterval(async () => {
    console.log("\n🔄 Auto-refreshing knowledge base from Drive...");
    await loadKnowledgeBase();
  }, REFRESH_INTERVAL_MS);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
module.exports = {
  loadKnowledgeBase,
  startAutoRefresh,
  getKnowledgeBase: () => knowledgeBase,
  getLastRefresh: () => lastRefresh,
};
