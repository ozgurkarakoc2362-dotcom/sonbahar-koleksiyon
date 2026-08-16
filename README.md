# Atelier Nord — Sonbahar Koleksiyonu

HTML / CSS / JS ile hazırlanmış detaylı moda e-ticaret vitrini.
Kahverengi + mavi palet, sol menü, sepet, çorap kampanyası (%10) ve iyzico’ya hazır ödeme formu.

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

## iyzico

`js/iyzico-config.js`:

- Varsayılan `mode: "demo"` — kart istemez, sipariş özeti gösterir  
- Canlı için backend gerekir (secret key tarayıcıda olmamalı)  
- `mode: "live"` + `createPaymentUrl` → kendi API’niz  

Dokümantasyon: https://docs.iyzico.com/

## Dosya yapısı

```
index.html
css/styles.css
js/products.js      ← fiyatlar & ürünler
js/cart.js          ← sepet + indirim hesabı
js/iyzico-config.js ← ödeme ayarı
js/app.js           ← arayüz
images/             ← (opsiyonel) kendi görselleriniz
```
