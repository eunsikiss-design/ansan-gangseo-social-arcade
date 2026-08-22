import fs from "node:fs";
import path from "node:path";

async function prepareVercelOutput() {
  const root = process.cwd();
  const vercelOutputDir = path.join(root, ".vercel", "output");
  const vercelStaticDir = path.join(vercelOutputDir, "static");
  const distClientDir = path.join(root, "dist", "client");
  const publicDir = path.join(root, "public");

  // Reset .vercel/output directory
  if (fs.existsSync(vercelOutputDir)) {
    fs.rmSync(vercelOutputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(vercelStaticDir, { recursive: true });

  // 1. Copy dist/client files to .vercel/output/static
  if (fs.existsSync(distClientDir)) {
    fs.cpSync(distClientDir, vercelStaticDir, { recursive: true });
    console.log("[VERCEL BUILD] Copied dist/client to .vercel/output/static");
  }

  // 2. Copy public files to .vercel/output/static
  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, vercelStaticDir, { recursive: true });
    console.log("[VERCEL BUILD] Copied public to .vercel/output/static");
  }

  // 3. Create .vercel/output/config.json
  const config = {
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "/api/(.*)", dest: "/api/index.js" },
      { src: "/(.*)", dest: "/index.html" }
    ]
  };

  fs.writeFileSync(
    path.join(vercelOutputDir, "config.json"),
    JSON.stringify(config, null, 2),
    "utf8"
  );
  console.log("[VERCEL BUILD] Wrote .vercel/output/config.json");
}

prepareVercelOutput().catch(console.error);
