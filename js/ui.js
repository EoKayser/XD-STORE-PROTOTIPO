/* ================================
   UI.JS
   Responsável apenas pela interface
   (renderização e eventos visuais)
   ================================ */

import {
  getProducts,
  getCart,
  addToCart,
  removeFromCart,
  getCartTotal
} from "./store.js";

/* ---------- ELEMENTOS ---------- */
const productsContainer = document.querySelector(".products-list");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsContainer = document.querySelector(".cart-items");
const cartCount = document.querySelector(".cart-count");
const cartTotal = document.getElementById("cart-total");
const openCartBtn = document.getElementById("open-cart");
const closeCartBtn = document.getElementById("close-cart");

/* ---------- PRODUTOS ---------- */
export function renderProducts() {
  const products = getProducts();
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = "<p>Nenhum produto cadastrado.</p>";
    return;
  }

  products.forEach((product, index) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const basePrice = parseFloat(product.price);
    const promoEnabled = !!product.promoEnabled && product.promoPrice !== '' && !isNaN(parseFloat(product.promoPrice)) && parseFloat(product.promoPrice) > 0 && parseFloat(product.promoPrice) < basePrice;
    const promoPrice = promoEnabled ? parseFloat(product.promoPrice) : null;
    const priceHTML = promoEnabled 
      ? `<span class="price-old">R$ ${basePrice.toFixed(2)}</span><span class="price-new">R$ ${promoPrice.toFixed(2)}</span>`
      : `R$ ${basePrice.toFixed(2)}`;
    const badgeHTML = promoEnabled ? `<div class="badge-promo">Promo</div>` : '';

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.img}" alt="${product.name}">
      </div>

      <div class="product-info">
        ${badgeHTML}
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${priceHTML}</p>

        <button class="product-button" data-index="${index}">
          Adicionar ao carrinho
        </button>
      </div>
    `;

    productsContainer.appendChild(card);
  });

  bindAddToCartButtons();
}

/* ---------- CARRINHO ---------- */
export function renderCart() {
  const cart = getCart();
  cartItemsContainer.innerHTML = "";

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <span>${item.name}</span>
      <span>R$ ${parseFloat(item.price).toFixed(2)}</span>
      <button class="remove-item" data-index="${index}">✕</button>
    `;

    cartItemsContainer.appendChild(div);
  });

  cartCount.textContent = cart.length;
  cartTotal.textContent = "R$ " + getCartTotal().toFixed(2);

  bindRemoveItemButtons();
}

/* ---------- EVENTOS ---------- */
function bindAddToCartButtons() {
  document.querySelectorAll(".product-button").forEach(btn => {
    btn.onclick = () => {
      const index = btn.dataset.index;
      const product = getProducts()[index];

      const basePrice = parseFloat(product.price);
      const promoEnabled = !!product.promoEnabled && product.promoPrice !== '' && !isNaN(parseFloat(product.promoPrice)) && parseFloat(product.promoPrice) > 0 && parseFloat(product.promoPrice) < basePrice;
      const priceToAdd = promoEnabled ? parseFloat(product.promoPrice) : parseFloat(product.price);

      addToCart({
        name: product.name,
        price: priceToAdd
      });

      renderCart();
      openCart();
    };
  });
}

function bindRemoveItemButtons() {
  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.onclick = () => {
      removeFromCart(btn.dataset.index);
      renderCart();
    };
  });
}

/* ---------- ABRIR / FECHAR ---------- */
export function openCart() {
  cartSidebar.classList.add("active");
  cartOverlay.classList.add("active");
}

export function closeCart() {
  cartSidebar.classList.remove("active");
  cartOverlay.classList.remove("active");
}

/* ---------- BIND GLOBAL ---------- */
export function bindCartControls() {
  openCartBtn.onclick = openCart;
  closeCartBtn.onclick = closeCart;
  cartOverlay.onclick = closeCart;
}

/* ---------- INIT ---------- */
export function initUI() {
  renderProducts();
  renderCart();
  bindCartControls();
}
