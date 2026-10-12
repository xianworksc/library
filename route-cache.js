/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * XianFire — Route Cache Setup
 * Usage: xian route:cache
 *
 * Generates:
 *   - middleware/cache.js              → in-memory TTL cache middleware
 *   - controllers/cacheController.js   → cache management endpoints
 *   - Appends /api/cache/* routes to routes/index.js
 */

import fs from "fs/promises";
import path from "path";

const ensureDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// ── 1. Generate middleware/cache.js ──────────────────────────────────────────
const middlewareDir = path.join(process.cwd(), "middleware");
await ensureDir(middlewareDir);

const cacheMiddleware = `
/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * XianFire — In-Memory Route Cache Middleware
 *
 * Usage in a router:
 *   import { cacheRoute } from "../middleware/cache.js";
 *   router.get("/api/data", cacheRoute({ ttl: 60000 }), handler);
 */

const cacheStore = new Map();

export const cacheRoute = ({ ttl = 60000, keyPrefix = "", filter = null } = {}) => {
  return (req, res, next) => {
    if (req.method !== "GET") return next();
    if (filter && !filter(req)) return next();

    const cacheKey = `${keyPrefix}${req.originalUrl}`;
    const cached = cacheStore.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      res.set("X-Cache", "HIT");
      res.set("X-Cache-Age", String(Math.floor((Date.now() - cached.timestamp) / 1000)));
      return res.status(cached.status).json(cached.data);
    }

    if (cached) cacheStore.delete(cacheKey);

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cacheStore.set(cacheKey, {
        data: body,
        status: res.statusCode,
        timestamp: Date.now()
      });
      res.set("X-Cache", "MISS");
      res.set("X-Cache-TTL", String(Math.floor(ttl / 1000)));
      return originalJson(body);
    };

    next();
  };
};

export const clearCache = (prefix = "") => {
  let cleared = 0;
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
      cleared++;
    }
  }
  return cleared;
};

export const getCacheStats = () => {
  const now = Date.now();
  let active = 0;
  let expired = 0;
  for (const [, entry] of cacheStore) {
    if (now - entry.timestamp < 60000) active++;
    else expired++;
  }
  return { total: cacheStore.size, active, expired, memoryBytes: estimateMemory() };
};

const estimateMemory = () => {
  let bytes = 0;
  for (const [, entry] of cacheStore) {
    bytes += JSON.stringify(entry.data).length * 2;
  }
  return bytes;
};

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cacheStore) {
    if (now - entry.timestamp >= 60000) cacheStore.delete(key);
  }
}, 5 * 60 * 1000);
cleanupInterval.unref();

export { cacheStore };
`;

await fs.writeFile(path.join(middlewareDir, "cache.js"), cacheMiddleware);
console.log("✅ middleware/cache.js created");

// ── 2. Generate controllers/cacheController.js ───────────────────────────────
const controllerDir = path.join(process.cwd(), "controllers");
await ensureDir(controllerDir);

const cacheController = `
/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { clearCache, getCacheStats, cacheStore } from "../middleware/cache.js";

const cacheController = {
  stats: (req, res) => {
    res.json({ success: true, data: getCacheStats() });
  },
  keys: (req, res) => {
    const keys = Array.from(cacheStore.keys());
    res.json({ success: true, count: keys.length, keys });
  },
  peek: (req, res) => {
    const { key } = req.params;
    const entry = cacheStore.get(decodeURIComponent(key));
    if (!entry) return res.status(404).json({ success: false, message: "Key not found" });
    res.json({ success: true, key, entry: { ...entry, timestamp: new Date(entry.timestamp).toISOString() } });
  },
  clear: (req, res) => {
    const cleared = clearCache();
    res.json({ success: true, message: `Cleared ${cleared} entries` });
  },
  clearByPrefix: (req, res) => {
    const { prefix } = req.params;
    const cleared = clearCache(prefix);
    res.json({ success: true, message: `Cleared ${cleared} entries matching "${prefix}"` });
  }
};

export { cacheController };
`;

await fs.writeFile(path.join(controllerDir, "cacheController.js"), cacheController);
console.log("✅ controllers/cacheController.js created");

// ── 3. Append cache routes to routes/index.js ────────────────────────────────
const routesPath = path.join(process.cwd(), "routes/index.js");
let routesContent = await fs.readFile(routesPath, "utf-8");

if (routesContent.includes("cacheController")) {
  console.log("⚠️  Cache routes already registered in routes/index.js — skipping.");
} else {
  const cacheRoutesBlock = `
// ── Cache Routes ──────────────────────────────────────────────────────────────
import { cacheController } from "../controllers/cacheController.js";
router.get("/api/cache/stats", cacheController.stats);
router.get("/api/cache/keys", cacheController.keys);
router.get("/api/cache/:key", cacheController.peek);
router.delete("/api/cache", cacheController.clear);
router.delete("/api/cache/:prefix", cacheController.clearByPrefix);
`;

  routesContent = routesContent.replace(
    /export default router;/,
    cacheRoutesBlock + "\nexport default router;"
  );

  await fs.writeFile(routesPath, routesContent);
  console.log("✅ Cache routes appended to routes/index.js");
}

console.log("\n✅ Route cache setup complete!");
console.log("   Endpoints available:");
console.log("     GET    /api/cache/stats");
console.log("     GET    /api/cache/keys");
console.log("     GET    /api/cache/:key");
console.log("     DELETE /api/cache");
console.log("     DELETE /api/cache/:prefix");
console.log("\n   To cache a specific route, add the middleware in your router:");
console.log('     import { cacheRoute } from "../middleware/cache.js";');
console.log('     router.get("/your-route", cacheRoute({ ttl: 60000 }), handler);');