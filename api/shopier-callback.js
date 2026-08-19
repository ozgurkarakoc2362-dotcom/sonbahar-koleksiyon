/**
 * ============================================================
 * SHOPIER ÖDEME SONUCU (callback)
 * ============================================================
 *
 * Shopier ödeme bittiğinde sonucu bu adrese gönderir. İmza doğrulanır,
 * ardından ödeme penceresi içinden ana sayfaya haber verilir (postMessage),
 * böylece site sepeti temizleyip başarı mesajı gösterir.
 *
 * Ortam değişkeni:
 *   SITE_URL — mağaza adresi (ör. https://kullanici.github.io/sonbahar-koleksiyon)
 */

const crypto = require("crypto");

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 100000) reject(new Error("İstek çok büyük."));
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resultPage({ ok, title, message, orderId, siteUrl }) {
  const status = ok ? "success" : "failed";
  const backUrl = siteUrl ? siteUrl.replace(/\/$/, "") + (ok ? "/?odeme=basarili" : "/") : "";

  return `<!doctype html><html lang="tr"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#faf6f1;color:#2c1f18;
       display:grid;place-items:center;min-height:100vh;padding:28px;text-align:center}
  .mark{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;margin:0 auto 16px;
        font-size:26px;color:#fff;background:${ok ? "#3d6a94" : "#9b5b4b"}}
  h1{font-size:20px;margin:0 0 8px;font-weight:600}
  p{margin:0 0 6px;font-size:14px;line-height:1.6;color:#6b574a;max-width:32em}
  code{background:#efe7de;padding:2px 5px;font-size:13px}
  a{display:inline-block;margin-top:16px;padding:12px 20px;background:#1d1714;color:#faf6f1;
    text-decoration:none;font-size:12px;letter-spacing:.16em;text-transform:uppercase}
</style></head><body>
<div>
  <div class="mark">${ok ? "&#10003;" : "!"}</div>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(message)}</p>
  ${orderId ? `<p>Sipariş no: <code>${escapeHtml(orderId)}</code></p>` : ""}
  ${backUrl ? `<a href="${escapeHtml(backUrl)}" target="_top">Mağazaya dön</a>` : ""}
</div>
<script>
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { source: "shopier", status: "${status}", orderId: ${JSON.stringify(orderId || "")} },
        "*"
      );
    }
  } catch (e) {}
</script>
</body></html>`;
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  const siteUrl = process.env.SITE_URL || "";
  const apiSecret = process.env.SHOPIER_API_SECRET;

  let data = {};
  try {
    if (req.method === "POST") {
      const raw = await readBody(req);
      const params = new URLSearchParams(raw);
      params.forEach((value, key) => {
        data[key] = value;
      });
      if ((!data.status || !data.signature) && req.body && typeof req.body === "object") {
        data = Object.assign({}, req.body, data);
      }
    } else {
      const url = new URL(req.url, "https://" + (req.headers.host || "localhost"));
      url.searchParams.forEach((value, key) => {
        data[key] = value;
      });
    }
  } catch {
    data = {};
  }

  const orderId = data.platform_order_id || "";

  if (!apiSecret) {
    res.statusCode = 500;
    res.end(
      resultPage({
        ok: false,
        title: "Sunucu ayarı eksik",
        message: "SHOPIER_API_SECRET tanımlı olmadığı için ödeme sonucu doğrulanamadı.",
        orderId,
        siteUrl
      })
    );
    return;
  }

  const expected = crypto
    .createHmac("sha256", apiSecret)
    .update(String(data.random_nr || "") + String(orderId))
    .digest("base64");

  const received = String(data.signature || "");
  const valid =
    received.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));

  if (!valid) {
    res.statusCode = 400;
    res.end(
      resultPage({
        ok: false,
        title: "Ödeme doğrulanamadı",
        message: "Shopier’den gelen imza eşleşmedi. Tutar hesabınıza geçtiyse lütfen bize ulaşın.",
        orderId,
        siteUrl
      })
    );
    return;
  }

  const success = String(data.status || "").toLowerCase() === "success";
  res.statusCode = 200;
  res.end(
    resultPage({
      ok: success,
      title: success ? "Ödemen alındı" : "Ödeme tamamlanmadı",
      message: success
        ? "Siparişin hazırlanmaya başlıyor. Kargo bilgisi e-posta ile gönderilecek."
        : "İşlem onaylanmadı, kartından tahsilat yapılmadı. Dilersen tekrar deneyebilirsin.",
      orderId,
      siteUrl
    })
  );
};
