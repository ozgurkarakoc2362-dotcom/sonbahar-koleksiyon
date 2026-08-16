# GitHub’a Yükleme ve İnternette Yayınlama

Bu rehber siteyi GitHub’a koyup **ücretsiz** olarak internette açmanız içindir (GitHub Pages).

---

## 1. GitHub hesabı

Hesabınız yoksa: https://github.com/signup

---

## 2. Yeni repo oluştur

1. https://github.com/new adresine gidin
2. **Repository name:** `sonbahar-koleksiyon` (veya istediğiniz isim)
3. **Public** seçin (Pages ücretsiz olsun diye)
4. **Add a README file** işaretlemeyin (zaten var)
5. **Create repository** tıklayın

---

## 3. Bilgisayardan GitHub’a gönder

**PowerShell** veya **Git Bash** açın, sırayla:

```powershell
cd C:\Users\USER\Projects\sonbahar-koleksiyon

git init
git add .
git commit -m "Sonbahar koleksiyonu e-ticaret sitesi"
git branch -M main
git remote add origin https://github.com/ozgurkarakoc2362-dotcom/sonbahar-koleksiyon.git
git push -u origin main
```

`KULLANICI_ADINIZ` yerine kendi GitHub kullanıcı adınızı yazın (sizin için: **ozgurkarakoc2362-dotcom**).

İlk push’ta GitHub girişi isteyebilir (tarayıcı veya token).

---

## 4. GitHub Pages’i aç (site internette yayınlansın)

1. Repo sayfasında **Settings** (Ayarlar)
2. Sol menüden **Pages**
3. **Build and deployment** → Source: **Deploy from a branch**
4. Branch: **main** · Folder: **/ (root)**
5. **Save**

1–2 dakika sonra siteniz şu adreste açılır:

```
https://ozgurkarakoc2362-dotcom.github.io/sonbahar-koleksiyon/
```

Bu linki Chrome’da açabilir, arkadaşlarınıza gönderebilirsiniz.

---

## 5. Sonraki güncellemeler

Fiyat veya ürün değiştirdikten sonra:

```powershell
cd C:\Users\USER\Projects\sonbahar-koleksiyon
git add .
git commit -m "Fiyatlar güncellendi"
git push
```

Pages birkaç dakika içinde yeni sürümü gösterir.

---

## Google’da arama

GitHub Pages açıldıktan sonra site birkaç gün–hafta içinde Google’da indekslenebilir. Hızlandırmak için:

- https://search.google.com/search-console → site ekleyin
- Sitemap gerekmez (tek sayfa site)

---

## Önemli notlar

| Konu | Açıklama |
|------|----------|
| iyzico canlı ödeme | Sadece HTML yeterli değil; backend + HTTPS gerekir |
| Fotoğraflar | `images/` klasörüne koyup `js/products.js` içinde yolu güncelleyin |
| Repo adı farklıysa | Pages URL’si repo adına göre değişir |

---

## Sorun giderme

**`git` komutu tanınmıyor**  
→ Git kur: https://git-scm.com/download/win

**Push reddedildi**  
→ GitHub’da repo oluşturuldu mu, remote URL doğru mu kontrol edin.

**Sayfa 404**  
→ Settings → Pages’te branch `main` ve folder `/` seçili mi; 2–5 dk bekleyin.
