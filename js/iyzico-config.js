/**
 * ============================================================
 * iyzico YAPILANDIRMASI
 * ============================================================
 *
 * Canlı / sandbox anahtarlarınızı buraya yazın.
 * Gerçek ödeme için bir backend (PHP, Node, vb.) gerekir:
 * iyzico gizli anahtar (secretKey) tarayıcıda ASLA tutulmamalıdır.
 *
 * Bu demo sitede:
 *   mode: "demo"  → sipariş özeti + başarı mesajı (kart bilgisi alınmaz)
 *   mode: "live"  → backend endpoint'inize POST atar (aşağıdaki url)
 *
 * Resmi dokümantasyon: https://docs.iyzico.com/
 */

const IYZICO_CONFIG = {
  /** "demo" | "live" */
  mode: "demo",

  /** Sadece bilgilendirme — gizli anahtarı buraya koymayın */
  apiKeyPublicHint: "sandbox-xxxx-xxxx",

  /**
   * Canlı modda siparişiniz bu adrese JSON olarak gider.
   * Backend'iniz iyzico Checkout Form veya Payment API çağrısı yapmalı.
   * Örnek: "/api/iyzico/create-payment"
   */
  createPaymentUrl: "/api/iyzico/create-payment",

  /** Başarılı dönüş URL'si (iyzico callback) */
  callbackUrl: window.location.origin + window.location.pathname + "?odeme=basarili",

  /** Para birimi */
  currency: "TRY",

  /** Sepet boşken ödeme butonu metni */
  emptyCartMessage: "Önce sepete ürün ekleyin."
};

/**
 * Demo ödeme simülasyonu
 * @param {object} buyer — form alanları
 * @param {object} summary — Cart.summary()
 */
async function processPayment(buyer, summary) {
  if (IYZICO_CONFIG.mode === "demo") {
    await new Promise((r) => setTimeout(r, 900));
    return {
      ok: true,
      demo: true,
      paymentId: "DEMO-" + Date.now(),
      message:
        "Demo ödeme başarılı. Canlı iyzico için js/iyzico-config.js → mode: \"live\" ve backend endpoint ayarlayın.",
      buyer,
      amount: summary.total
    };
  }

  const payload = {
    locale: "tr",
    conversationId: "AN-" + Date.now(),
    price: summary.total.toFixed(2),
    paidPrice: summary.total.toFixed(2),
    currency: IYZICO_CONFIG.currency,
    basketId: "B-" + Date.now(),
    paymentGroup: "PRODUCT",
    callbackUrl: IYZICO_CONFIG.callbackUrl,
    buyer: {
      id: "BY" + Date.now(),
      name: buyer.name.split(" ")[0] || buyer.name,
      surname: buyer.name.split(" ").slice(1).join(" ") || "-",
      email: buyer.email,
      gsmNumber: buyer.phone,
      registrationAddress: buyer.address,
      city: buyer.city,
      country: "Turkey",
      ip: "85.34.78.112"
    },
    shippingAddress: {
      contactName: buyer.name,
      city: buyer.city,
      country: "Turkey",
      address: buyer.address
    },
    billingAddress: {
      contactName: buyer.name,
      city: buyer.city,
      country: "Turkey",
      address: buyer.address
    },
    basketItems: summary.items.map((item) => ({
      id: item.productId,
      name: item.name + (item.size ? ` (${item.size})` : ""),
      category1: item.category,
      itemType: "PHYSICAL",
      price: (item.priceAtAdd * item.qty).toFixed(2)
    })),
    discount: summary.discount,
    discountLabel: summary.discountLabel
  };

  const res = await fetch(IYZICO_CONFIG.createPaymentUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Ödeme başlatılamadı.");
  }

  return res.json();
}
