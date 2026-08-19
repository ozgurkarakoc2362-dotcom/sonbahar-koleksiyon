# Atelier Nord — Sonbahar Koleksiyonu

HTML / CSS / JS ile hazırlanmış detaylı moda e-ticaret vitrini.
Kahverengi + mavi palet, sol menü, sepet, çorap kampanyası (%10), şans çarkı ve
Shopier ile site içinde tamamlanan üç adımlı ödeme.

## Çalıştırma (bilgisayarda)

`index.html` dosyasına çift tıklayın veya Chrome adres çubuğuna:

```
file:///C:/Users/USER/Projects/sonbahar-koleksiyon/index.html
```

## İnternette yayınlama (GitHub)

Adım adım rehber: **[GITHUB.md](./GITHUB.md)**

Kısa özet: GitHub’da repo aç → `git push` → Settings → Pages → `main` branch → siteniz  
**https://ozgurkarakoc2362-dotcom.github.io/sonbahar-koleksiyon/** adresinde yayında olur.

## Fiyat ve ürün düzenleme

Tüm ürünler, fiyatlar, açıklamalar ve fotoğraflar:

**`js/products.js`**

Örnek:

```js
{
  id: "forma-home",
  name: "Nord Home Forma",
  category: "forma",   // tisort | pantolon | forma | ayakkabi | aksesuar | corap
  price: 2490,         // TL — burayı değiştirin
  oldPrice: 2790,      // opsiyonel
  shortDesc: "...",
  detail: "Detaylı açıklama...",
  sizes: ["S", "M", "L"],
  image: "images/forma.jpg",  // kendi fotoğrafınız
  stock: 30
}
```

### İndirim oranı

Aynı dosyada `DISCOUNT_RULES`:

```js
triggerCategory: "corap",  // sepete bu kategoriden ürün girince
percent: 10                // %10 — istediğiniz orana çekin
```

## Kendi fotoğraflarınız

1. `images/` klasörüne koyun  
2. `image: "images/dosya-adi.jpg"` yazın  

## Shopier ödeme kurulumu

Ödeme, üç adımlı ekranın sonunda **siteden ayrılmadan** açılan pencerede Shopier
tarafından alınır. Shopier isteği API şifresiyle imzalamayı zorunlu tuttuğu için
imzalama, `api/` klasöründeki aracı servis tarafından yapılır — anahtarlar
tarayıcıya konulamaz.

`js/shopier-config.js` içindeki `endpoint` boşsa site **demo modda** çalışır:
gerçek para çekilmez, pencerede sipariş özeti gösterilir.

### 1. Aracı servisi yayına alın (ücretsiz)

1. [vercel.com](https://vercel.com) → GitHub ile giriş → **Add New → Project**
2. `sonbahar-koleksiyon` deposunu seçin → **Deploy**
3. **Settings → Environment Variables** bölümüne ekleyin:

| Değişken | Değer |
|----------|-------|
| `SHOPIER_API_KEY` | Shopier panelindeki API kullanıcı adı |
| `SHOPIER_API_SECRET` | Shopier panelindeki API şifresi |
| `SITE_URL` | `https://ozgurkarakoc2362-dotcom.github.io/sonbahar-koleksiyon` |

4. **Deployments → Redeploy** (değişkenler ancak yeni yayında geçerli olur)

### 2. Siteyi servise bağlayın

`js/shopier-config.js`:

```js
endpoint: "https://PROJE-ADI.vercel.app/api/shopier"
```

### 3. Shopier panelinde geri dönüş adresi

```
https://PROJE-ADI.vercel.app/api/shopier-callback
```

### Güvenlik notları

- Kart bilgisi hiçbir zaman bu siteye girilmez; Shopier’in 3D Secure ekranında işlenir.
- Ödenecek tutar `api/_catalog.js` içindeki fiyatlardan **sunucuda yeniden hesaplanır**,
  tarayıcıdan gelen tutara güvenilmez. Ürün fiyatı değiştirdiğinizde bu dosyayı da güncelleyin.
- Çark ödülü yalnızca gerçek çark değerlerinden biriyse (%5/%10/%15, 50/100/150 TL) kabul edilir.
- Ödeme sonucu, Shopier imzası doğrulanmadan başarılı sayılmaz.

Yerel deneme: `node api/_local-test.js` → `http://localhost:8787/api/shopier`

## Dosya yapısı

```
index.html
css/styles.css
js/products.js        ← fiyatlar & ürünler
js/cart.js            ← sepet + indirim hesabı
js/shopier-config.js  ← ödeme ayarı (endpoint)
js/app.js             ← arayüz + ödeme adımları
api/shopier.js        ← imzalı Shopier isteği (Vercel)
api/shopier-callback.js ← ödeme sonucu doğrulama
api/_catalog.js       ← sunucu tarafı fiyat listesi
images/               ← (opsiyonel) kendi görselleriniz
```
