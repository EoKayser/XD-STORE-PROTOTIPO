/* ================================
   STORE.JS
   Gerenciamento de dados da loja
   Produtos (API) + Carrinho (localStorage)
   ================================ */

import { API_BASE } from './config.js';

/* ---------- CHAVES DO LOCALSTORAGE ---------- */
const CART_KEY = "cart";
const PRODUCTS_KEY = "products";

/* ---------- PRODUTOS ---------- */

/**
 * Retorna todos os produtos (API primeiro, depois localStorage, depois window.PRODUCTS)
 */
export async function getProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    if (response.ok) {
      const products = await response.json();
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return products;
    }
  } catch (error) {
    console.warn('API não disponível, usando localStorage:', error);
  }

  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return window.PRODUCTS || [];
}

/**
 * Adiciona um novo produto ao localStorage
 * product = { name, price, img }
 */
export async function addProduct(product) {
  const products = await getProducts();
  const newProduct = {
    id: Date.now(),
    name: product.name,
    price: String(product.price),
    img: product.img,
    promoEnabled: false,
    promoPrice: ''
  };
  products.push(newProduct);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  return newProduct;
}

/**
 * Remove produto pelo ID via API
 */
export async function removeProduct(id) {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      // Atualizar localStorage
      const products = await getProducts();
      const filtered = products.filter(p => p.id != id);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
      return;
    }
  } catch (error) {
    console.warn('API não disponível, removendo localmente:', error);
  }

  // Fallback para localStorage
  const products = await getProducts();
  const filtered = products.filter(p => p.id != id);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
}

/**
 * Atualiza um produto existente via API
 */
export async function updateProduct(id, updatedProduct) {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct)
    });
    if (response.ok) {
      const updated = await response.json();
      // Atualizar localStorage
      const products = await getProducts();
      const index = products.findIndex(p => p.id == id);
      if (index !== -1) {
        products[index] = updated;
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      }
      return updated;
    }
  } catch (error) {
    console.warn('API não disponível, atualizando localmente:', error);
  }

  // Fallback para localStorage
  const products = await getProducts();
  const index = products.findIndex(p => p.id == id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct };
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }
}

/* ---------- CARRINHO ---------- */

/**
 * Retorna carrinho
 */
export function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

/**
 * Salva carrinho
 */
export function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Adiciona item ao carrinho
 */
export function addToCart(item) {
  const cart = getCart();
  cart.push(item);
  setCart(cart);
}

/**
 * Remove item do carrinho pelo índice
 */
export function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
}

/**
 * Limpa carrinho
 */
export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

/**
 * Calcula total do carrinho
 */
export function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => {
    return total + parseFloat(item.price);
  }, 0);
}
