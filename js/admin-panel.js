// Admin panel functionality for XD Store

import { renderProducts } from "./ui.js";

// Admin data structure
let adminData = {
  store: {
    name: 'XD Store',
    slogan: '',
    links: { discordUrl: 'https://discord.gg/3t7g9TbN5M' },
    theme: {
      primary: '#6a0dad',
      secondary: '#5a0cb0',
      background: '#0a0a0a',
      backgroundImage: '',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center'
    }
  },
  pix: {
    key: '2809b0f3-e163-4554-9505-47080e1142a4',
    merchantName: '.',
    merchantCity: '.',
    copyMode: 'payload',
    amountMode: 'fixed'
  },
  content: {
    checkoutNote: '',
    successDiscordStepsHTML: ''
  }
};

// Load admin data from localStorage
function loadAdminData() {
  const stored = localStorage.getItem('adminData');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      adminData = { ...adminData, ...parsed };
    } catch (e) {
      console.warn('Error loading admin data:', e);
    }
  }
}

// Save admin data to localStorage
function saveAdminData() {
  localStorage.setItem('adminData', JSON.stringify(adminData));
}

// Apply theme from admin data
function applyTheme() {
  const theme = adminData.store.theme;
  document.documentElement.style.setProperty('--primary', theme.primary);
  document.documentElement.style.setProperty('--secondary', theme.secondary);
  document.documentElement.style.setProperty('--background', theme.background);
  const body = document.body;
  body.style.backgroundColor = theme.background;
  if (theme.backgroundImage) {
    body.style.backgroundImage = `url('../${theme.backgroundImage}')`;
    body.style.backgroundSize = theme.backgroundSize;
    body.style.backgroundRepeat = theme.backgroundRepeat;
    body.style.backgroundPosition = theme.backgroundPosition;
    body.style.backgroundAttachment = 'fixed';
  } else {
    body.style.backgroundImage = '';
  }
}

// Load admin fields into the form
function loadAdminFields() {
  // Store
  document.getElementById('store-name').value = adminData.store.name;
  document.getElementById('store-slogan').value = adminData.store.slogan;
  document.getElementById('discord-url').value = adminData.store.links.discordUrl;
  document.getElementById('theme-primary').value = adminData.store.theme.primary;
  document.getElementById('theme-secondary').value = adminData.store.theme.secondary;
  document.getElementById('theme-background').value = adminData.store.theme.background;
  document.getElementById('theme-background-image').value = adminData.store.theme.backgroundImage;
  document.getElementById('theme-background-size').value = adminData.store.theme.backgroundSize;
  document.getElementById('theme-background-repeat').value = adminData.store.theme.backgroundRepeat;
  document.getElementById('theme-background-position').value = adminData.store.theme.backgroundPosition;

  // PIX
  document.getElementById('pix-key').value = adminData.pix.key;
  document.getElementById('pix-name').value = adminData.pix.merchantName;
  document.getElementById('pix-city').value = adminData.pix.merchantCity;
  document.getElementById('pix-copy-mode').value = adminData.pix.copyMode;
  document.getElementById('pix-amount-mode').value = adminData.pix.amountMode;
  document.getElementById('checkout-note').value = adminData.content.checkoutNote;

  // Content
  document.getElementById('success-steps').value = adminData.content.successDiscordStepsHTML;

  // Load products
  loadAdminProducts();
}

// Load products into admin panel
function loadAdminProducts() {
  const products = window.PRODUCTS || [];
  renderAdminProducts(products);
}

// Render products in admin panel
function renderAdminProducts(products) {
  const list = document.getElementById('admin-product-list');
  list.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'admin-product';
    div.style.display = 'grid';
    div.style.gridTemplateColumns = 'auto 1fr 120px 1fr';
    div.style.gap = '6px';
    div.style.alignItems = 'center';
    div.style.margin = '6px 0';

    const promoChecked = p.promoEnabled ? 'checked' : '';
    const promoPriceVal = p.promoPrice || '';

    div.innerHTML = `
      <input type="checkbox" class="remove-check" data-id="${p.id}">
      <input type="text" class="admin-input edit-name" value="${p.name}">
      <input type="number" step="0.01" class="admin-input edit-price" value="${p.price}">
      <input type="text" class="admin-input edit-img" value="${p.img.replace('../assets/images/', '')}">
      <div style="grid-column: 1 / -1; display:flex; gap:8px; align-items:center; margin-top:4px;">
        <label style="display:flex; align-items:center; gap:6px;">
          <input type="checkbox" class="edit-promo-enabled" ${promoChecked}>
          Promoção ativa
        </label>
        <input type="number" step="0.01" class="admin-input edit-promo-price" placeholder="Preço promocional" value="${promoPriceVal}">
      </div>
    `;
    list.appendChild(div);
  });
}

// Bind product actions
function bindProductActions() {
  const addBtn = document.getElementById('add-product');
  addBtn.onclick = () => {
    const name = document.getElementById('prod-name').value.trim();
    const price = document.getElementById('prod-price').value;
    const img = document.getElementById('prod-img').value.trim();
    if (!name || !price || !img) {
      alert('Preencha todos os campos');
      return;
    }

    // Add to window.PRODUCTS
    if (!window.PRODUCTS) window.PRODUCTS = [];
    const newProduct = {
      id: Date.now(),
      name,
      price: String(price),
      img: '../assets/images/' + img,
      promoEnabled: false,
      promoPrice: ''
    };
    window.PRODUCTS.push(newProduct);

    // Clear form
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-price').value = '';
    document.getElementById('prod-img').value = '';

    // Update UI
    loadAdminProducts();
    renderProducts();

    // Show export message
    alert('Produto adicionado! Para que outros usuários vejam, copie o JSON dos produtos e cole no index.html.');
  };

  const removeBtn = document.getElementById('remove-selected');
  removeBtn.onclick = () => {
    const checked = document.querySelectorAll('.remove-check:checked');
    const ids = Array.from(checked).map(c => Number(c.dataset.id));
    if (!window.PRODUCTS) window.PRODUCTS = [];
    window.PRODUCTS = window.PRODUCTS.filter(p => !ids.includes(p.id));

    // Update UI
    loadAdminProducts();
    renderProducts();

    // Show export message
    alert('Produtos removidos! Para que outros usuários vejam, copie o JSON dos produtos e cole no index.html.');
  };

  // Export products as JSON
  const exportBtn = document.getElementById('export-products');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const products = window.PRODUCTS || [];
      const json = JSON.stringify(products, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        alert('JSON dos produtos copiado para a área de transferência! Cole no window.PRODUCTS do index.html.');
      }).catch(() => {
        // Fallback: show in prompt
        prompt('Copie este JSON e cole no window.PRODUCTS do index.html:', json);
      });
    };
  }
}

// Bind save action
function bindSaveAction() {
  const saveBtn = document.getElementById('save-admin');
  saveBtn.onclick = () => {
    // Store
    adminData.store.name = document.getElementById('store-name').value.trim();
    adminData.store.slogan = document.getElementById('store-slogan').value.trim();
    adminData.store.links.discordUrl = document.getElementById('discord-url').value.trim();
    adminData.store.theme.primary = document.getElementById('theme-primary').value;
    adminData.store.theme.secondary = document.getElementById('theme-secondary').value;
    adminData.store.theme.background = document.getElementById('theme-background').value;
    adminData.store.theme.backgroundImage = document.getElementById('theme-background-image').value.trim();
    adminData.store.theme.backgroundSize = document.getElementById('theme-background-size').value;
    adminData.store.theme.backgroundRepeat = document.getElementById('theme-background-repeat').value;
    adminData.store.theme.backgroundPosition = document.getElementById('theme-background-position').value;

    // Update products from form
    const productElements = document.querySelectorAll('.admin-product');
    for (const el of productElements) {
      const id = Number(el.querySelector('.remove-check').dataset.id);
      const name = el.querySelector('.edit-name').value;
      const price = el.querySelector('.edit-price').value;
      const img = '../assets/images/' + el.querySelector('.edit-img').value;
      const promoEnabled = el.querySelector('.edit-promo-enabled').checked;
      const promoPrice = el.querySelector('.edit-promo-price').value;

      // Update in window.PRODUCTS
      if (window.PRODUCTS) {
        const product = window.PRODUCTS.find(p => p.id === id);
        if (product) {
          product.name = name;
          product.price = price;
          product.img = img;
          product.promoEnabled = promoEnabled;
          product.promoPrice = promoPrice;
        }
      }
    }

    // PIX
    adminData.pix.key = document.getElementById('pix-key').value.trim();
    adminData.pix.merchantName = document.getElementById('pix-name').value.trim() || '.';
    adminData.pix.merchantCity = document.getElementById('pix-city').value.trim() || '.';
    adminData.pix.copyMode = document.getElementById('pix-copy-mode').value;
    adminData.pix.amountMode = document.getElementById('pix-amount-mode').value;

    // Content
    adminData.content.checkoutNote = document.getElementById('checkout-note').value;
    adminData.content.successDiscordStepsHTML = document.getElementById('success-steps').value;

    saveAdminData();
    applyTheme();

    // Update UI
    renderProducts();

    alert('Alterações salvas! Para que outros usuários vejam os produtos, copie o JSON dos produtos e cole no index.html.');
  };
}

// Bind accordion functionality
function bindAccordions() {
  document.querySelectorAll('.admin-toggle').forEach(btn => {
    btn.onclick = () => {
      const content = btn.nextElementSibling;
      content.classList.toggle('hidden');
    };
  });
}

// Bind logout functionality
function bindLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      window.location.href = '../index.html';
    };
  }
}

// Initialize admin panel
async function initAdminPanel() {
  loadAdminData();
  applyTheme();
  bindAccordions();
  await loadAdminFields();
  bindProductActions();
  bindSaveAction();
  bindLogout();
}

// Export for use in admin.html
export { initAdminPanel };
