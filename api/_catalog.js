/**
 * Sunucu tarafı fiyat listesi.
 * Tarayıcıdan gelen tutara güvenmemek için sipariş toplamı burada yeniden hesaplanır.
 *
 * ÖNEMLİ: js/products.js içindeki id ve price değerleriyle aynı kalmalı.
 * Ürün fiyatı değiştirdiğinizde burayı da güncelleyin.
 */

const PRICES = {
  "tisort-oak": 890,
  "tisort-indigo": 920,
  "pantolon-cord": 1890,
  "pantolon-denim": 1640,
  "forma-home": 2490,
  "forma-away": 2390,
  "ayakkabi-boot": 3290,
  "ayakkabi-sneaker": 2790,
  "aksesuar-scarf": 690,
  "aksesuar-cap": 540,
  "corap-crew": 280,
  "corap-wool": 190
};

const NAMES = {
  "tisort-oak": "Oak Soft Tee",
  "tisort-indigo": "Nord Indigo Tee",
  "pantolon-cord": "Cedar Cord Pantolon",
  "pantolon-denim": "Blue Hour Denim",
  "forma-home": "Nord Home Forma",
  "forma-away": "Mist Away Forma",
  "ayakkabi-boot": "Amber Chelsea Bot",
  "ayakkabi-sneaker": "Harbor Sneaker",
  "aksesuar-scarf": "Forest Atkı",
  "aksesuar-cap": "Nord Kep",
  "corap-crew": "Twin Crew Çorap (2’li)",
  "corap-wool": "Wool Ankle Çorap"
};

/** Çorap kampanyası */
const SOCK_IDS = ["corap-crew", "corap-wool"];
const SOCK_DISCOUNT_PERCENT = 10;

/** Çarkta bulunan ödüller — istemciden gelen ödül bu listede yoksa yok sayılır */
const ALLOWED_PRIZES = [
  { type: "percent", value: 5 },
  { type: "percent", value: 10 },
  { type: "percent", value: 15 },
  { type: "amount", value: 50 },
  { type: "amount", value: 100 },
  { type: "amount", value: 150 }
];

const MAX_QTY_PER_LINE = 10;

/**
 * Sipariş toplamını katalog fiyatlarından hesaplar.
 * @param {Array<{id:string,qty:number,size?:string}>} items
 * @param {{type:string,value:number}|null} wheelPrize
 */
function priceOrder(items, wheelPrize) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Sepet boş.");
  }
  if (items.length > 30) {
    throw new Error("Sepette çok fazla satır var.");
  }

  let subtotal = 0;
  let hasSock = false;
  const lines = [];

  for (const item of items) {
    const price = PRICES[item && item.id];
    if (!price) throw new Error("Bilinmeyen ürün: " + (item && item.id));

    const qty = Math.floor(Number(item.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
      throw new Error("Geçersiz adet: " + (item && item.id));
    }

    subtotal += price * qty;
    if (SOCK_IDS.includes(item.id)) hasSock = true;

    const size = typeof item.size === "string" ? item.size.slice(0, 12) : "";
    lines.push(NAMES[item.id] + (size ? " (" + size + ")" : "") + " x" + qty);
  }

  let discount = 0;
  if (hasSock) discount += (subtotal * SOCK_DISCOUNT_PERCENT) / 100;

  const prize =
    wheelPrize &&
    ALLOWED_PRIZES.find((p) => p.type === wheelPrize.type && p.value === Number(wheelPrize.value));
  if (prize) {
    discount += prize.type === "percent" ? (subtotal * prize.value) / 100 : prize.value;
  }

  discount = Math.min(discount, subtotal);
  const total = Math.max(0, subtotal - discount);

  if (total < 1) throw new Error("Ödenecek tutar geçersiz.");

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    total: Number(total.toFixed(2)),
    productName: lines.join(", ").slice(0, 240)
  };
}

module.exports = { PRICES, NAMES, priceOrder };
