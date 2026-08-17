/**
 * Sepet mantığı + çorap kampanyası (%10)
 * Ürün fiyatları products.js'den okunur; burada hesaplanır.
 */

const CART_STORAGE_KEY = "atelier_nord_cart_v1";
const WHEEL_PRIZE_KEY = "atelier_nord_wheel_prize";

const Cart = {
  items: [],

  load() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      this.items = raw ? JSON.parse(raw) : [];
    } catch {
      this.items = [];
    }
    return this.items;
  },

  save() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
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
    try {
      const raw = localStorage.getItem(WHEEL_PRIZE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setWheelPrize(prize) {
    if (!prize) {
      localStorage.removeItem(WHEEL_PRIZE_KEY);
      return;
    }
    localStorage.setItem(WHEEL_PRIZE_KEY, JSON.stringify(prize));
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
