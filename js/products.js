/**
 * ============================================================
 * ÜRÜN KATALOĞU — Fiyat ve içerikleri buradan düzenleyin
 * ============================================================
 *
 * Her ürün için:
 *   id          : benzersiz kod (değiştirmeyin, sepet buna bağlı)
 *   name        : ürün adı
 *   category    : tisort | pantolon | forma | ayakkabi | aksesuar | corap
 *   price       : TL cinsinden birim fiyat (KDV dahil varsayılan)
 *   oldPrice    : (opsiyonel) üstü çizili eski fiyat
 *   badge       : (opsiyonel) rozet metni
 *   shortDesc   : kart altı kısa açıklama
 *   detail      : detay sayfası / modal uzun açıklama
 *   sizes       : beden seçenekleri (boş dizi = beden yok)
 *   image       : fotoğraf URL'si (kendi fotoğraflarınızı images/ klasörüne koyup
 *                 "images/urun-adi.jpg" şeklinde yazabilirsiniz)
 *   stock       : stok adedi
 *
 * İNDİRİM KURALI (js/cart.js içinde de geçerli):
 *   Sepete en az 1 "corap" kategorili ürün eklenince tüm sepete %10 indirim.
 *   Oranı değiştirmek için: DISCOUNT_RULES.percent
 */

const DISCOUNT_RULES = {
  /** Sepette bu kategoriden ürün varsa indirim uygulanır */
  triggerCategory: "corap",
  /** Yüzde indirim (10 = %10) */
  percent: 10,
  /** Kullanıcıya gösterilen açıklama */
  label: "Çorap kampanyası — tüm sepete %10 indirim"
};

const CATEGORY_LABELS = {
  all: "Tüm koleksiyon",
  tisort: "Tişört",
  pantolon: "Pantolon",
  forma: "Forma",
  ayakkabi: "Ayakkabı",
  aksesuar: "Aksesuar",
  corap: "Çorap"
};

const PRODUCTS = [
  {
    id: "tisort-oak",
    name: "Oak Soft Tee",
    category: "tisort",
    price: 890,
    oldPrice: 1090,
    badge: "Yeni",
    shortDesc: "Organik pamuk, toprak kahve tonu, rahat kesim.",
    detail:
      "220 gsm organik pamuk. Omuz düşürmeli rahat kesim. Yıkamada çekmez. Sonbahar katmanlaması için ideal temel parça. Model boyu 184 cm, M beden giyiyor.",
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    stock: 24
  },
  {
    id: "tisort-indigo",
    name: "Nord Indigo Tee",
    category: "tisort",
    price: 920,
    shortDesc: "Derin mavi boyalı pamuk, yıkanmış doku.",
    detail:
      "İndigo pigment boyalı, zamanla yumuşayan doku. Yuvarlak yaka, çift dikiş kenar. Günlük ve hafif spor kullanım.",
    sizes: ["S", "M", "L", "XL"],
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    stock: 18
  },
  {
    id: "pantolon-cord",
    name: "Cedar Cord Pantolon",
    category: "pantolon",
    price: 1890,
    badge: "Sınırlı",
    shortDesc: "Kadife dokulu, geniş paça, kemer detaylı.",
    detail:
      "Kadife kumaş, yüksek bel, geniş paça. İç astarlı cep. Sonbahar yürüyüşleri ve şehir için. Kuru temizleme önerilir.",
    sizes: ["28", "30", "32", "34", "36"],
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
    stock: 12
  },
  {
    id: "pantolon-denim",
    name: "Blue Hour Denim",
    category: "pantolon",
    price: 1640,
    shortDesc: "Orta indigo, düz kesim denim.",
    detail:
      "12 oz denim, stretch’siz, düz kesim. İlk yıkamada hafif renk atması normaldir. Soğuk yıkayın, ters çevirerek kurutun.",
    sizes: ["28", "30", "32", "34", "36"],
    image: "https://images.unsplash.com/photo-1542272454315-7f6b24074416?auto=format&fit=crop&w=800&q=80",
    stock: 20
  },
  {
    id: "forma-home",
    name: "Nord Home Forma",
    category: "forma",
    price: 2490,
    oldPrice: 2790,
    badge: "Maç",
    shortDesc: "Nefes alan kumaş, kahve-mavi şerit detay.",
    detail:
      "Hafif performans kumaşı. Ön göğüste AN monogram, kol şeritleri kahverengi-mavi. Taraftar ve günlük kullanım. Yıkama: 30°C, ütülemeyin.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
    stock: 30
  },
  {
    id: "forma-away",
    name: "Mist Away Forma",
    category: "forma",
    price: 2390,
    shortDesc: "Açık krem zemin, lacivert baskı.",
    detail:
      "Deplasman renkleri: krem zemin, lacivert numaralandırma alanı. Sırt isim/numara opsiyonu sipariş notunda belirtilebilir (ücretsiz).",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80",
    stock: 22
  },
  {
    id: "ayakkabi-boot",
    name: "Amber Chelsea Bot",
    category: "ayakkabi",
    price: 3290,
    badge: "El işçiliği",
    shortDesc: "Kahve deri chelsea, kauçuk taban.",
    detail:
      "Tam deri üst, elastik yan panel, kaymaz kauçuk taban. İç astar yumuşak tekstil. Su itici sprey ile bakım önerilir.",
    sizes: ["40", "41", "42", "43", "44", "45"],
    image: "https://images.unsplash.com/photo-1638247025967-b4cc0c7b8b8a?auto=format&fit=crop&w=800&q=80",
    stock: 10
  },
  {
    id: "ayakkabi-sneaker",
    name: "Harbor Sneaker",
    category: "ayakkabi",
    price: 2790,
    shortDesc: "Lacivert süet, krem taban.",
    detail:
      "Süet üst, köpük orta taban, günlük yürüyüş için tasarlandı. Nemli havada süet koruyucu kullanın.",
    sizes: ["40", "41", "42", "43", "44"],
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    stock: 15
  },
  {
    id: "aksesuar-scarf",
    name: "Forest Atkı",
    category: "aksesuar",
    price: 690,
    shortDesc: "Yün karışım, kahve-mavi ekose.",
    detail:
      "Yün-akrilik karışım, 180×30 cm. Hafif kaşınma hissi yok. Elde yıkama veya yün programı.",
    sizes: [],
    image: "https://images.unsplash.com/photo-1520903920245-00d872a4d99b?auto=format&fit=crop&w=800&q=80",
    stock: 40
  },
  {
    id: "aksesuar-cap",
    name: "Nord Kep",
    category: "aksesuar",
    price: 540,
    shortDesc: "Yapısız kep, nakış logo.",
    detail:
      "Pamuk twill, ayarlanabilir metal toka. Ön panelde küçük AN nakışı. Tek beden.",
    sizes: ["Tek beden"],
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
    stock: 35
  },
  {
    id: "corap-crew",
    name: "Twin Crew Çorap (2’li)",
    category: "corap",
    price: 280,
    badge: "%10 kampanya",
    shortDesc: "Sepete ekleyince tüm alışverişe %10 indirim.",
    detail:
      "Pamuk-elastan, orta kalınlık. 2’li paket: 1 kahve + 1 lacivert. Bu ürün sepete girdiğinde sepet toplamına %10 indirim uygulanır.",
    sizes: ["36-40", "41-45"],
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80",
    stock: 60
  },
  {
    id: "corap-wool",
    name: "Wool Ankle Çorap",
    category: "corap",
    price: 190,
    badge: "%10 kampanya",
    shortDesc: "Yün karışım kısa çorap — kampanya tetikleyici.",
    detail:
      "Merino karışım, kısa kesim. Soğuk günlerde bot içi konfor. Sepette bu kategori varsa tüm tutara %10 indirim.",
    sizes: ["36-40", "41-45"],
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    stock: 50
  }
];

/** Yardımcı: id ile ürün bul */
function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

/** TL formatı */
function formatTRY(amount) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2
  }).format(amount);
}
