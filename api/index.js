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

export default async function handler(req, res) {
  try {
    const host = req.headers.host || "localhost";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const url = new URL(req.url, `${proto}://${host}`);
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

    // 2. Handle SSR via Vinext Worker
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

    const request = new Request(url.href, {
      method: req.method,
      headers,
    });

    const response = await worker.fetch(
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
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(`Internal Server Error: ${error?.message || error}`);
  }
}
