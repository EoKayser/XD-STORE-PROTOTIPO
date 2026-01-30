/* ================================
   STORE.JS
   Gerenciamento de dados da loja
   Produtos + Carrinho (localStorage)
   ================================ */

/* ---------- CHAVES DO LOCALSTORAGE ---------- */
const PRODUCTS_KEY = "products";
const CART_KEY = "cart";

/* ---------- PRODUTOS ---------- */

/**
 * Retorna todos os produtos salvos
 */
export function getProducts() {
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
}

/**
 * Salva lista inteira de produtos
 */
export function setProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

/**
 * Adiciona um novo produto
 * product = { name, price, img }
 */
export function addProduct(product) {
  const products = getProducts();
  products.push(product);
  setProducts(products);
}

/**
 * Remove produtos pelos índices (array de índices)
 */
export function removeProducts(indexes) {
  let products = getProducts();

  // Remove do maior índice para o menor (evita bug)
  indexes
    .sort((a, b) => b - a)
    .forEach(index => {
      products.splice(index, 1);
    });

  setProducts(products);
}

/**
 * Atualiza um produto existente
 */
export function updateProduct(index, updatedProduct) {
  const products = getProducts();
  products[index] = updatedProduct;
  setProducts(products);
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
