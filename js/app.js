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
  const checkoutView = $("#checkoutView");
  const checkoutSection = $("#odeme");
  const checkoutSteps = $("#checkoutSteps");
  const checkoutItems = $("#checkoutItems");
  const orderSummary = $("#orderSummary");
  const deliveryForm = $("#deliveryForm");
  const deliveryReview = $("#deliveryReview");
  const payBtn = $("#payBtn");
  const payNote = $("#payNote");
  const payModal = $("#payModal");
  const payFrame = $("#payFrame");
  const payLoading = $("#payLoading");
  const goCheckout = $("#goCheckout");
  const searchBtn = $("#searchBtn");
  const searchModal = $("#searchModal");
  const searchClose = $("#searchClose");
  const searchInput = $("#searchInput");
  const searchResults = $("#searchResults");
  const prizeBanner = $("#prizeBanner");

  let activeCategory = "all";
  let selectedSize = "";

  function activePrize() {
    return (Cart.getWheelPrize && Cart.getWheelPrize()) || window.__wheelPrize || null;
  }

  function productPriceHtml(p) {
    const prize = activePrize();
    if (prize && prize.type === "percent") {
      const now = p.price * (1 - prize.value / 100);
      return `${formatTRY(now)} <small><s>${formatTRY(p.price)}</s></small>`;
    }
    if (p.oldPrice) {
      return `${formatTRY(p.price)} <small><s>${formatTRY(p.oldPrice)}</s></small>`;
    }
    return formatTRY(p.price);
  }

  function updatePrizeBanner() {
    if (!prizeBanner) return;
    const prize = activePrize();
    if (!prize) {
      prizeBanner.hidden = true;
      prizeBanner.textContent = "";
      document.body.classList.remove("has-prize-banner");
      return;
    }
    prizeBanner.hidden = false;
    document.body.classList.add("has-prize-banner");
    prizeBanner.textContent =
      prize.type === "percent"
        ? `Çark indirimin aktif: ürünlerde %${prize.value}. Sepete ekle, ödeme tutarından düşülür.`
        : `Çark indirimin aktif: sepet toplamından ${prize.value} TL düşülür.`;
  }

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
  // Ödeme, aynı sekmede tam sayfa görünümde açılır (adreste #odeme birikmesin)
  goCheckout.addEventListener("click", (e) => {
    e.preventDefault();
    if (Cart.count() === 0) {
      toast("Önce sepete ürün ekleyin.");
      return;
    }
    openCheckout(true);
  });

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
          <p class="search-result__meta">${CATEGORY_LABELS[p.category]} · ${productPriceHtml(p).replace(/<[^>]+>/g, " ")}</p>
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
          ${p.badge || (activePrize() && activePrize().type === "percent") ? `<span class="product-card__badge">${activePrize() && activePrize().type === "percent" ? `%${activePrize().value} cark` : p.badge}</span>` : ""}
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
        </div>
        <div class="product-card__body">
          <p class="product-card__cat">${CATEGORY_LABELS[p.category] || p.category}</p>
          <h3 class="product-card__name">${p.name}</h3>
          <p class="product-card__desc">${p.shortDesc}</p>
          <p class="product-card__price">
            ${productPriceHtml(p)}
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
        <p class="price">${productPriceHtml(p)}</p>
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
    updatePrizeBanner();
    renderProducts();
  }

  /* ---- Ödeme ekranı (aynı sekmede tam sayfa) ---- */
  let step = 1;
  let buyerInfo = null;
  let scrollBeforeCheckout = 0;

  function openCheckout(open) {
    if (open) {
      scrollBeforeCheckout = window.scrollY;
      openCart(false);
      openMenu(false);
      checkoutView.classList.add("is-open");
      checkoutView.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      checkoutView.scrollTop = 0;
      return;
    }
    checkoutView.classList.remove("is-open");
    checkoutView.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    window.scrollTo(0, scrollBeforeCheckout);
  }

  function checkoutOpen() {
    return checkoutView.classList.contains("is-open");
  }

  $("#checkoutClose").addEventListener("click", () => openCheckout(false));
  $("#keepShopping").addEventListener("click", () => openCheckout(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && checkoutOpen() && !payModal.classList.contains("is-open")) {
      openCheckout(false);
    }
  });

  function goStep(next, scroll = true) {
    step = next;
    $$(".pane", checkoutSection).forEach((p) =>
      p.classList.toggle("is-active", p.dataset.pane === String(next))
    );
    $$(".step", checkoutSteps).forEach((s) => {
      const n = Number(s.dataset.step);
      s.classList.toggle("is-active", n === next);
      s.classList.toggle("is-done", n < next);
    });
    if (next === 3) renderReview();
    if (scroll) checkoutView.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderCheckoutSummary() {
    const summary = Cart.summary();

    if (!summary.items.length) {
      checkoutItems.innerHTML = `<p class="pane__empty">Sepetin boş. Koleksiyondan bir parça seçtiğinde burada görünecek.</p>`;
      orderSummary.innerHTML = `
        <h3 class="order-summary__title">Sipariş özeti</h3>
        <p class="order-summary__empty">Henüz ürün yok.</p>`;
      $("#toDelivery").disabled = true;
      payBtn.disabled = true;
      if (step !== 1) goStep(1, false);
      return;
    }

    checkoutItems.innerHTML = summary.items
      .map(
        (i) => `
        <div class="line" data-key="${i.key}">
          <img src="${i.image}" alt="${i.name}" />
          <div class="line__body">
            <p class="line__name">${i.name}</p>
            <p class="line__meta">${i.size ? `Beden ${i.size} · ` : ""}${formatTRY(i.priceAtAdd)}</p>
            <div class="line__qty">
              <button type="button" data-dec="${i.key}" aria-label="Azalt">−</button>
              <span>${i.qty}</span>
              <button type="button" data-inc="${i.key}" aria-label="Artır">+</button>
            </div>
          </div>
          <div class="line__right">
            <span class="line__price">${formatTRY(i.priceAtAdd * i.qty)}</span>
            <button type="button" class="line__remove" data-remove="${i.key}">Kaldır</button>
          </div>
        </div>`
      )
      .join("");

    const shipping = Number(SHOPIER_CONFIG.shipping) || 0;
    orderSummary.innerHTML = `
      <h3 class="order-summary__title">Sipariş özeti</h3>
      <div class="order-summary__rows">
        <div class="row"><span>Ara toplam (${summary.items.reduce((s, i) => s + i.qty, 0)} ürün)</span><span>${formatTRY(summary.subtotal)}</span></div>
        ${
          summary.discounts?.length
            ? summary.discounts
                .map(
                  (d) =>
                    `<div class="row discount"><span>${d.label}</span><span>−${formatTRY(d.amount)}</span></div>`
                )
                .join("")
            : `<div class="row muted"><span>İndirim</span><span>Sepete çorap ekle, %${summary.discountPercent}</span></div>`
        }
        <div class="row"><span>Kargo</span><span>${shipping > 0 ? formatTRY(shipping) : "Ücretsiz"}</span></div>
        <div class="row total"><span>Ödenecek</span><span>${formatTRY(summary.total + shipping)}</span></div>
      </div>
      <p class="order-summary__note">Tutar Shopier’in güvenli ekranında tahsil edilir.</p>`;

    $("#toDelivery").disabled = false;
    payBtn.disabled = false;
  }

  function renderReview() {
    if (!buyerInfo) return;
    deliveryReview.innerHTML = `
      <div class="review__row">
        <span class="review__label">Teslim edilecek kişi</span>
        <span class="review__value">${buyerInfo.fullName}</span>
      </div>
      <div class="review__row">
        <span class="review__label">İletişim</span>
        <span class="review__value">${buyerInfo.phone} · ${buyerInfo.email}</span>
      </div>
      <div class="review__row">
        <span class="review__label">Adres</span>
        <span class="review__value">${buyerInfo.address} / ${buyerInfo.city}</span>
      </div>`;
  }

  $("#toDelivery").addEventListener("click", () => goStep(2));

  $$("[data-back]", checkoutSection).forEach((btn) => {
    btn.addEventListener("click", () => goStep(Number(btn.dataset.back)));
  });

  checkoutSteps.addEventListener("click", (e) => {
    const li = e.target.closest(".step");
    if (!li) return;
    const target = Number(li.dataset.step);
    if (target < step) goStep(target);
  });

  checkoutItems.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]")?.dataset.inc;
    const dec = e.target.closest("[data-dec]")?.dataset.dec;
    const rem = e.target.closest("[data-remove]")?.dataset.remove;
    if (inc) {
      const item = Cart.items.find((i) => i.key === inc);
      if (item) Cart.setQty(inc, item.qty + 1);
    }
    if (dec) {
      const item = Cart.items.find((i) => i.key === dec);
      if (item) Cart.setQty(dec, item.qty - 1);
    }
    if (rem) Cart.remove(rem);
    if (inc || dec || rem) updateCartUI();
  });

  /* ---- Teslimat formu doğrulama ---- */
  const VALIDATORS = {
    fullName: (v) =>
      /^\S{2,}(\s+\S{2,})+$/.test(v) ? "" : "Ad ve soyadınızı birlikte yazın.",
    phone: (v) => (v.replace(/\D/g, "").length >= 10 ? "" : "10 haneli telefon numarası yazın."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Geçerli bir e-posta yazın."),
    city: (v) => (v.length >= 2 ? "" : "İl yazın."),
    address: (v) => (v.length >= 10 ? "" : "Adresi daha ayrıntılı yazın.")
  };

  function validateField(input) {
    const check = VALIDATORS[input.name];
    if (!check) return true;
    const message = check(input.value.trim());
    const field = input.closest(".field");
    field.classList.toggle("has-error", Boolean(message));
    const errorEl = field.querySelector(".field__error");
    if (errorEl) errorEl.textContent = message;
    return !message;
  }

  deliveryForm.addEventListener("input", (e) => {
    if (e.target.closest(".field")?.classList.contains("has-error")) validateField(e.target);
  });
  deliveryForm.addEventListener("blur", (e) => {
    if (e.target.name in VALIDATORS) validateField(e.target);
  }, true);

  deliveryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = $$("input, textarea", deliveryForm).filter((i) => i.name in VALIDATORS);
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) {
      $(".field.has-error input, .field.has-error textarea", deliveryForm)?.focus();
      toast("Eksik veya hatalı alanları düzeltin.");
      return;
    }
    const fd = new FormData(deliveryForm);
    buyerInfo = {};
    fd.forEach((value, key) => {
      buyerInfo[key] = String(value).trim().replace(/\s+/g, " ");
    });
    goStep(3);
  });

  /* ---- Shopier ödemesi (site içinde açılır) ---- */
  function openPayModal(open) {
    payModal.classList.toggle("is-open", open);
    payModal.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) {
      payFrame.removeAttribute("src");
      payFrame.removeAttribute("srcdoc");
      payLoading.hidden = false;
    }
  }

  payFrame.addEventListener("load", () => {
    if (payFrame.getAttribute("src") || payModal.classList.contains("is-open")) {
      payLoading.hidden = true;
    }
  });

  $("#payModalClose").addEventListener("click", () => openPayModal(false));
  payModal.addEventListener("click", (e) => {
    if (e.target === payModal) openPayModal(false);
  });

  function startPayment() {
    const summary = Cart.summary();
    if (!summary.items.length) {
      toast("Önce sepete ürün ekleyin.");
      return;
    }
    if (!buyerInfo) {
      goStep(2);
      return;
    }

    const order = buildShopierOrder(buyerInfo, summary);

    if (!shopierReady()) {
      openPayModal(true);
      payLoading.hidden = true;
      payFrame.removeAttribute("src");
      payFrame.srcdoc = `<!doctype html><html lang="tr"><head><meta charset="utf-8" />
        <style>
          body{margin:0;font-family:system-ui,sans-serif;display:grid;place-items:center;height:100%;background:#faf6f1;color:#2c1f18;text-align:center;padding:28px}
          h2{font-size:20px;margin:0 0 10px}
          p{margin:0 0 8px;font-size:14px;line-height:1.6;color:#6b574a;max-width:34em}
          code{background:#efe7de;padding:2px 5px;font-size:13px}
          strong{font-size:19px}
        </style></head><body><div>
        <h2>Demo mod — gerçek ödeme alınmıyor</h2>
        <p>Sipariş numarası <code>${order.orderId}</code> · Tutar <strong>${formatTRY(summary.total)}</strong></p>
        <p>Shopier hesabınızı bağlamak için <code>js/shopier-config.js</code> içindeki
        <code>endpoint</code> alanına aracı servisinizin adresini yazın.</p>
        </div></body></html>`;
      return;
    }

    /* Form POST ile açıyoruz: aracı servis, imzalı Shopier formunu
       iframe içinde otomatik gönderiyor (fetch ile bu mümkün değil). */
    openPayModal(true);
    payFrame.removeAttribute("srcdoc");
    const form = document.createElement("form");
    form.method = "POST";
    form.action = shopierEndpoint();
    form.target = "payFrame";
    form.style.display = "none";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "order";
    input.value = JSON.stringify(order);
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  payBtn.addEventListener("click", startPayment);

  /* Ödeme sonucu, aracı servisten pencere içinden bildirilir */
  window.addEventListener("message", (e) => {
    const data = e.data;
    if (!data || data.source !== "shopier") return;
    if (data.status === "success") {
      openPayModal(false);
      Cart.clear();
      buyerInfo = null;
      deliveryForm.reset();
      updateCartUI();
      goStep(1, false);
      openCheckout(false);
      toast("Ödemen alındı, siparişin hazırlanıyor. Teşekkürler!");
    } else {
      openPayModal(false);
      toast("Ödeme tamamlanmadı. Dilersen tekrar deneyebilirsin.");
    }
  });

  if (payNote) {
    payNote.textContent = shopierReady()
      ? "Ödeme ekranı Shopier tarafından sağlanır ve bu sayfadan ayrılmadan açılır."
      : "Bu adres demo modda: gerçek ödeme alınmıyor. Canlı ödeme, Vercel’deki site adresi üzerinden yapılır.";
  }

  /* ---- Ödeme dönüşü (yeni sekmede tamamlanırsa) ---- */
  if (new URLSearchParams(location.search).get("odeme") === "basarili") {
    toast("Ödemen alındı. Teşekkürler!");
    Cart.clear();
  }

  /* ---- Init ---- */
  window.addEventListener("cart:refresh", updateCartUI);
  renderProducts();
  updateCartUI();
})();
