/**
 * ============================================================
 * SHOPIER ÖDEME BAŞLATMA (aracı servis)
 * ============================================================
 *
 * Neden gerekli: Shopier ödeme isteği API Secret ile HMAC-SHA256 imzalanmak
 * zorunda. Secret tarayıcıya konulamayacağı için imzalama burada yapılır.
 *
 * Vercel ortam değişkenleri:
 *   SHOPIER_API_KEY     — Shopier panelindeki API kullanıcı adı
 *   SHOPIER_API_SECRET  — Shopier panelindeki API şifresi
 *   SITE_URL            — Mağazanın adresi (izin verilen kaynak kontrolü için)
 *
 * Akış: site, siparişi bu adrese form POST eder (target=iframe) → burada imzalı
 * Shopier formu üretilir → iframe içinde otomatik gönderilir → Shopier'in
 * 3D Secure ekranı sitenin içinde açılır (is_in_frame=1).
 */

const crypto = require("crypto");
const { priceOrder } = require("./_catalog");

const SHOPIER_PAY_URL = "https://www.shopier.com/ShowProduct/api_pay4.php";
const CURRENCY_TRY = 0;
const LANG_TR = 0;

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

function parseOrder(req, raw) {
  if (req.body && typeof req.body === "object" && req.body.order) {
    return JSON.parse(req.body.order);
  }
  const params = new URLSearchParams(raw);
  const value = params.get("order");
  if (value) return JSON.parse(value);
  return JSON.parse(raw);
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(title, message) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#faf6f1;color:#2c1f18;
       display:grid;place-items:center;min-height:100vh;padding:28px;text-align:center}
  h1{font-size:19px;margin:0 0 10px}
  p{margin:0;font-size:14px;line-height:1.6;color:#6b574a;max-width:34em}
</style></head><body><div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p></div></body></html>`;
}

function autoSubmitForm(fields) {
  const inputs = Object.entries(fields)
    .map(([key, value]) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(value)}" />`)
    .join("\n");

  return `<!doctype html><html lang="tr"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Güvenli ödemeye yönlendiriliyor</title>
<style>
  body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#faf6f1;color:#6b574a;
       display:grid;place-items:center;min-height:100vh;font-size:14px}
</style></head><body>
<p>Güvenli ödeme ekranı açılıyor…</p>
<form id="f" method="POST" action="${SHOPIER_PAY_URL}">
${inputs}
</form>
<script>document.getElementById("f").submit();</script>
</body></html>`;
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(page("Yöntem desteklenmiyor", "Bu adres yalnızca ödeme başlatmak için POST isteği kabul eder."));
    return;
  }

  const apiKey = process.env.SHOPIER_API_KEY;
  const apiSecret = process.env.SHOPIER_API_SECRET;
  if (!apiKey || !apiSecret) {
    res.statusCode = 500;
    res.end(
      page(
        "Shopier anahtarları eksik",
        "Sunucuda SHOPIER_API_KEY ve SHOPIER_API_SECRET ortam değişkenlerini tanımlamanız gerekiyor."
      )
    );
    return;
  }

  let order;
  let priced;
  try {
    const raw = await readBody(req);
    order = parseOrder(req, raw);
    priced = priceOrder(order.items, order.wheelPrize);
  } catch (err) {
    res.statusCode = 400;
    res.end(page("Sipariş okunamadı", err.message || "Sipariş bilgileri geçersiz."));
    return;
  }

  const buyer = order.buyer || {};
  const required = ["firstName", "lastName", "email", "phone", "city", "district", "postcode", "address"];
  const missing = required.filter((key) => !String(buyer[key] || "").trim());
  if (missing.length) {
    res.statusCode = 400;
    res.end(page("Teslimat bilgileri eksik", "Şu alanlar boş: " + missing.join(", ")));
    return;
  }

  const orderId = String(order.orderId || "AN-" + Date.now()).slice(0, 40);
  const total = priced.total.toFixed(2);
  const randomNr = String(Math.floor(100000 + Math.random() * 900000));
  const address = `${buyer.address}, ${buyer.district}`.slice(0, 240);
  /* Shopier sonucu bu servise geri gönderir (Vercel adresi) */
  const callbackUrl =
    process.env.SHOPIER_CALLBACK_URL ||
    (req.headers.host ? `https://${req.headers.host}/api/shopier-callback` : "");

  const signatureData = randomNr + orderId + total + CURRENCY_TRY;
  const signature = crypto.createHmac("sha256", apiSecret).update(signatureData).digest("base64");

  const fields = {
    API_key: apiKey,
    website_index: 1,
    platform_order_id: orderId,
    product_name: priced.productName || "Atelier Nord siparişi",
    product_type: 0,
    buyer_name: String(buyer.firstName).slice(0, 60),
    buyer_surname: String(buyer.lastName).slice(0, 60),
    buyer_email: String(buyer.email).slice(0, 80),
    buyer_account_age: 0,
    buyer_id_nr: orderId,
    buyer_phone: String(buyer.phone).replace(/\D/g, "").slice(0, 15),
    billing_address: address,
    billing_city: String(buyer.city).slice(0, 60),
    billing_country: "Turkey",
    billing_postcode: String(buyer.postcode).slice(0, 10),
    shipping_address: address,
    shipping_city: String(buyer.city).slice(0, 60),
    shipping_country: "Turkey",
    shipping_postcode: String(buyer.postcode).slice(0, 10),
    total_order_value: total,
    currency: CURRENCY_TRY,
    platform: 0,
    /* Ödeme ekranı sitenin içindeki pencerede açılsın */
    is_in_frame: 1,
    current_language: LANG_TR,
    modul_version: "atelier-nord-1.0",
    random_nr: randomNr,
    signature,
    callback: callbackUrl
  };

  res.statusCode = 200;
  res.end(autoSubmitForm(fields));
};
