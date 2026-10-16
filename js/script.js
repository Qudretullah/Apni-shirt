
/* =========================================
   APNI SHIRT - COMPLETE JAVASCRIPT
   HTML + CSS + JavaScript Only
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  // Product data
  const products = $$(".product-card").map((card) => {
    const priceText = $(".product-price", card)?.textContent || "";
    const titleLink = $(".product-info h3 a", card);
    const image = $(".product-image img", card);

    return {
      id: Number(card.dataset.productId),
      name: titleLink?.textContent.trim() || "Shirt",
      category:
        $(".product-category", card)?.textContent.trim().toLowerCase() || "",
      price: Number(priceText.replace(/[^\d]/g, "")) || 0,
      image: image?.src || "",
      alt: image?.alt || "",
      url: `product.html?id=${card.dataset.productId}`
    };
  });

  // Storage helpers
  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      showToast("Browser storage is unavailable.");
      return false;
    }
  }

  let cart = readStorage("apniShirtCart", []);
  if (!Array.isArray(cart)) cart = [];

  let activeSlide = 0;
  let slideTimer = null;
  let toastTimer = null;

  // Add a page top anchor
  if (!$("#top")) {
    const topAnchor = document.createElement("span");
    topAnchor.id = "top";
    document.body.prepend(topAnchor);
  }

  // Add optional animation styles through JavaScript
  const extraStyles = document.createElement("style");

  extraStyles.textContent = `
    html { scroll-behavior: smooth; }

    .product-card,
    .category-card,
    .feature-item,
    .btn,
    .nav-link,
    .product-image img {
      transition:
        transform .35s ease,
        box-shadow .35s ease,
        opacity .35s ease;
    }

    .product-card:hover {
      transform: translateY(-7px);
      box-shadow: 0 15px 35px rgba(20, 32, 52, .12);
    }

    .product-image img {
      transition: transform .6s cubic-bezier(.2,.7,.3,1);
    }

    .product-card:hover .product-image img,
    .category-card:hover img {
      transform: scale(1.06);
    }

    .category-card { overflow: hidden; }

    [data-animate] {
      opacity: 0;
      transition:
        opacity .7s ease,
        transform .7s cubic-bezier(.2,.7,.3,1);
    }

    [data-animate="fade-up"] { transform: translateY(28px); }
    [data-animate="slide-right"] { transform: translateX(-35px); }
    [data-animate="slide-left"] { transform: translateX(35px); }

    [data-animate].is-visible {
      opacity: 1;
      transform: translate(0, 0);
    }

    .hero-slide[hidden] { display: none !important; }

    .hero-slide {
      animation: shirtSlideIn .65s ease both;
    }

    @keyframes shirtSlideIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .slider-dot.active {
      transform: scale(1.25);
    }

    .toast {
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 99999;
      max-width: min(360px, calc(100vw - 32px));
      padding: 14px 20px;
      color: #fff;
      background: #17263c;
      border-radius: 10px;
      box-shadow: 0 10px 35px rgba(0,0,0,.2);
      opacity: 0;
      transform: translateY(12px);
      transition: .25s ease;
    }

    .toast.toast-show {
      opacity: 1;
      transform: translateY(0);
    }

    .shop-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99990;
      display: grid;
      place-items: center;
      padding: 16px;
      background: rgba(10, 18, 30, .65);
      backdrop-filter: blur(5px);
    }

    .shop-modal {
      position: relative;
      width: min(460px, 100%);
      max-height: 90vh;
      overflow-y: auto;
      padding: 26px;
      background: #fff;
      color: #17263c;
      border-radius: 18px;
      box-shadow: 0 25px 80px rgba(0,0,0,.25);
      animation: modalPop .25s ease both;
    }

    @keyframes modalPop {
      from { opacity: 0; transform: translateY(15px) scale(.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .shop-modal h2 { margin: 0 35px 12px 0; }
    .shop-modal p { line-height: 1.6; }
    .shop-modal label {
      display: block;
      margin: 14px 0 6px;
      font-weight: 600;
    }

    .shop-modal select,
    .shop-modal input {
      width: 100%;
      min-height: 44px;
      padding: 10px;
      border: 1px solid #d8dce3;
      border-radius: 8px;
      background: white;
      color: #17263c;
      font: inherit;
    }

    .shop-modal .modal-close {
      position: absolute;
      top: 12px;
      right: 14px;
      border: 0;
      background: transparent;
      font-size: 27px;
      cursor: pointer;
    }

    .shop-modal .modal-action {
      width: 100%;
      min-height: 46px;
      margin-top: 18px;
      padding: 12px;
      border: 0;
      border-radius: 8px;
      background: #17263c;
      color: white;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    .shop-modal .modal-action:hover { background: #b18a43; }

    .modal-cart-item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .modal-cart-item button {
      margin: 3px;
      padding: 5px 10px;
      cursor: pointer;
    }

    .cart-total {
      margin-top: 18px;
      font-size: 19px;
      font-weight: 700;
    }

    .product-card.is-filtered-out { display: none !important; }

    .no-products {
      padding: 30px 10px;
      text-align: center;
      grid-column: 1 / -1;
    }

    .search-field input:focus,
    .shop-modal select:focus {
      outline: 2px solid #b18a43;
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        scroll-behavior: auto !important;
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
      }
      [data-animate] { opacity: 1; transform: none; }
    }
  `;

  document.head.appendChild(extraStyles);

  // Toast notification
  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;

    requestAnimationFrame(() => {
      toast.classList.add("toast-show");
    });

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("toast-show");

      setTimeout(() => {
        toast.hidden = true;
      }, 300);
    }, 2600);
  }

  // Cart counter
  function updateCartCount() {
    const count = cart.reduce(
      (total, item) => total + Math.max(0, Number(item.quantity) || 0),
      0
    );

    const counter = $("#cartCount");
    if (counter) counter.textContent = count;

    $$(".cart-link").forEach((link) => {
      link.setAttribute("aria-label", `Cart, ${count} items`);
    });
  }

  function persistCart() {
    if (saveStorage("apniShirtCart", cart)) {
      updateCartCount();
      return true;
    }
    return false;
  }

  function addToCart(product, size, color, quantity) {
    const existing = cart.find(
      (item) =>
        item.id === product.id &&
        item.size === size &&
        item.color === color
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        color,
        quantity
      });
    }

    if (persistCart()) {
      showToast(`${product.name} added to your cart!`);
    }
  }

  updateCartCount();

  // Mobile menu
  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  if (menuToggle && mainNav) {
    menuToggle.hidden = false;

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      mainNav.classList.toggle("is-open", !isOpen);
      menuToggle.textContent = isOpen ? "☰" : "✕";
    });

    $$(".nav-link", mainNav).forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        mainNav.classList.remove("is-open");
        menuToggle.textContent = "☰";
      });
    });
  }

  // Hero slider
  const slides = $$(".hero-slide");
  const sliderControls = $("#sliderControls");
  const dots = $$(".slider-dot");

  function showSlide(index) {
    if (!slides.length) return;

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      const isActive = i === activeSlide;

      slide.hidden = !isActive;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, i) => {
      const isActive = i === activeSlide;

      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
  }

  function startSlider() {
    clearInterval(slideTimer);

    if (slides.length > 1) {
      slideTimer = setInterval(() => {
        if (!document.hidden) showSlide(activeSlide + 1);
      }, 5000);
    }
  }

  if (slides.length) {
    showSlide(0);

    if (sliderControls) sliderControls.hidden = false;

    $("#nextSlide")?.addEventListener("click", () => {
      showSlide(activeSlide + 1);
      startSlider();
    });

    $("#prevSlide")?.addEventListener("click", () => {
      showSlide(activeSlide - 1);
      startSlider();
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        showSlide(Number(dot.dataset.slideTo) || 0);
        startSlider();
      });
    });

    $("#heroSlider")?.addEventListener("mouseenter", () => {
      clearInterval(slideTimer);
    });

    $("#heroSlider")?.addEventListener("mouseleave", startSlider);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearInterval(slideTimer);
      else startSlider();
    });

    startSlider();
  }

  // Scroll reveal animations
  const animatedElements = $$("[data-animate]");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    animatedElements.forEach((element, index) => {
      element.style.transitionDelay = `${(index % 4) * 80}ms`;
      revealObserver.observe(element);
    });
  } else {
    animatedElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  // Search and category filtering on homepage
  const productGrid = $("#featuredProductGrid");
  let emptyMessage = null;

  function filterProducts(query = "", category = "") {
    const searchTerm = query.trim().toLowerCase();
    let visibleCount = 0;

    products.forEach((product) => {
      const card = $(
        `.product-card[data-product-id="${product.id}"]`
      );

      if (!card) return;

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.includes(searchTerm);

      const matchesCategory =
        !category || product.category === category.toLowerCase();

      const isVisible = matchesSearch && matchesCategory;

      card.classList.toggle("is-filtered-out", !isVisible);

      if (isVisible) visibleCount++;
    });

    if (productGrid) {
      if (!emptyMessage) {
        emptyMessage = document.createElement("p");
        emptyMessage.className = "no-products";
        emptyMessage.textContent = "No matching shirts found.";
        emptyMessage.hidden = true;
        productGrid.appendChild(emptyMessage);
      }

      emptyMessage.hidden = visibleCount !== 0;
    }

    return visibleCount;
  }

  const searchForm = $("#searchForm");
  const searchInput = $("#searchInput");

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const query = searchInput.value.trim();

      filterProducts(query);
      $("#featuredProducts")?.scrollIntoView({ behavior: "smooth" });

      showToast(
        query
          ? `${filterProducts(query)} matching product(s) found.`
          : "Showing all featured shirts."
      );
    });
  }

  // Demo modal helper
  function openModal(content, onReady) {
    const backdrop = document.createElement("div");
    backdrop.className = "shop-modal-backdrop";
    backdrop.setAttribute("role", "presentation");

    const modal = document.createElement("section");
    modal.className = "shop-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
      <button type="button" class="modal-close" aria-label="Close dialog">×</button>
      ${content}
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    document.body.style.overflow = "hidden";

    const closeButton = $(".modal-close", modal);

    function closeModal() {
      backdrop.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeydown);
    }

    function handleKeydown(event) {
      if (event.key === "Escape") closeModal();
    }

    closeButton.addEventListener("click", closeModal);

    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeModal();
    });

    document.addEventListener("keydown", handleKeydown);

    onReady?.(modal, closeModal);

    closeButton.focus();

    return { modal, closeModal };
  }

  // Product options modal
  function openProductOptions(product) {
    const safeName = product.name.replace(/[<>]/g, "");

    openModal(
      `
        <h2>${safeName}</h2>
        <p>Price: <strong>Rs. ${product.price.toLocaleString("en-PK")}</strong></p>

        <form id="productOptionsForm">
          <label for="shirtSize">Select size</label>
          <select id="shirtSize" name="size" required>
            <option value="">Choose your size</option>
            <option value="S">Small (S)</option>
            <option value="M">Medium (M)</option>
            <option value="L">Large (L)</option>
            <option value="XL">Extra Large (XL)</option>
            <option value="XXL">XXL</option>
          </select>

          <label for="shirtColor">Select colour</label>
          <select id="shirtColor" name="color" required>
            <option value="">Choose your colour</option>
            <option value="Navy">Navy</option>
            <option value="Black">Black</option>
            <option value="White">White</option>
            <option value="Blue">Blue</option>
            <option value="Olive">Olive</option>
            <option value="Beige">Beige</option>
          </select>

          <label for="shirtQuantity">Quantity</label>
          <input
            type="number"
            id="shirtQuantity"
            name="quantity"
            min="1"
            max="10"
            value="1"
            required
          >

          <button type="submit" class="modal-action">
            Add to Cart
          </button>
        </form>
      `,
      (modal, closeModal) => {
        $("#productOptionsForm", modal).addEventListener("submit", (event) => {
          event.preventDefault();

          const size = $("#shirtSize", modal).value;
          const color = $("#shirtColor", modal).value;
          const quantity = Number($("#shirtQuantity", modal).value);

          if (!size || !color || !Number.isInteger(quantity) ||
              quantity < 1 || quantity > 10) {
            showToast("Please select valid size, colour and quantity.");
            return;
          }

          addToCart(product, size, color, quantity);
          closeModal();
        });
      }
    );
  }

  // Product buttons open the options modal
  $$(".product-card .btn-product").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const card = button.closest(".product-card");
      const id = Number(card?.dataset.productId);
      const product = products.find((item) => item.id === id);

      if (product) openProductOptions(product);
    });
  });

  // Product image and title also open options
  $$(".product-card .product-image, .product-card .product-info h3 a")
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();

        const card = link.closest(".product-card");
        const product = products.find(
          (item) => item.id === Number(card?.dataset.productId)
        );

        if (product) openProductOptions(product);
      });
    });

  // Cart modal
  function openCart() {
    let itemsHTML = "";

    if (cart.length === 0) {
      itemsHTML = "<p>Your cart is empty. Explore our shirts to get started.</p>";
    } else {
      itemsHTML = cart.map((item, index) => `
        <div class="modal-cart-item">
          <div>
            <strong>${item.name.replace(/[<>]/g, "")}</strong>
            <p>
              Size: ${item.size} · Colour: ${item.color}<br>
              Rs. ${(item.price * item.quantity).toLocaleString("en-PK")}
            </p>
            <button type="button" data-cart-minus="${index}" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-plus="${index}" aria-label="Increase quantity">+</button>
            <button type="button" data-cart-remove="${index}">Remove</button>
          </div>
        </div>
      `).join("");
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    openModal(
      `
        <h2>Your Shopping Cart</h2>
        <div class="cart-items">${itemsHTML}</div>
        <p class="cart-total">
          Total: Rs. ${total.toLocaleString("en-PK")}
        </p>
        <p><small>Demo only — no payment is processed.</small></p>
        <button type="button" class="modal-action" id="continueShopping">
          Continue Shopping
        </button>
      `,
      (modal, closeModal) => {
        $("#continueShopping", modal).addEventListener("click", closeModal);

        $$("[data-cart-minus]", modal).forEach((button) => {
          button.addEventListener("click", () => {
            const index = Number(button.dataset.cartMinus);
            if (!cart[index]) return;

            cart[index].quantity--;

            if (cart[index].quantity <= 0) {
              cart.splice(index, 1);
            }

            if (persistCart()) {
              closeModal();
              openCart();
            }
          });
        });

        $$("[data-cart-plus]", modal).forEach((button) => {
          button.addEventListener("click", () => {
            const index = Number(button.dataset.cartPlus);
            if (!cart[index]) return;

            if (cart[index].quantity >= 10) {
              showToast("Maximum quantity per option is 10.");
              return;
            }

            cart[index].quantity++;

            if (persistCart()) {
              closeModal();
              openCart();
            }
          });
        });

        $$("[data-cart-remove]", modal).forEach((button) => {
          button.addEventListener("click", () => {
            cart.splice(Number(button.dataset.cartRemove), 1);

            if (persistCart()) {
              closeModal();
              openCart();
              showToast("Item removed from cart.");
            }
          });
        });
      }
    );
  }

  // Cart links work without a separate cart.html
  $$(".cart-link, a[href='cart.html']").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openCart();
    });
  });

  // Shop/category links filter the homepage demo products
  $$("a[href='shop.html'], a[href^='shop.html?']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href, window.location.href);
      const category = url.searchParams.get("category") || "";
      const query = url.searchParams.get("q") || "";

      event.preventDefault();

      filterProducts(query, category);

      if (searchInput) searchInput.value = query;

      $("#featuredProducts")?.scrollIntoView({ behavior: "smooth" });

      const label = category
        ? `${category[0].toUpperCase()}${category.slice(1)} shirts`
        : "All featured shirts";

      showToast(`${label} shown on this demo homepage.`);
    });
  });

  
/* ==========================================
   APNI SHIRT - PREMIUM FAQ UPGRADE
   JavaScript Only: No HTML/CSS Editing
========================================== */

(() => {
  "use strict";

  function initPremiumFAQ() {
    const section = document.querySelector(".faq-section");
    if (!section) return;

    // Prevent duplicate initialization
    if (section.dataset.premiumFaq === "true") return;
    section.dataset.premiumFaq = "true";

    const container = section.querySelector(".container");
    const oldHeading = section.querySelector(".section-heading");
    const oldList = section.querySelector(".faq-list");

    if (!container || !oldList) return;

    // FAQ content
    const questions = [
      {
        icon: "↗",
        question: "How do I choose the right shirt size?",
        answer:
          "Choose your favourite shirt and click Choose Options. Select your size, colour and quantity before adding the product to your cart.",
        tag: "SIZING"
      },
      {
        icon: "＋",
        question: "Can I change my cart quantity?",
        answer:
          "Absolutely! Open your cart and use the plus and minus buttons to update quantities. You can also remove items whenever you like.",
        tag: "SHOPPING"
      },
      {
        icon: "◇",
        question: "Does Apni Shirt accept real payments?",
        answer:
          "Apni Shirt is currently a frontend demo. No real orders or payments are processed. Please do not enter real payment details.",
        tag: "PAYMENTS"
      },
      {
        icon: "⌕",
        question: "How can I find my favourite shirt?",
        answer:
          "Use the search field to look for a shirt by name or category. You can also explore the casual, formal and linen collections.",
        tag: "PRODUCTS"
      },
      {
        icon: "♡",
        question: "Will my cart stay saved after refreshing?",
        answer:
          "The demo cart uses your browser's local storage. Your selections can remain after a refresh in the same browser unless the stored data is cleared.",
        tag: "YOUR CART"
      },
      {
        icon: "✦",
        question: "What makes Apni Shirt different?",
        answer:
          "This project brings casual, formal and linen shirt collections together in one simple shopping experience, with interactive product options and a demo cart.",
        tag: "ABOUT US"
      }
    ];

    // Create design entirely from JavaScript
    const style = document.createElement("style");

    style.textContent = `
      .faq-section {
        position: relative;
        isolation: isolate;
        overflow: hidden;
        padding: 95px 0;
        background:
          radial-gradient(ellipse at 0% 10%, rgba(193,153,79,.13), transparent 42%),
          radial-gradient(ellipse at 100% 90%, rgba(23,38,60,.07), transparent 45%),
          #f7f6f2;
      }

      .faq-section::before {
        content: "";
        position: absolute;
        top: -130px;
        right: -100px;
        width: 300px;
        height: 300px;
        border: 1px solid rgba(185,147,74,.19);
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
      }

      .faq-section .container {
        position: relative;
        z-index: 1;
      }

      .faq-section .section-heading {
        display: block;
        text-align: center;
        margin: 0 auto 42px;
        max-width: 680px;
      }

      .faq-premium-kicker {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        color: #a57d36;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 3px;
        margin-bottom: 15px;
      }

      .faq-premium-kicker::before,
      .faq-premium-kicker::after {
        content: "";
        width: 24px;
        height: 1px;
        background: #b9934a;
      }

      .faq-premium-title {
        margin: 0 0 14px;
        color: #17263c;
        font-size: clamp(30px, 5vw, 48px);
        line-height: 1.15;
        letter-spacing: -1.5px;
      }

      .faq-premium-title span {
        color: #b18a43;
      }

      .faq-premium-subtitle {
        color: #727784;
        font-size: 15px;
        line-height: 1.8;
        margin: 0;
      }

      .faq-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        max-width: 820px;
        margin: 0 auto 20px;
      }

      .faq-counter {
        color: #777d88;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .faq-counter strong {
        color: #b18a43;
      }

      .faq-actions {
        display: flex;
        gap: 8px;
      }

      .faq-action-btn {
        border: 1px solid #e4dfd5;
        border-radius: 30px;
        background: rgba(255,255,255,.85);
        color: #17263c;
        padding: 9px 15px;
        font: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: background .25s, color .25s, transform .25s;
      }

      .faq-action-btn:hover {
        background: #17263c;
        color: white;
        transform: translateY(-2px);
      }

      .faq-premium-list {
        display: grid;
        gap: 13px;
        width: min(820px, 100%);
        margin: 0 auto;
      }

      .faq-premium-item {
        --faq-delay: 0ms;
        position: relative;
        overflow: hidden;
        background: rgba(255,255,255,.92);
        border: 1px solid #e8e4dc;
        border-radius: 15px;
        box-shadow: 0 4px 16px rgba(23,38,60,.035);
        opacity: 0;
        transform: translateY(22px);
        transition:
          opacity .55s ease,
          transform .55s cubic-bezier(.2,.75,.25,1),
          border-color .3s ease,
          box-shadow .3s ease;
        transition-delay: var(--faq-delay);
      }

      .faq-premium-item.faq-entered {
        opacity: 1;
        transform: translateY(0);
      }

      .faq-premium-item:hover {
        border-color: #c6a665;
        box-shadow: 0 12px 28px rgba(23,38,60,.075);
        transform: translateY(-2px);
      }

      .faq-premium-item.faq-open {
        border-color: #b9934a;
        box-shadow: 0 13px 32px rgba(23,38,60,.075);
      }

      .faq-premium-question {
        width: 100%;
        min-height: 82px;
        display: grid;
        grid-template-columns: 43px minmax(0,1fr) 35px;
        align-items: center;
        gap: 16px;
        padding: 17px 22px;
        border: 0;
        text-align: left;
        background: transparent;
        color: #17263c;
        font: inherit;
        cursor: pointer;
      }

      .faq-premium-question:focus-visible,
      .faq-action-btn:focus-visible,
      .faq-search:focus-visible {
        outline: 3px solid #b9934a;
        outline-offset: 3px;
      }

      .faq-number-icon {
        display: grid;
        place-items: center;
        width: 43px;
        height: 43px;
        border-radius: 13px;
        background: #f5f0e6;
        color: #a47a34;
        font-size: 20px;
        transition: background .3s, color .3s, transform .35s;
      }

      .faq-open .faq-number-icon {
        color: white;
        background: #17263c;
        transform: rotate(-8deg);
      }

      .faq-question-text {
        display: grid;
        gap: 5px;
        min-width: 0;
      }

      .faq-question-text strong {
        font-size: 15px;
        font-weight: 750;
        line-height: 1.55;
      }

      .faq-question-text small {
        color: #a17d40;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1.8px;
      }

      .faq-chevron {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: #f3f3f2;
        color: #17263c;
        font-size: 20px;
        transition: transform .35s ease, background .3s, color .3s;
      }

      .faq-open .faq-chevron {
        transform: rotate(45deg);
        background: #b9934a;
        color: white;
      }

      .faq-panel {
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition:
          grid-template-rows .42s cubic-bezier(.2,.7,.2,1),
          opacity .3s ease;
      }

      .faq-open .faq-panel {
        grid-template-rows: 1fr;
        opacity: 1;
      }

      .faq-panel-clip {
        overflow: hidden;
        min-height: 0;
      }

      .faq-answer-content {
        padding: 0 74px 24px 81px;
        color: #6b707a;
        font-size: 14px;
        line-height: 1.9;
      }

      .faq-answer-content p {
        margin: 0;
      }

      .faq-answer-content::before {
        content: "";
        display: block;
        width: 38px;
        height: 2px;
        margin-bottom: 13px;
        background: #b9934a;
      }

      .faq-search-wrap {
        position: relative;
        width: min(820px, 100%);
        margin: 0 auto 18px;
      }

      .faq-search {
        box-sizing: border-box;
        width: 100%;
        min-height: 51px;
        padding: 0 18px 0 48px;
        border: 1px solid #e5e0d6;
        border-radius: 12px;
        background: rgba(255,255,255,.9);
        color: #17263c;
        font: inherit;
        font-size: 14px;
        transition: border-color .3s, box-shadow .3s;
      }

      .faq-search:focus {
        border-color: #b9934a;
        box-shadow: 0 0 0 4px rgba(185,147,74,.12);
        outline: none;
      }

      .faq-search-icon {
        position: absolute;
        top: 50%;
        left: 17px;
        transform: translateY(-50%);
        font-size: 20px;
        color: #a17d40;
        pointer-events: none;
      }

      .faq-empty {
        text-align: center;
        padding: 25px;
        color: #6b707a;
        background: white;
        border-radius: 12px;
      }

      .faq-bottom-note {
        text-align: center;
        margin: 30px auto 0;
        color: #777d88;
        font-size: 13px;
      }

      .faq-bottom-note button {
        display: inline-block;
        margin-left: 5px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #a17d40;
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      .faq-premium-item[hidden],
      .faq-empty[hidden] {
        display: none !important;
      }

      @media (max-width: 600px) {
        .faq-section { padding: 64px 0; }
        .faq-section .section-heading { margin-bottom: 28px; }
        .faq-premium-title { letter-spacing: -.8px; }
        .faq-toolbar { align-items: flex-start; }
        .faq-premium-list { gap: 10px; }

        .faq-premium-question {
          grid-template-columns: 36px minmax(0,1fr) 29px;
          gap: 11px;
          min-height: 73px;
          padding: 13px;
        }

        .faq-number-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
        }

        .faq-question-text strong { font-size: 13px; }
        .faq-question-text small { font-size: 8px; }
        .faq-chevron { width: 29px; height: 29px; }

        .faq-answer-content {
          padding: 0 18px 21px 60px;
          font-size: 13px;
        }

        .faq-action-btn { padding: 8px 11px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .faq-premium-item,
        .faq-number-icon,
        .faq-chevron,
        .faq-panel,
        .faq-action-btn {
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);

    // Replace old FAQ markup using JavaScript
    if (oldHeading) {
      oldHeading.innerHTML = `
        <div class="faq-premium-kicker">APNI SHIRT SUPPORT</div>
        <h2 class="faq-premium-title">Questions? <span>Answered.</span></h2>
        <p class="faq-premium-subtitle">
          Quick answers to make your shopping experience easier.
        </p>
      `;
    }

    const toolbar = document.createElement("div");
    toolbar.className = "faq-toolbar";
    toolbar.innerHTML = `
      <div class="faq-counter">
        <strong id="faqVisibleCount">${questions.length}</strong>
        <span> ANSWERS TO EXPLORE</span>
      </div>
      <div class="faq-actions">
        <button class="faq-action-btn" type="button" data-faq-action="open">
          Expand all
        </button>
        <button class="faq-action-btn" type="button" data-faq-action="close">
          Collapse all
        </button>
      </div>
    `;

    const searchWrap = document.createElement("div");
    searchWrap.className = "faq-search-wrap";
    searchWrap.innerHTML = `
      <span class="faq-search-icon" aria-hidden="true">⌕</span>
      <input
        class="faq-search"
        type="search"
        placeholder="Search a question..."
        aria-label="Search frequently asked questions"
        maxlength="100"
      >
    `;

    const newList = document.createElement("div");
    newList.className = "faq-premium-list";

    questions.forEach((item, index) => {
      const article = document.createElement("article");
      article.className = "faq-premium-item";
      article.style.setProperty("--faq-delay", `${index * 65}ms`);

      const button = document.createElement("button");
      button.className = "faq-premium-question";
      button.type = "button";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", `faq-panel-${index}`);

      const icon = document.createElement("span");
      icon.className = "faq-number-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = item.icon;

      const questionText = document.createElement("span");
      questionText.className = "faq-question-text";

      const strong = document.createElement("strong");
      strong.textContent = item.question;

      const small = document.createElement("small");
      small.textContent = item.tag;

      questionText.append(strong, small);

      const chevron = document.createElement("span");
      chevron.className = "faq-chevron";
      chevron.textContent = "+";
      chevron.setAttribute("aria-hidden", "true");

      button.append(icon, questionText, chevron);

      const panel = document.createElement("div");
      panel.className = "faq-panel";
      panel.id = `faq-panel-${index}`;
      panel.setAttribute("aria-hidden", "true");

      const clip = document.createElement("div");
      clip.className = "faq-panel-clip";

      const answer = document.createElement("div");
      answer.className = "faq-answer-content";

      const paragraph = document.createElement("p");
      paragraph.textContent = item.answer;

      answer.appendChild(paragraph);
      clip.appendChild(answer);
      panel.appendChild(clip);

      article.append(button, panel);
      article.dataset.searchText =
        `${item.question} ${item.answer} ${item.tag}`.toLowerCase();

      button.addEventListener("click", () => {
        const shouldOpen = !article.classList.contains("faq-open");

        // Accordion: only one open at a time
        newList.querySelectorAll(".faq-premium-item").forEach((other) => {
          setOpen(other, false);
        });

        if (shouldOpen) setOpen(article, true);
      });

      newList.appendChild(article);
    });

    const emptyMessage = document.createElement("div");
    emptyMessage.className = "faq-empty";
    emptyMessage.hidden = true;
    emptyMessage.textContent =
      "No matching questions. Try a different search.";

    const bottomNote = document.createElement("div");
    bottomNote.className = "faq-bottom-note";

    const noteText = document.createElement("span");
    noteText.textContent = "Still exploring?";

    const resetButton = document.createElement("button");
    resetButton.type = "button";
    resetButton.textContent = "Show all questions";

    bottomNote.append(noteText, resetButton);

    oldList.replaceWith(toolbar, searchWrap, newList, emptyMessage, bottomNote);

    const countLabel = toolbar.querySelector("#faqVisibleCount");
    const searchInput = searchWrap.querySelector(".faq-search");

    function setOpen(article, open) {
      article.classList.toggle("faq-open", open);

      const button = article.querySelector(".faq-premium-question");
      const panel = article.querySelector(".faq-panel");

      button.setAttribute("aria-expanded", String(open));
      panel.setAttribute("aria-hidden", String(!open));
    }

    function visibleItems() {
      return [...newList.querySelectorAll(".faq-premium-item")]
        .filter((item) => !item.hidden);
    }

    function updateSearch() {
      const query = searchInput.value.trim().toLowerCase();
      let count = 0;

      newList.querySelectorAll(".faq-premium-item").forEach((item) => {
        const match = item.dataset.searchText.includes(query);

        item.hidden = !match;

        if (match) {
          count++;
          item.classList.remove("faq-entered");
          requestAnimationFrame(() => item.classList.add("faq-entered"));
        } else {
          setOpen(item, false);
        }
      });

      countLabel.textContent = count;
      emptyMessage.hidden = count !== 0;
      toolbar.querySelector(".faq-counter span").textContent =
        count === 1 ? " ANSWER FOUND" : " ANSWERS TO EXPLORE";
    }

    searchInput.addEventListener("input", updateSearch);

    toolbar.querySelector('[data-faq-action="open"]').addEventListener(
      "click",
      () => {
        visibleItems().forEach((item) => setOpen(item, true));
      }
    );

    toolbar.querySelector('[data-faq-action="close"]').addEventListener(
      "click",
      () => {
        visibleItems().forEach((item) => setOpen(item, false));
      }
    );

    resetButton.addEventListener("click", () => {
      searchInput.value = "";
      updateSearch();
      searchInput.focus();
    });

    // Animate FAQ cards as they enter the viewport
    const faqItems = [...newList.querySelectorAll(".faq-premium-item")];

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("faq-entered");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });

      faqItems.forEach((item) => observer.observe(item));
    } else {
      faqItems.forEach((item) => item.classList.add("faq-entered"));
    }

    // If section is already visible, show cards immediately
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();

      if (rect.top < window.innerHeight && rect.bottom > 0) {
        faqItems.forEach((item, index) => {
          setTimeout(() => item.classList.add("faq-entered"), index * 65);
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPremiumFAQ, {
      once: true
    });
  } else {
    initPremiumFAQ();
  }
})();


  // Back-to-top button
  $("#backToTop")?.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Header shadow on scroll
  const header = $(".site-header");

  function updateHeader() {
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // Image fallback if a remote image fails to load
  $$("img").forEach((img) => {
    img.addEventListener("error", () => {
      img.classList.add("image-load-error");
      img.alt = img.alt || "Image could not be loaded";
    }, { once: true });
  });

  // Welcome message
  showToast("Welcome to Apni Shirt — explore your style!");
});



/* ==========================================
   APNI SHIRT - PREMIUM SHOP PAGE
   JavaScript Only: CSS aur UI khud add hogi
========================================== */

(() => {
  "use strict";

  function initApniShop() {
    const grid = document.querySelector("#productGrid");
    const toolbar = document.querySelector(".shop-toolbar");

    if (!grid || !toolbar || grid.dataset.apniReady) return;
    grid.dataset.apniReady = "true";

    const cards = [...grid.querySelectorAll(".product-card")];
    if (!cards.length) return;

    const categoryButtons = [
      ...document.querySelectorAll("#categoryFilters [data-category]")
    ];

    const searchInput = document.querySelector("#searchInput");
    const sortSelect = document.querySelector("#sortSelect");
    const count = document.querySelector("#productCount");
    const noResults = document.querySelector("#noResults");
    const resetButton = document.querySelector("#resetFilters");

    const originalOrder = new Map(
      cards.map((card, index) => [card, index])
    );

    let activeCategory = "all";

    const getName = card =>
      card.dataset.name ||
      card.querySelector("h3")?.textContent.trim() ||
      "Shirt";

    const getCategory = card =>
      (card.dataset.category || "").toLowerCase();

    const getPrice = card =>
      Number(card.dataset.price || 0);

    const money = price =>
      "Rs. " + price.toLocaleString("en-PK");

    /* Add premium design using JavaScript */

    const style = document.createElement("style");

    style.textContent = `
      :root {
        --apni-navy: #17263c;
        --apni-gold: #b9934a;
        --apni-light: #f7f5f0;
      }

      html {
        scroll-behavior: smooth;
      }

      .shop-intro {
        position: relative;
        overflow: hidden;
        padding: 75px 0;
        background:
          radial-gradient(circle at 85% 15%,
            #eadfc9 0, transparent 35%),
          linear-gradient(135deg, #f7f5f0, #fff);
      }

      .shop-intro .container {
        animation: apniIntro .8s ease both;
      }

      .shop-intro h1 {
        color: var(--apni-navy);
        font-size: clamp(36px, 5vw, 64px);
        line-height: 1.1;
        letter-spacing: -1.5px;
      }

      .shop-section {
        padding-top: 55px;
        padding-bottom: 80px;
      }

      .shop-section h2 {
        color: var(--apni-navy);
      }

      .shop-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        padding: 17px;
        margin-bottom: 25px;
        background: #fff;
        border: 1px solid #ece7dd;
        border-radius: 15px;
        box-shadow: 0 8px 25px #17263c0a;
      }

      .category-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .category-filters .filter-btn {
        padding: 10px 16px;
        border: 1px solid #e6dfd2;
        border-radius: 30px;
        background: #fff;
        color: var(--apni-navy);
        cursor: pointer;
        transition: .25s ease;
      }

      .category-filters .filter-btn:hover {
        border-color: var(--apni-gold);
        transform: translateY(-2px);
      }

      .category-filters .filter-btn.active {
        background: var(--apni-navy);
        border-color: var(--apni-navy);
        color: #fff;
      }

      #searchInput,
      #sortSelect {
        padding: 12px 14px;
        border: 1px solid #e5dfd4;
        border-radius: 10px;
        background: #fff;
        color: var(--apni-navy);
        font: inherit;
        outline: none;
      }

      #searchInput:focus,
      #sortSelect:focus {
        border-color: var(--apni-gold);
        box-shadow: 0 0 0 3px #b9934a20;
      }

      #productCount {
        display: inline-block;
        padding: 10px 15px;
        border-radius: 30px;
        background: #f5efe3;
        color: var(--apni-navy);
        font-weight: 700;
      }

      #productGrid .product-card {
        position: relative;
        overflow: hidden;
        border: 1px solid #eee9df;
        border-radius: 15px;
        background: #fff;
        box-shadow: 0 5px 20px #17263c08;
        transition:
          transform .35s ease,
          box-shadow .35s ease,
          border-color .35s ease;
        animation: apniCardIn .6s ease both;
      }

      #productGrid .product-card:hover {
        transform: translateY(-7px);
        border-color: #d8c49b;
        box-shadow: 0 18px 35px #17263c18;
      }

      #productGrid .product-image {
        position: relative;
        display: block;
        overflow: hidden;
      }

      #productGrid .product-image img {
        display: block;
        width: 100%;
        transition: transform .6s ease;
      }

      #productGrid .product-card:hover .product-image img {
        transform: scale(1.06);
      }

      #productGrid .product-info {
        padding: 16px;
      }

      #productGrid .product-category {
        color: #a17d40;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      #productGrid .product-info h3 a {
        color: var(--apni-navy);
        text-decoration: none;
      }

      #productGrid .product-info h3 a:hover {
        color: var(--apni-gold);
      }

      #productGrid .product-price {
        color: var(--apni-navy);
        font-weight: 800;
      }

      #productGrid .btn-product {
        transition: .25s ease;
      }

      #productGrid .btn-product:hover {
        transform: translateY(-2px);
      }

      .apni-progress {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 99999;
        width: 0;
        height: 3px;
        background: linear-gradient(
          90deg, #b9934a, #f0d99c
        );
        pointer-events: none;
      }

      .apni-top {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 9998;
        width: 45px;
        height: 45px;
        border: 0;
        border-radius: 50%;
        background: var(--apni-navy);
        color: white;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: .25s ease;
        box-shadow: 0 6px 20px #17263c30;
      }

      .apni-top.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .apni-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 2;
        padding: 7px 11px;
        border-radius: 20px;
        background: var(--apni-navy);
        color: white;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .5px;
      }

      .apni-toast {
        position: fixed;
        bottom: 25px;
        left: 50%;
        z-index: 99999;
        max-width: calc(100% - 35px);
        padding: 13px 20px;
        border-radius: 10px;
        background: var(--apni-navy);
        color: white;
        text-align: center;
        box-shadow: 0 8px 25px #0002;
        transform: translate(-50%, 20px);
        opacity: 0;
        transition: .3s ease;
        pointer-events: none;
      }

      .apni-toast.show {
        transform: translate(-50%, 0);
        opacity: 1;
      }

      @keyframes apniIntro {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes apniCardIn {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 600px) {
        .shop-intro {
          padding: 50px 0;
        }

        .shop-toolbar {
          align-items: stretch;
        }

        .category-filters {
          width: 100%;
        }

        .category-filters .filter-btn {
          padding: 9px 12px;
        }

        #searchInput {
          width: 100%;
          box-sizing: border-box;
        }

        #sortSelect {
          max-width: 100%;
        }

        .apni-top {
          right: 15px;
          bottom: 15px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: .01ms !important;
          transition-duration: .01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;

    document.head.appendChild(style);

    /* Scroll progress indicator */

    const progress = document.createElement("div");
    progress.className = "apni-progress";
    document.body.appendChild(progress);

    const topButton = document.createElement("button");
    topButton.className = "apni-top";
    topButton.type = "button";
    topButton.textContent = "↑";
    topButton.setAttribute("aria-label", "Back to top");
    document.body.appendChild(topButton);

    topButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    function updateScroll() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      const percent = scrollable > 0
        ? (window.scrollY / scrollable) * 100
        : 0;

      progress.style.width = percent + "%";
      topButton.classList.toggle("show", window.scrollY > 400);
    }

    window.addEventListener("scroll", updateScroll, {
      passive: true
    });

    updateScroll();

    /* Product badges and image loading */

    cards.forEach((card, index) => {
      card.style.animationDelay = Math.min(index * 70, 500) + "ms";

      const image = card.querySelector(".product-image");
      const img = card.querySelector("img");

      if (image && !image.querySelector(".apni-badge")) {
        const badge = document.createElement("span");
        badge.className = "apni-badge";
        badge.textContent = index < 2 ? "POPULAR" : "COLLECTION";
        image.appendChild(badge);
      }

      if (img) {
        img.loading = "lazy";
        img.decoding = "async";
      }
    });

    /* Search and sorting */

    function applyFilters() {
      const query = (searchInput?.value || "").trim().toLowerCase();

      const filtered = cards.filter(card => {
        const categoryMatch =
          activeCategory === "all" ||
          getCategory(card) === activeCategory;

        const searchMatch =
          (getName(card) + " " + getCategory(card))
            .toLowerCase()
            .includes(query);

        return categoryMatch && searchMatch;
      });

      const sort = sortSelect?.value || "featured";

      filtered.sort((a, b) => {
        if (sort === "price-asc") {
          return getPrice(a) - getPrice(b);
        }

        if (sort === "price-desc") {
          return getPrice(b) - getPrice(a);
        }

        if (sort === "name-asc") {
          return getName(a).localeCompare(getName(b));
        }

        return originalOrder.get(a) - originalOrder.get(b);
      });

      filtered.forEach((card, index) => {
        card.hidden = false;
        card.style.animationDelay = Math.min(index * 50, 400) + "ms";
        grid.appendChild(card);
      });

      cards.filter(card => !filtered.includes(card)).forEach(card => {
        card.hidden = true;
      });

      if (count) {
        count.textContent =
          `${filtered.length} ${filtered.length === 1 ? "shirt" : "shirts"} found`;
      }

      if (noResults) {
        noResults.hidden = filtered.length > 0;
      }

      if (!noResults) {
        let empty = document.querySelector(".apni-empty");

        if (!empty) {
          empty = document.createElement("div");
          empty.className = "apni-empty";
          empty.style.cssText =
            "padding:35px;text-align:center;color:#17263c;";
          empty.innerHTML =
            "<h3>No shirts found</h3><p>Try another search or category.</p>";

          grid.insertAdjacentElement("afterend", empty);
        }

        empty.hidden = filtered.length > 0;
      }
    }

    searchInput?.addEventListener("input", applyFilters);
    sortSelect?.addEventListener("change", applyFilters);

    categoryButtons.forEach(button => {
      button.addEventListener("click", () => {
        activeCategory =
          (button.dataset.category || "all").toLowerCase();

        categoryButtons.forEach(item => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });

        applyFilters();
      });
    });

    function resetFilters() {
      activeCategory = "all";

      if (searchInput) searchInput.value = "";
      if (sortSelect) sortSelect.value = "featured";

      categoryButtons.forEach(button => {
        const active = button.dataset.category === "all";
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      applyFilters();
    }

    resetButton?.addEventListener("click", resetFilters);

    /* Small notification helper */

    let toastTimer;

    function showToast(message) {
      let toast = document.querySelector(".apni-toast");

      if (!toast) {
        toast = document.createElement("div");
        toast.className = "apni-toast";
        toast.setAttribute("role", "status");
        document.body.appendChild(toast);
      }

      toast.textContent = message;
      toast.classList.add("show");

      clearTimeout(toastTimer);

      toastTimer = setTimeout(() => {
        toast.classList.remove("show");
      }, 2500);
    }

    /* Wishlist saved in browser */

    let wishlist = new Set();

    try {
      wishlist = new Set(
        JSON.parse(localStorage.getItem("apniShirtWishlist") || "[]")
      );
    } catch (error) {
      wishlist = new Set();
    }

    cards.forEach(card => {
      const image = card.querySelector(".product-image");
      if (!image) return;

      const id = card.dataset.productId || getName(card);

      const heart = document.createElement("button");
      heart.type = "button";
      heart.textContent = wishlist.has(id) ? "♥" : "♡";
      heart.setAttribute("aria-label", "Add to wishlist");

      heart.style.cssText = `
        position:absolute;
        top:12px;
        right:12px;
        z-index:5;
        width:40px;
        height:40px;
        border:0;
        border-radius:50%;
        background:#ffffffed;
        color:#b34b56;
        font-size:23px;
        cursor:pointer;
        box-shadow:0 3px 12px #0001;
        transition:transform .2s ease;
      `;

      heart.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        if (wishlist.has(id)) {
          wishlist.delete(id);
          heart.textContent = "♡";
          showToast("Removed from your wishlist");
        } else {
          wishlist.add(id);
          heart.textContent = "♥";
          showToast("Added to your wishlist");
        }

        try {
          localStorage.setItem(
            "apniShirtWishlist",
            JSON.stringify([...wishlist])
          );
        } catch (error) {
          showToast("Wishlist could not be saved in this browser");
        }
      });

      image.appendChild(heart);
    });

    /* Initial setup */

    applyFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApniShop, {
      once: true
    });
  } else {
    initApniShop();
  }
})();


/* ==========================================
   APNI SHIRT - CART PAGE ENHANCEMENTS
   Uses existing localStorage key: apniShirtCart
========================================== */

(() => {
  "use strict";

  function initApniCartPage() {
    if (document.body.dataset.page !== "cart") return;
    if (document.body.dataset.apniCartReady === "true") return;
    document.body.dataset.apniCartReady = "true";

    const $ = selector => document.querySelector(selector);

    const cartItems = $("#cartItems");
    const cartContent = $("#cartContent");
    const emptyCart = $("#emptyCart");
    const subtotalEl = $("#cartSubtotal");
    const totalEl = $("#cartTotal");
    const countEl = $("#cartCount");
    const itemCountEl = $("#cartItemCount");
    const demoNote = $("#cartDemoNote");
    const clearButton = $("#clearCartBtn");

    const CART_KEY = "apniShirtCart";

    if (!cartItems) return;

    const formatMoney = amount =>
      "Rs. " + Number(amount || 0).toLocaleString("en-PK");

    function readCart() {
      try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
      } catch (error) {
        return [];
      }
    }

    function saveCart(cart) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      // Update cart counts used across the website.
      document.querySelectorAll("#cartCount").forEach(el => {
        el.textContent = cart.reduce(
          (sum, item) => sum + Math.max(0, Number(item.quantity) || 0),
          0
        );
      });

      // Notify other scripts/tabs if they listen for storage changes.
      window.dispatchEvent(new CustomEvent("apniCartUpdated", {
        detail: { cart }
      }));
    }

    function escapeHTML(value) {
      return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]);
    }

    function cartItemKey(item) {
      return [
        item.id ?? item.productId ?? item.name ?? "shirt",
        item.size ?? "M",
        item.color ?? item.colour ?? "default"
      ].join("-");
    }

    function renderCart() {
      const cart = readCart();

      // Remove the two sample/demo products from cart.html.
      cartItems.innerHTML = "";

      const validCart = cart.filter(item =>
        item && Number(item.quantity) > 0
      );

      const itemTotal = validCart.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );

      const quantityTotal = validCart.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );

      saveCart(validCart);

      if (demoNote) demoNote.hidden = true;

      const isEmpty = validCart.length === 0;
      if (emptyCart) emptyCart.hidden = !isEmpty;
      if (cartContent) cartContent.hidden = isEmpty;

      if (subtotalEl) subtotalEl.textContent = formatMoney(itemTotal);
      if (totalEl) totalEl.textContent = formatMoney(itemTotal);

      if (itemCountEl) {
        itemCountEl.textContent =
          `${quantityTotal} ${quantityTotal === 1 ? "item" : "items"}`;
      }

      if (countEl) countEl.textContent = quantityTotal;

      validCart.forEach((item, index) => {
        const key = cartItemKey(item);
        const name = item.name || "Shirt";
        const size = item.size || "M";
        const color = item.color || item.colour || "Default";
        const price = Number(item.price) || 0;
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const image = item.image || "images/shirts/shirt-01.jpg";
        const category = item.category || "Collection";
        const productId = item.id ?? item.productId ?? "";

        const article = document.createElement("article");
        article.className = "cart-item apni-cart-item";
        article.dataset.cartKey = key;
        article.style.animation = "apniCartEnter .4s ease both";
        article.style.animationDelay = `${Math.min(index * 70, 350)}ms`;

        article.innerHTML = `
          <a class="cart-item-image" href="shop.html"
             aria-label="${escapeHTML(name)}">
            <img src="${escapeHTML(image)}"
                 alt="${escapeHTML(name)}"
                 loading="lazy">
          </a>

          <div class="cart-item-info">
            <p class="product-category">${escapeHTML(category)}</p>
            <h3>${escapeHTML(name)}</h3>

            <p class="cart-item-options">
              Size: <strong>${escapeHTML(size)}</strong>
              <span aria-hidden="true">|</span>
              Colour: <strong>${escapeHTML(color)}</strong>
            </p>

            <p class="cart-unit-price">${formatMoney(price)} each</p>

            <div class="cart-quantity"
                 role="group"
                 aria-label="Quantity for ${escapeHTML(name)}">
              <button type="button" class="quantity-btn"
                      data-action="decrease"
                      aria-label="Decrease quantity">−</button>
              <span class="quantity-value">${quantity}</span>
              <button type="button" class="quantity-btn"
                      data-action="increase"
                      aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div class="cart-item-actions">
            <p class="cart-item-total">
              ${formatMoney(price * quantity)}
            </p>
            <button type="button" class="remove-item"
                    data-action="remove">Remove</button>
          </div>
        `;

        article.dataset.itemKey = key;
        article.dataset.productId = productId;
        cartItems.appendChild(article);
      });

      const checkoutButton = $("#checkoutBtn");
      if (checkoutButton) {
        checkoutButton.textContent = "Place Order →";
        checkoutButton.setAttribute("href", "#place-order");
        checkoutButton.setAttribute("role", "button");
        checkoutButton.setAttribute(
          "aria-label",
          "Place demo order"
        );
        checkoutButton.style.cursor = "pointer";
        checkoutButton.style.opacity = isEmpty ? ".5" : "1";
        checkoutButton.style.pointerEvents = isEmpty ? "none" : "auto";
      }

      const summaryTitle = $("#summaryHeading");
      if (summaryTitle) summaryTitle.textContent = "Order Summary";

      const summaryTotalLabel = document.querySelector(".summary-total span");
      if (summaryTotalLabel) summaryTotalLabel.textContent = "Total";

      const deliveryLabel = document.querySelector(
        ".summary-row:nth-child(2) span:last-child"
      );
      if (deliveryLabel) deliveryLabel.textContent = "Calculated at checkout";

      const summaryNote = document.querySelector(".summary-note");
      if (summaryNote) {
        summaryNote.textContent =
          "Total includes shirt prices only. Delivery charges and real payments are not configured in this demo.";
      }

      const checkoutNote = document.querySelector(".checkout-demo-note");
      if (checkoutNote) {
        checkoutNote.textContent =
          "Demo order only. No real payment or delivery booking is made.";
      }
    }

    /* Quantity, remove and clear controls */

    cartItems.addEventListener("click", event => {
      const button = event.target.closest("[data-action]");
      if (!button) return;

      const article = button.closest(".apni-cart-item");
      if (!article) return;

      const key = article.dataset.itemKey;
      const action = button.dataset.action;
      const cart = readCart();
      const index = cart.findIndex(item => cartItemKey(item) === key);

      if (index < 0) return;

      if (action === "increase") {
        cart[index].quantity = Number(cart[index].quantity || 1) + 1;
      } else if (action === "decrease") {
        cart[index].quantity = Number(cart[index].quantity || 1) - 1;

        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
      } else if (action === "remove") {
        cart.splice(index, 1);
      }

      saveCart(cart);
      renderCart();
    });

    clearButton?.addEventListener("click", () => {
      const cart = readCart();
      if (!cart.length) return;

      if (window.confirm("Are you sure you want to clear your cart?")) {
        saveCart([]);
        renderCart();
        showCartMessage("Your cart has been cleared.");
      }
    });

    /* Demo order placement */

    function showCartMessage(message) {
      let toast = $("#apniCartToast");

      if (!toast) {
        toast = document.createElement("div");
        toast.id = "apniCartToast";
        toast.setAttribute("role", "status");
        toast.style.cssText = `
          position:fixed;bottom:24px;left:50%;
          transform:translateX(-50%);
          z-index:99999;background:#17263c;color:white;
          padding:14px 22px;border-radius:10px;
          box-shadow:0 8px 25px #0002;
          max-width:calc(100% - 32px);text-align:center;
        `;
        document.body.appendChild(toast);
      }

      toast.textContent = message;
      toast.hidden = false;

      clearTimeout(showCartMessage.timer);
      showCartMessage.timer = setTimeout(() => {
        toast.hidden = true;
      }, 3000);
    }

    $("#checkoutBtn")?.addEventListener("click", event => {
      event.preventDefault();

      const cart = readCart();
      if (!cart.length) {
        showCartMessage("Please add a shirt to your cart first.");
        return;
      }

      const total = cart.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );

      const confirmed = window.confirm(
        "Place your demo order?\n\n" +
        "Items: " +
        cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0) +
        "\nTotal: " + formatMoney(total) +
        "\n\nThis is a demo only; no payment will be taken."
      );

      if (!confirmed) return;

      const order = {
        orderNumber: "AS-" + Date.now().toString().slice(-8),
        items: cart,
        total,
        createdAt: new Date().toISOString(),
        status: "Demo order placed"
      };

      try {
        const orders = JSON.parse(
          localStorage.getItem("apniShirtOrders") || "[]"
        );
        orders.push(order);
        localStorage.setItem("apniShirtOrders", JSON.stringify(orders));
      } catch (error) {
        // Order confirmation can still be shown for this demo.
      }

      saveCart([]);
      renderCart();

      const heading = $("#summaryHeading");
      if (heading) heading.textContent = "Order Confirmed!";

      showCartMessage(
        "Order " + order.orderNumber + " placed successfully! Total: " +
        formatMoney(total)
      );

      const emptyHeading = $("#emptyCart h2");
      const emptyText = $("#emptyCart p");

      if (emptyHeading) emptyHeading.textContent = "Thank you for your order!";
      if (emptyText) {
        emptyText.textContent =
          "Your demo order has been recorded in this browser. No payment was taken.";
      }

      if (emptyCart) emptyCart.hidden = false;
      if (cartContent) cartContent.hidden = true;
    });

    /* Premium visual improvements */

    const style = document.createElement("style");
    style.textContent = `
      .cart-intro {
        background:
          radial-gradient(circle at 85% 15%, #e8ddc7 0, transparent 35%),
          linear-gradient(135deg, #f7f5f0, #fff);
      }

      .cart-layout {
        animation: apniCartEnter .5s ease both;
      }

      .cart-summary {
        position: sticky;
        top: 25px;
        border-radius: 16px;
        box-shadow: 0 12px 35px #17263c0b;
        transition: box-shadow .25s ease;
      }

      .cart-summary:hover {
        box-shadow: 0 16px 38px #17263c15;
      }

      .apni-cart-item {
        transition: background .25s ease;
      }

      .apni-cart-item:hover {
        background: #fbfaf7;
      }

      .cart-item-image img {
        transition: transform .4s ease;
      }

      .cart-item-image:hover img {
        transform: scale(1.05);
      }

      .cart-quantity button {
        cursor: pointer;
        transition: background .2s ease;
      }

      .cart-quantity button:hover {
        background: #eae1d0;
      }

      .cart-checkout-btn {
        transition: transform .2s ease, box-shadow .2s ease;
      }

      .cart-checkout-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px #17263c20;
      }

      .cart-empty {
        animation: apniCartEnter .45s ease both;
      }

      @keyframes apniCartEnter {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 750px) {
        .cart-summary {
          position: static;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: .01ms !important;
          transition-duration: .01ms !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Keep this page synchronized if cart changes elsewhere.
    window.addEventListener("storage", event => {
      if (event.key === CART_KEY) renderCart();
    });

    window.addEventListener("apniCartUpdated", renderCart);

    renderCart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApniCartPage, {
      once: true
    });
  } else {
    initApniCartPage();
  }
})();


/* ==========================================
   APNI SHIRT - ALL PAGES NAVIGATION
   Easy access to every website page
========================================== */

(() => {
  "use strict";

  function setupPageNavigation() {
    if (document.querySelector(".apni-all-pages-menu")) return;

    const header = document.querySelector(".header-content");
    if (!header) return;

    const pages = [
      { name: "Home", url: "index.html", icon: "⌂" },
      { name: "Shop", url: "shop.html", icon: "♧" },
      { name: "About Us", url: "about.html", icon: "ⓘ" },
      { name: "Shopping Cart", url: "cart.html", icon: "🛒" },
      { name: "Product Details", url: "product.html?id=1", icon: "◇" },
      { name: "Checkout", url: "checkout.html", icon: "✓" }
    ];

    const style = document.createElement("style");
    style.textContent = `
      .apni-all-pages-menu {
        position: relative;
        display: inline-flex;
        align-items: center;
        z-index: 10000;
      }

      .apni-pages-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 11px 15px;
        border: 1px solid #b9934a;
        border-radius: 9px;
        background: #17263c;
        color: #fff;
        font: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: .25s ease;
      }

      .apni-pages-toggle:hover,
      .apni-pages-toggle[aria-expanded="true"] {
        background: #b9934a;
        color: #fff;
        transform: translateY(-1px);
      }

      .apni-pages-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 225px;
        padding: 9px;
        background: #fff;
        border: 1px solid #eee7db;
        border-radius: 13px;
        box-shadow: 0 16px 40px #17263c20;
        opacity: 0;
        visibility: hidden;
        transform: translateY(8px);
        transition: .2s ease;
      }

      .apni-all-pages-menu.is-open .apni-pages-dropdown {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .apni-pages-dropdown a {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        border-radius: 8px;
        color: #17263c;
        text-decoration: none;
        font-size: 13px;
        transition: .2s ease;
      }

      .apni-pages-dropdown a:hover {
        background: #f5f0e6;
        color: #9b7738;
        padding-left: 16px;
      }

      .apni-pages-heading {
        padding: 9px 12px 7px;
        color: #9b7738;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.3px;
        text-transform: uppercase;
      }

      @media(max-width: 900px) {
        .apni-all-pages-menu {
          margin: 8px 0;
        }

        .apni-pages-dropdown {
          right: 0;
          width: min(225px, calc(100vw - 35px));
        }
      }

      @media(prefers-reduced-motion: reduce) {
        .apni-pages-dropdown,
        .apni-pages-dropdown a,
        .apni-pages-toggle {
          transition: none;
        }
      }
    `;

    document.head.appendChild(style);

    const menu = document.createElement("div");
    menu.className = "apni-all-pages-menu";

    menu.innerHTML = `
      <button
        type="button"
        class="apni-pages-toggle"
        aria-expanded="false"
        aria-haspopup="true"
      >
        ☰ Quick Pages <span aria-hidden="true">⌄</span>
      </button>

      <nav class="apni-pages-dropdown" aria-label="All website pages">
        <div class="apni-pages-heading">Explore Website</div>
        ${pages.map(page => `
          <a href="${page.url}">
            <span aria-hidden="true">${page.icon}</span>
            <span>${page.name}</span>
          </a>
        `).join("")}
      </nav>
    `;

    // Place the menu in the header so it is accessible from every page.
    header.appendChild(menu);

    const toggle = menu.querySelector(".apni-pages-toggle");

    function closeMenu() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", event => {
      if (!menu.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMenu();
        toggle.focus();
      }
    });

    // Highlight the current page in the menu.
    const currentFile =
      window.location.pathname.split("/").pop() || "index.html";

    menu.querySelectorAll(".apni-pages-dropdown a").forEach(link => {
      const linkFile = link.getAttribute("href").split("?")[0];

      if (linkFile === currentFile) {
        link.setAttribute("aria-current", "page");
        link.style.background = "#f5f0e6";
        link.style.fontWeight = "700";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      setupPageNavigation,
      { once: true }
    );
  } else {
    setupPageNavigation();
  }
})();






