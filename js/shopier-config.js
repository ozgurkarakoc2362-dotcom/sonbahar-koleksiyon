/**
 * ============================================================
 * SHOPIER ÖDEME YAPILANDIRMASI
 * ============================================================
 *
 * Shopier, ödeme isteğinin API Secret ile imzalanmasını (HMAC) zorunlu tutar.
 * Bu yüzden anahtarlar tarayıcıda TUTULAMAZ; imzalama işini "api/shopier.js"
 * içindeki aracı servis yapar (Vercel gibi ücretsiz bir sunucuda çalışır).
 *
 * KURULUM:
 *   1. Bu depoyu Vercel'e bağlayın (vercel.com → Add New → Project → Import).
 *   2. Vercel → Settings → Environment Variables:
 *        SHOPIER_API_KEY     = Shopier panelindeki API Kullanıcı Adı
 *        SHOPIER_API_SECRET  = Shopier panelindeki API Şifresi
 *        SITE_URL            = https://kullaniciadi.github.io/sonbahar-koleksiyon
 *   3. Vercel'in verdiği adresi aşağıdaki endpoint alanına yazın.
 *   4. Shopier panelinde geri dönüş (callback) adresi olarak şunu tanımlayın:
 *        https://PROJE.vercel.app/api/shopier-callback
 *
 * endpoint boş bırakılırsa site demo modda çalışır: gerçek para çekilmez,
 * sipariş özeti gösterilir.
 */

const SHOPIER_CONFIG = {
  /** Örnek: "https://sonbahar-koleksiyon.vercel.app/api/shopier" */
  endpoint: "",

  /** Ödeme penceresinin başlığında görünen mağaza adı */
  storeName: "Atelier Nord",

  /** Kargo ücreti (0 = ücretsiz kargo) */
  shipping: 0,

  /** Ücretsiz kargo alt limiti (TL) — bilgilendirme metni için */
  freeShippingOver: 0
};

/** Aracı servis tanımlı mı? */
function shopierReady() {
  return typeof SHOPIER_CONFIG.endpoint === "string" && SHOPIER_CONFIG.endpoint.trim().length > 0;
}

/**
 * Aracı servise gönderilecek sipariş paketi.
 * Sunucu tutarı katalogdan yeniden hesaplar; buradaki total sadece kontrol içindir.
 */
function buildShopierOrder(buyer, summary) {
  return {
    orderId: "AN-" + Date.now(),
    buyer,
    items: summary.items.map((i) => ({
      id: i.productId,
      size: i.size,
      qty: i.qty
    })),
    wheelPrize: summary.wheelPrize
      ? { type: summary.wheelPrize.type, value: summary.wheelPrize.value }
      : null,
    clientTotal: Number(summary.total.toFixed(2)),
    returnUrl: location.origin + location.pathname
  };
}
