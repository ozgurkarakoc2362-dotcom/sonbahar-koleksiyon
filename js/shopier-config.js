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
  /**
   * Genelde boş bırakın: site Vercel'de yayındaysa ödeme servisi aynı adreste
   * (/api/shopier) olduğu için kendiliğinden bulunur.
   * Servis ayrı bir yerdeyse tam adresi yazın:
   *   "https://proje-adi.vercel.app/api/shopier"
   */
  endpoint: "",

  /** Aynı adresteki /api/shopier otomatik kullanılsın mı? */
  sameOriginApi: true,

  /** Ödeme penceresinin başlığında görünen mağaza adı */
  storeName: "Atelier Nord",

  /** Kargo ücreti (0 = ücretsiz kargo) */
  shipping: 0,

  /** Ücretsiz kargo alt limiti (TL) — bilgilendirme metni için */
  freeShippingOver: 0
};

/**
 * Ödeme isteğinin gideceği adres.
 * GitHub Pages ve yerel denemelerde aracı servis olmadığı için boş döner → demo mod.
 */
function shopierEndpoint() {
  const manual = String(SHOPIER_CONFIG.endpoint || "").trim();
  if (manual) return manual;

  if (!SHOPIER_CONFIG.sameOriginApi) return "";
  if (!location.protocol.startsWith("http")) return "";

  const host = location.hostname.toLowerCase();
  const noApiHere =
    host.endsWith("github.io") || host === "localhost" || host === "127.0.0.1";
  if (noApiHere) return "";

  return location.origin + "/api/shopier";
}

/** Aracı servis kullanılabilir mi? */
function shopierReady() {
  return shopierEndpoint().length > 0;
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
