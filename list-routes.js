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
 * XianFire — Route List Utility
 * Usage: xian route:list
 * Prints all registered Express routes in a formatted table.
 */

import express from "express";

const app = express();
const router = (await import("./routes/index.js")).default;
app.use("/", router);

const routes = [];

const walk = (stack, prefix = "") => {
  for (const layer of stack) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      const fullPath = prefix + layer.route.path;
      const handler = layer.route.stack
        .map(s => (s.handle && s.handle.name) || "anonymous")
        .join(" → ");
      routes.push({ methods: methods.join(", "), path: fullPath, handler });
    } else if (layer.name === "router" && layer.handle && layer.handle.stack) {
      const mountPath = layer.regexp.source
        .replace(/^\//, "")
        .replace(/\.\*\*\/?\$/g, "")
        .replace(/\//g, "")
        .trim();
      walk(layer.handle.stack, prefix + (mountPath || ""));
    }
  }
};

walk(app._router.stack);

// ── Pretty Print ──────────────────────────────────────────────────────────────
console.log("\n");
console.log("╔══════════════════════════════════════════════════════════════════╗");
console.log("║           🔥 XianFire — Registered Routes                        ║");
console.log("╠══════════════════════════════════════════════════════════════════╣");

if (routes.length === 0) {
  console.log("║  (no routes found)                                               ║");
} else {
  const methodWidth = Math.max(...routes.map(r => r.methods.length), 7);
  const pathWidth = Math.max(...routes.map(r => r.path.length), 4);

  routes.forEach((r, i) => {
    const line = String(i + 1).padStart(3);
    const method = r.methods.padEnd(methodWidth);
    const p = r.path.padEnd(pathWidth);
    const handler = r.handler;
    console.log(`║ ${line}  ${method}  ${p}  ${handler.padEnd(38)}║`);
  });
}

console.log("╚══════════════════════════════════════════════════════════════════╝");
console.log(`\n   Total: ${routes.length} route(s) registered\n\n`);

process.exit(0);