/**
 * Atelier Nord — UI & etkileşimler
 */

(function () {
  Cart.load();

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const menuToggle = $("#menuToggle");
  const sideMenu = $("#sideMenu");
  const menuBackdrop = $("#menuBackdrop");
  const menuClose = $("#menuClose");
  const cartToggle = $("#cartToggle");
  const cartDrawer = $("#cartDrawer");
  const cartBackdrop = $("#cartBackdrop");
  const cartClose = $("#cartClose");
  const cartItemsEl = $("#cartItems");
  const cartTotalsEl = $("#cartTotals");
  const cartCountEl = $("#cartCount");
  const productGrid = $("#productGrid");
  const categoryLabel = $("#categoryLabel");
  const productModal = $("#productModal");
  const productModalBody = $("#productModalBody");
  const checkoutForm = $("#checkoutForm");
  const checkoutSummary = $("#checkoutSummary");
  const payBtn = $("#payBtn");
  const goCheckout = $("#goCheckout");
  const searchBtn = $("#searchBtn");
  const searchModal = $("#searchModal");
  const searchClose = $("#searchClose");
  const searchInput = $("#searchInput");
  const searchResults = $("#searchResults");

  let activeCategory = "all";
  let selectedSize = "";

  /* ---- Toast ---- */
  function toast(msg) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("is-show"), 2800);
  }

  /* ---- Menü ---- */
  function openMenu(open) {
    sideMenu.classList.toggle("is-open", open);
    menuBackdrop.classList.toggle("is-open", open);
    sideMenu.setAttribute("aria-hidden", String(!open));
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open || cartDrawer.classList.contains("is-open") ? "hidden" : "";
  }

  function openCart(open) {
    cartDrawer.classList.toggle("is-open", open);
    cartBackdrop.classList.toggle("is-open", open);
    cartDrawer.setAttribute("aria-hidden", String(!open));
    if (open) renderCart();
    document.body.style.overflow = open || sideMenu.classList.contains("is-open") ? "hidden" : "";
  }

  menuToggle.addEventListener("click", () => openMenu(true));
  menuClose.addEventListener("click", () => openMenu(false));
  menuBackdrop.addEventListener("click", () => openMenu(false));
  cartToggle.addEventListener("click", () => openCart(true));
  cartClose.addEventListener("click", () => openCart(false));
  cartBackdrop.addEventListener("click", () => openCart(false));
  goCheckout.addEventListener("click", () => openCart(false));

  /* ---- Arama ---- */
  function openSearch(open) {
    if (open) {
      searchModal.showModal?.();
      searchModal.setAttribute("open", "");
      searchInput.value = "";
      renderSearchResults("");
      setTimeout(() => searchInput.focus(), 50);
    } else {
      searchModal.close?.();
      searchModal.removeAttribute("open");
    }
  }

  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    const list = q
      ? PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.shortDesc.toLowerCase().includes(q) ||
            (CATEGORY_LABELS[p.category] || "").toLowerCase().includes(q)
        )
      : PRODUCTS.slice(0, 6);

    if (!list.length) {
      searchResults.innerHTML = `<p class="search-empty">Sonuç bulunamadı.</p>`;
      return;
    }

    searchResults.innerHTML = list
      .map(
        (p) => `
      <button type="button" class="search-result" data-search-id="${p.id}">
        <img src="${p.image}" alt="" />
        <div>
          <p class="search-result__name">${p.name}</p>
          <p class="search-result__meta">${CATEGORY_LABELS[p.category]} · ${formatTRY(p.price)}</p>
        </div>
      </button>`
      )
      .join("");
  }

  searchBtn.addEventListener("click", () => openSearch(true));
  searchClose.addEventListener("click", () => openSearch(false));
  searchModal.addEventListener("click", (e) => {
    if (e.target === searchModal) openSearch(false);
  });
  searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));
  searchResults.addEventListener("click", (e) => {
    const id = e.target.closest("[data-search-id]")?.dataset.searchId;
    if (!id) return;
    openSearch(false);
    openProductModal(id);
  });

  /* ---- Header scroll ---- */
  const header = $(".site-header");
  window.addEventListener(
    "scroll",
    () => {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    },
    { passive: true }
  );

  /* ---- Ürün kartları ---- */
  function filteredProducts() {
    if (activeCategory === "all") return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === activeCategory);
  }

  function renderProducts() {
    const list = filteredProducts();
    categoryLabel.textContent = CATEGORY_LABELS[activeCategory] || "Koleksiyon";

    if (!list.length) {
      productGrid.innerHTML = `<p class="cart-empty">Bu kategoride ürün yok.</p>`;
      return;
    }

    productGrid.innerHTML = list
      .map(
        (p, idx) => `
      <article class="product-card" style="animation-delay:${idx * 0.05}s" data-id="${p.id}">
        <div class="product-card__media" data-open="${p.id}">
          ${p.badge ? `<span class="product-card__badge">${p.badge}</span>` : ""}
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="product-card__body">
          <p class="product-card__cat">${CATEGORY_LABELS[p.category] || p.category}</p>
          <h3 class="product-card__name">${p.name}</h3>
          <p class="product-card__desc">${p.shortDesc}</p>
          <p class="product-card__price">
            ${formatTRY(p.price)}
            ${p.oldPrice ? `<small><s>${formatTRY(p.oldPrice)}</s></small>` : ""}
          </p>
          <button type="button" class="btn btn--add" data-quick-add="${p.id}">Sepete Ekle</button>
        </div>
      </article>`
      )
      .join("");
  }

  productGrid.addEventListener("click", (e) => {
    const openId = e.target.closest("[data-open]")?.dataset.open;
    if (openId) {
      openProductModal(openId);
      return;
    }
    const addId = e.target.closest("[data-quick-add]")?.dataset.quickAdd;
    if (addId) {
      const product = getProductById(addId);
      if (!product) return;
      if (product.sizes && product.sizes.length) {
        openProductModal(addId);
        toast("Lütfen beden seçin.");
        return;
      }
      const res = Cart.add(addId, "", 1);
      updateCartUI();
      toast(res.message);
    }
  });

  /* ---- Kategori linkleri ---- */
  $$(".cat-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      $$(".cat-link").forEach((l) => l.classList.remove("is-active"));
      link.classList.add("is-active");
      activeCategory = link.dataset.category;
      renderProducts();
      openMenu(false);
      $("#urunler").scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---- Modal ---- */
  function openProductModal(id) {
    const p = getProductById(id);
    if (!p) return;
    selectedSize = p.sizes?.[0] || "";

    productModalBody.innerHTML = `
      <div class="product-modal__media">
        <img src="${p.image}" alt="${p.name}" />
      </div>
      <div class="product-modal__info">
        <p class="eyebrow">${CATEGORY_LABELS[p.category]}</p>
        <h2>${p.name}</h2>
        <p class="price">${formatTRY(p.price)}${
          p.oldPrice ? ` <small style="color:var(--muted);font-weight:300"><s>${formatTRY(p.oldPrice)}</s></small>` : ""
        }</p>
        <p class="detail">${p.detail}</p>
        <p class="detail" style="margin-top:0.75rem">Stok: <strong>${p.stock}</strong></p>
        ${
          p.sizes?.length
            ? `<p class="eyebrow" style="margin-top:1.25rem">Beden</p>
               <div class="size-row" id="sizeRow">
                 ${p.sizes
                   .map(
                     (s, i) =>
                       `<button type="button" data-size="${s}" class="${i === 0 ? "is-selected" : ""}">${s}</button>`
                   )
                   .join("")}
               </div>`
            : ""
        }
        <button type="button" class="btn btn--add" id="modalAdd" data-id="${p.id}">Sepete Ekle</button>
        ${
          p.category === DISCOUNT_RULES.triggerCategory
            ? `<p class="detail" style="margin-top:1rem;color:var(--blue-500)">${DISCOUNT_RULES.label}</p>`
            : ""
        }
      </div>`;

    if (typeof productModal.showModal === "function") {
      productModal.showModal();
    } else {
      productModal.setAttribute("open", "");
    }
  }

  productModalBody.addEventListener("click", (e) => {
    const sizeBtn = e.target.closest("[data-size]");
    if (sizeBtn) {
      $$("#sizeRow button").forEach((b) => b.classList.remove("is-selected"));
      sizeBtn.classList.add("is-selected");
      selectedSize = sizeBtn.dataset.size;
      return;
    }
    const addBtn = e.target.closest("#modalAdd");
    if (addBtn) {
      const p = getProductById(addBtn.dataset.id);
      if (p?.sizes?.length && !selectedSize) {
        toast("Beden seçin.");
        return;
      }
      const res = Cart.add(addBtn.dataset.id, selectedSize, 1);
      updateCartUI();
      toast(res.message);
      if (res.ok && Cart.hasDiscountTrigger()) {
        setTimeout(() => toast(DISCOUNT_RULES.label), 900);
      }
      productModal.close?.();
      productModal.removeAttribute("open");
    }
  });

  $("#modalClose").addEventListener("click", () => {
    productModal.close?.();
    productModal.removeAttribute("open");
  });

  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) {
      productModal.close?.();
      productModal.removeAttribute("open");
    }
  });

  /* ---- Sepet render ---- */
  function renderCart() {
    const summary = Cart.summary();

    if (!summary.items.length) {
      cartItemsEl.innerHTML = `<div class="cart-empty">Sepetiniz boş.<br/>Menüden kategori seçip ürün ekleyin.</div>`;
      cartTotalsEl.innerHTML = "";
      return;
    }

    cartItemsEl.innerHTML = summary.items
      .map(
        (i) => `
      <div class="cart-item" data-key="${i.key}">
        <img src="${i.image}" alt="${i.name}" />
        <div>
          <p class="cart-item__name">${i.name}</p>
          <p class="cart-item__meta">${i.size ? `Beden: ${i.size} · ` : ""}${formatTRY(i.priceAtAdd)}</p>
          <div class="cart-item__qty">
            <button type="button" data-dec="${i.key}" aria-label="Azalt">−</button>
            <span>${i.qty}</span>
            <button type="button" data-inc="${i.key}" aria-label="Artır">+</button>
          </div>
        </div>
        <button type="button" class="cart-item__remove" data-remove="${i.key}">Kaldır</button>
      </div>`
      )
      .join("");

    const discountRows = summary.discounts?.length
      ? summary.discounts
          .map(
            (d) =>
              `<div class="row discount"><span>${d.label}</span><span>−${formatTRY(d.amount)}</span></div>`
          )
          .join("")
      : `<div class="row"><span>İndirim</span><span style="color:var(--muted);font-size:0.85rem">Çorap ekleyince %${summary.discountPercent}</span></div>`;

    cartTotalsEl.innerHTML = `
      <div class="row"><span>Ara toplam</span><span>${formatTRY(summary.subtotal)}</span></div>
      ${discountRows}
      <div class="row total"><span>Toplam</span><span>${formatTRY(summary.total)}</span></div>`;
  }

  cartItemsEl.addEventListener("click", (e) => {
    const keyInc = e.target.closest("[data-inc]")?.dataset.inc;
    const keyDec = e.target.closest("[data-dec]")?.dataset.dec;
    const keyRem = e.target.closest("[data-remove]")?.dataset.remove;
    if (keyInc) {
      const item = Cart.items.find((i) => i.key === keyInc);
      if (item) Cart.setQty(keyInc, item.qty + 1);
    }
    if (keyDec) {
      const item = Cart.items.find((i) => i.key === keyDec);
      if (item) Cart.setQty(keyDec, item.qty - 1);
    }
    if (keyRem) Cart.remove(keyRem);
    updateCartUI();
  });

  function updateCartUI() {
    const n = Cart.count();
    cartCountEl.textContent = String(n);
    cartCountEl.dataset.empty = n === 0 ? "true" : "false";
    renderCart();
    renderCheckoutSummary();
  }

  /* ---- Checkout özeti ---- */
  function renderCheckoutSummary() {
    const summary = Cart.summary();
    if (!summary.items.length) {
      checkoutSummary.innerHTML = `<p>Sepetiniz boş. Ürün ekleyip buradan ödeme yapabilirsiniz.</p>`;
      payBtn.disabled = true;
      return;
    }

    const lines = summary.items
      .map(
        (i) =>
          `<div class="checkout-summary__row"><span>${i.name}${i.size ? ` · ${i.size}` : ""} × ${i.qty}</span><span>${formatTRY(i.priceAtAdd * i.qty)}</span></div>`
      )
      .join("");

    checkoutSummary.innerHTML = `
      ${lines}
      <div class="checkout-summary__row"><span>Ara toplam</span><span>${formatTRY(summary.subtotal)}</span></div>
      ${
        summary.discounts?.length
          ? summary.discounts
              .map(
                (d) =>
                  `<div class="checkout-summary__row is-discount"><span>${d.label}</span><span>−${formatTRY(d.amount)}</span></div>`
              )
              .join("")
          : ""
      }
      <div class="checkout-summary__row is-total"><span>Ödenecek</span><span>${formatTRY(summary.total)}</span></div>`;

    payBtn.disabled = false;
  }

  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const summary = Cart.summary();
    if (!summary.items.length) {
      toast(IYZICO_CONFIG.emptyCartMessage);
      return;
    }

    const fd = new FormData(checkoutForm);
    const buyer = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      city: String(fd.get("city") || "").trim(),
      address: String(fd.get("address") || "").trim()
    };

    payBtn.disabled = true;
    payBtn.textContent = "İşleniyor…";

    try {
      const result = await processPayment(buyer, summary);
      if (result.ok || result.status === "success") {
        toast(result.message || "Ödeme başlatıldı.");
        if (result.demo) {
          alert(
            `Demo sipariş alındı!\n\nÖdeme no: ${result.paymentId}\nTutar: ${formatTRY(summary.total)}\n\n${
              summary.discountActive ? summary.discountLabel + "\n" : ""
            }Teşekkürler, ${buyer.name}.`
          );
          Cart.clear();
          updateCartUI();
          checkoutForm.reset();
        } else if (result.checkoutFormContent) {
          /* iyzico Checkout Form HTML dönerse sayfaya göm */
          const box = document.createElement("div");
          box.innerHTML = result.checkoutFormContent;
          document.body.appendChild(box);
          box.querySelector("script") && document.body.appendChild(box.querySelector("script"));
        }
      } else {
        toast(result.message || "Ödeme başarısız.");
      }
    } catch (err) {
      console.error(err);
      toast(err.message || "Bağlantı hatası. Backend / iyzico ayarlarını kontrol edin.");
    } finally {
      payBtn.disabled = Cart.count() === 0;
      payBtn.textContent = "iyzico ile Güvenli Öde";
    }
  });

  /* ---- URL ?odeme=basarili ---- */
  if (new URLSearchParams(location.search).get("odeme") === "basarili") {
    toast("Ödemeniz alındı. Teşekkürler!");
    Cart.clear();
  }

  /* ---- Init ---- */
  window.addEventListener("cart:refresh", updateCartUI);
  renderProducts();
  updateCartUI();
})();
