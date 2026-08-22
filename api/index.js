import fs from "node:fs";
import path from "node:path";
import worker from "../dist/server/index.js";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

async function readRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return undefined;

  if (req.body !== undefined && req.body !== null) {
    if (Buffer.isBuffer(req.body) || typeof req.body === "string") {
      return req.body;
    }
    return JSON.stringify(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

function stripTutorMarkdown(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/\*\*/g, "")
    .replace(/__/g, "");
}

export default async function handler(req, res) {
  try {
    const host = req.headers.host || "localhost";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const url = new URL(req.url, `${proto}://${host}`);

    // Vercel rewrites every public path to this serverless function. Preserve
    // the original path in vercel.json and restore it before passing the
    // request to the Vinext worker; otherwise Vinext sees /api/index and 404s.
    const originalPath = url.searchParams.get("__path");
    if (originalPath) {
      url.pathname = originalPath;
      url.searchParams.delete("__path");
    }

    const pathname = decodeURIComponent(url.pathname);

    // 1. Try serving static files from dist/client or public
    const candidatePaths = [
      path.join(process.cwd(), "dist", "client", pathname.replace(/^\//, "")),
      path.join(process.cwd(), "public", pathname.replace(/^\//, "")),
    ];

    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        res.statusCode = 200;
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    // 2. Handle SSR/API via Vinext Worker
    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (val !== undefined) {
        if (Array.isArray(val)) {
          for (const v of val) headers.append(key, v);
        } else {
          headers.set(key, val);
        }
      }
    }

    const body = await readRequestBody(req);
    if (body !== undefined) {
      // The body may have been parsed/re-serialized by Vercel, so do not forward
      // the original byte count/transfer metadata.
      headers.delete("content-length");
      headers.delete("transfer-encoding");
    }

    const requestInit = {
      method: req.method,
      headers,
      ...(body !== undefined ? { body, duplex: "half" } : {}),
    };

    const request = new Request(url.href, requestInit);

    const fetchHandler = typeof worker === "function" ? worker : (worker?.default || worker?.fetch);

    const response = await fetchHandler(
      request,
      {
        ASSETS: {
          fetch: async (assetReq) => {
            const assetUrl = new URL(typeof assetReq === "string" ? assetReq : assetReq.url);
            const assetPath = path.join(process.cwd(), "dist", "client", assetUrl.pathname.replace(/^\//, ""));
            if (fs.existsSync(assetPath) && fs.statSync(assetPath).isFile()) {
              const ext = path.extname(assetPath).toLowerCase();
              return new Response(fs.readFileSync(assetPath), {
                headers: { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" },
              });
            }
            return new Response("Not Found", { status: 404 });
          },
        },
      },
      {
        waitUntil() {},
        passThroughOnException() {},
      }
    );

    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }

    const arrayBuffer = await response.arrayBuffer();
    let responseBuffer = Buffer.from(arrayBuffer);

    if (pathname === "/api/tutor-chat") {
      try {
        const payload = JSON.parse(responseBuffer.toString("utf8"));
        if (payload && typeof payload === "object") {
          if ("reply" in payload) payload.reply = stripTutorMarkdown(payload.reply);
          if ("suggestedSentence" in payload) payload.suggestedSentence = stripTutorMarkdown(payload.suggestedSentence);
          responseBuffer = Buffer.from(JSON.stringify(payload));
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Content-Length", String(responseBuffer.length));
        }
      } catch (sanitizeError) {
        console.warn("Tutor response markdown cleanup skipped", sanitizeError);
      }
    }

    res.end(responseBuffer);
  } catch (error) {
    console.error("Vercel Vinext adapter failed", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(`Internal Server Error: ${error?.message || error}`);
  }
}
