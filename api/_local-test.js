/**
 * Sadece yerel deneme içindir (Vercel'de kullanılmaz).
 * Çalıştırma: node api/_local-test.js  → http://localhost:8787/api/shopier
 */

const http = require("http");
const pay = require("./shopier");
const callback = require("./shopier-callback");

process.env.SHOPIER_API_KEY = process.env.SHOPIER_API_KEY || "test-api-key";
process.env.SHOPIER_API_SECRET = process.env.SHOPIER_API_SECRET || "test-api-secret";
process.env.SITE_URL = process.env.SITE_URL || "http://localhost:8099";

http
  .createServer((req, res) => {
    if (req.url.startsWith("/api/shopier-callback")) return callback(req, res);
    if (req.url.startsWith("/api/shopier")) return pay(req, res);
    res.statusCode = 404;
    res.end("not found");
  })
  .listen(8787, () => console.log("test sunucusu: http://localhost:8787"));
