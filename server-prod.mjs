/**
 * Production server for Replit deployment.
 * Serves static assets from dist/client/ and falls back to the Nitro SSR handler.
 */
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const clientDir = join(__dirname, "dist/client");

const { default: nitroHandler } = await import("./dist/server/server.js");

const PORT = Number(process.env.PORT ?? 3000);

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);

    // Serve static files from dist/client/
    const filePath = join(clientDir, url.pathname);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }

    // Fall back to Nitro SSR handler
    return nitroHandler.fetch(req, {}, {});
  },
});

console.log(`HomeCUT server running on http://0.0.0.0:${PORT}`);
