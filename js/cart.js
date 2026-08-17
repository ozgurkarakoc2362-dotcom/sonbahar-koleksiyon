/**
 * Sepet mantığı + çorap kampanyası (%10)
 * Her sayfa açılışında sıfırlanır (eski sepet / çark kaydı tutulmaz).
 */

const CART_STORAGE_KEY = "atelier_nord_cart_v1";
const WHEEL_PRIZE_KEY = "atelier_nord_wheel_prize";

try {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(WHEEL_PRIZE_KEY);
} catch {
  /* tarayıcı depolaması kapalıysa geç */
}

const Cart = {
  items: [],
  wheelPrize: null,

  load() {
    this.items = [];
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(WHEEL_PRIZE_KEY);
    } catch {
      /* ignore */
    }
    return this.items;
  },

  save() {
    /* Sayfa kapanınca unutulsun diye kaydetmiyoruz */
  },

  /**
   * @param {string} productId
   * @param {string} size
   * @param {number} qty
   */
  add(productId, size = "", qty = 1) {
    const product = getProductById(productId);
    if (!product) return { ok: false, message: "Ürün bulunamadı." };
    if (product.stock <= 0) return { ok: false, message: "Stokta yok." };

    const key = `${productId}__${size || "default"}`;
    const existing = this.items.find((i) => i.key === key);
    if (existing) {
      existing.qty += qty;
    } else {
      this.items.push({
        key,
        productId,
        size,
        qty,
        priceAtAdd: product.price,
        name: product.name,
        image: product.image,
        category: product.category
      });
    }
    this.save();
    return { ok: true, message: `${product.name} sepete eklendi.` };
  },

  setQty(key, qty) {
    const item = this.items.find((i) => i.key === key);
    if (!item) return;
    if (qty <= 0) {
      this.remove(key);
      return;
    }
    item.qty = qty;
    this.save();
  },

  remove(key) {
    this.items = this.items.filter((i) => i.key !== key);
    this.save();
  },

  clear() {
    this.items = [];
    this.save();
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  /** Ara toplam (indirim öncesi) */
  subtotal() {
    return this.items.reduce((sum, i) => sum + i.priceAtAdd * i.qty, 0);
  },

  getWheelPrize() {
    if (this.wheelPrize) return this.wheelPrize;
    return window.__wheelPrize || null;
  },

  setWheelPrize(prize) {
    this.wheelPrize = prize || null;
    window.__wheelPrize = this.wheelPrize;
  },

  /** Çorap kampanyası aktif mi? */
  hasDiscountTrigger() {
    const cat = DISCOUNT_RULES.triggerCategory;
    return this.items.some((i) => i.category === cat && i.qty > 0);
  },

  discountLines() {
    const subtotal = this.subtotal();
    const lines = [];
    if (this.hasDiscountTrigger()) {
      lines.push({
        label: DISCOUNT_RULES.label,
        amount: (subtotal * DISCOUNT_RULES.percent) / 100
      });
    }
    const prize = this.getWheelPrize();
    if (prize) {
      const amount =
        prize.type === "percent" ? (subtotal * prize.value) / 100 : prize.value;
      lines.push({
        label: prize.label || "Çark indirimi",
        amount
      });
    }
    return lines;
  },

  discountAmount() {
    const subtotal = this.subtotal();
    const sum = this.discountLines().reduce((s, line) => s + line.amount, 0);
    return Math.min(sum, subtotal);
  },

  total() {
    return Math.max(0, this.subtotal() - this.discountAmount());
  },

  summary() {
    const subtotal = this.subtotal();
    const discounts = this.discountLines();
    const discount = this.discountAmount();
    const total = this.total();
    const prize = this.getWheelPrize();
    return {
      items: this.items,
      subtotal,
      discount,
      discounts,
      total,
      discountActive: discount > 0,
      discountLabel: discounts[0]?.label || DISCOUNT_RULES.label,
      discountPercent: DISCOUNT_RULES.percent,
      wheelPrize: prize
    };
  }
};
