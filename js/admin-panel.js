// Admin Panel Page Script

import { renderProducts } from "./ui.js";
import { addProduct, removeProduct, updateProduct, getProducts } from "./store.js";

const defaultAdminData = {
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
  },
  products: []
};

function getAdminData() {
  try {
    const raw = localStorage.getItem('adminData');
    if (!raw) return { ...defaultAdminData };
    const parsed = JSON.parse(raw);
    return {
      ...defaultAdminData,
      ...parsed,
      store: {
        ...defaultAdminData.store,
        ...(parsed.store || {}),
        links: { ...defaultAdminData.store.links, ...(parsed.store?.links || {}) },
        theme: { ...defaultAdminData.store.theme, ...(parsed.store?.theme || {}) }
      },
      pix: { ...defaultAdminData.pix, ...(parsed.pix || {}) },
      content: { ...defaultAdminData.content, ...(parsed.content || {}) },
      products: Array.isArray(parsed.products) ? parsed.products : defaultAdminData.products
    };
  } catch {
    return { ...defaultAdminData };
  }
}

let adminData = getAdminData();

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

applyTheme();

function saveAdminData() {
  localStorage.setItem('adminData', JSON.stringify(adminData));
  localStorage.setItem('products', JSON.stringify(adminData.products));
}

async function loadAdminFields() {
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

  await loadAdminProducts();
}

async function loadAdminProducts() {
  const products = await getProducts();
  renderAdminProducts(products);
}

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

function bindProductActions() {
  const addBtn = document.getElementById('add-product');
  addBtn.onclick = async () => {
    const name = document.getElementById('prod-name').value.trim();
    const price = document.getElementById('prod-price').value;
    const img = document.getElementById('prod-img').value.trim();
    if (!name || !price || !img) {
      alert('Preencha todos os campos');
      return;
    }
    try {
      await addProduct({ name, price, img: '../assets/images/' + img });
      document.getElementById('prod-name').value = '';
      document.getElementById('prod-price').value = '';
      document.getElementById('prod-img').value = '';
      await loadAdminProducts();
      await renderProducts();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto');
    }
  };

  const removeBtn = document.getElementById('remove-selected');
  removeBtn.onclick = async () => {
    const checked = document.querySelectorAll('.remove-check:checked');
    const ids = Array.from(checked).map(c => Number(c.dataset.id));
    try {
      for (const id of ids) {
        await removeProduct(id);
      }
      await loadAdminProducts();
      await renderProducts();
    } catch (error) {
      console.error('Erro ao remover produtos:', error);
      alert('Erro ao remover produtos');
    }
  };
}

function bindSaveAction() {
  const saveBtn = document.getElementById('save-admin');
  saveBtn.onclick = async () => {
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

    // Update products
    const productElements = document.querySelectorAll('.admin-product');
    for (const el of productElements) {
      const id = Number(el.querySelector('.remove-check').dataset.id);
      const name = el.querySelector('.edit-name').value;
      const price = el.querySelector('.edit-price').value;
      const img = '../assets/images/' + el.querySelector('.edit-img').value;
      const promoEnabled = el.querySelector('.edit-promo-enabled').checked;
      const promoPrice = el.querySelector('.edit-promo-price').value;
      try {
        await updateProduct(id, { name, price, img, promoEnabled, promoPrice });
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
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
    alert('Alterações salvas. Recarregando para aplicar...');
    location.reload();
  };
}

function bindLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.onclick = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      window.location.href = '../index.html';
    }
  };
}

// Initialize
async function initAdminPanel() {
  await loadAdminFields();
  bindProductActions();
  bindSaveAction();
  bindLogout();
}

initAdminPanel();
