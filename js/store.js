/* ================================
   STORE.JS
   Gerenciamento de dados da loja
   Produtos (API) + Carrinho (localStorage)
   ================================ */

import { API_BASE } from './config.js';

/* ---------- CHAVES DO LOCALSTORAGE ---------- */
const CART_KEY = "cart";

/* ---------- PRODUTOS ---------- */

/**
 * Retorna todos os produtos da API
 */
export async function getProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error('Erro ao buscar produtos');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

/**
 * Adiciona um novo produto via API
 * product = { name, price, img }
 */
export async function addProduct(product) {
  try {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Erro ao adicionar produto');
    return await response.json();
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    throw error;
  }
}

/**
 * Remove produto pelo ID via API
 */
export async function removeProduct(id) {
  try {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Erro ao remover produto');
    return await response.json();
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    throw error;
  }
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
    if (!response.ok) throw new Error('Erro ao atualizar produto');
    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    throw error;
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
