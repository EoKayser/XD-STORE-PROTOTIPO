// Admin panel for XD Store

import { renderProducts } from "./ui.js";
import { addProduct, removeProduct, updateProduct, getProducts } from "./store.js";

const ADMIN_CREDENTIALS = {
  user: 'kayser',
  pass: '1234'
};

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
    body.style.backgroundImage = `url('${theme.backgroundImage}')`;
    body.style.backgroundSize = theme.backgroundSize;
    body.style.backgroundRepeat = theme.backgroundRepeat;
    body.style.backgroundPosition = theme.backgroundPosition;
    body.style.backgroundAttachment = 'fixed';
  } else {
    body.style.backgroundImage = '';
  }
}

applyTheme();

function injectAdminStyles() {
  if (document.getElementById('admin-styles')) return;
  const style = document.createElement('style');
  style.id = 'admin-styles';
  style.textContent = `
    .admin-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.55);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .admin-overlay.active { display: flex; }
    .admin-modal {
      width: min(980px, 90vw);
      max-height: 90vh;
      overflow: auto;
      background: #0b0b0f;
      border: 2px solid #6a0dad;
      border-radius: 14px;
      box-shadow: 0 10px 40px rgba(106,13,173,.35);
    }
    .admin-header {
      padding: 16px 18px;
      background: linear-gradient(135deg,#1a1028,#2a0f48);
      border-bottom: 1px solid rgba(255,255,255,.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .admin-header h2 {
      margin: 0;
      color: #EDE9FE;
      font-size: 1.05rem;
    }
    .admin-body {
      padding: 14px 18px;
      display: grid;
      gap: 10px;
    }
    .admin-section {
      background: #0f0f14;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px;
      overflow: hidden;
    }
    .admin-toggle {
      width: 100%;
      text-align: left;
      padding: 12px 14px;
      background: #151520;
      border: 0;
      color: #e5e7eb;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .admin-toggle:hover { background: #1a1a2a; }
    .admin-content {
      padding: 12px 14px;
      display: grid;
      gap: 8px;
    }
    .admin-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      padding: 12px 18px;
      border-top: 1px solid rgba(255,255,255,.08);
    }
    .admin-input, .admin-select, .admin-textarea {
      width: 100%;
      padding: 10px 12px;
      border-radius: 10px;
      background: #0f0f18;
      border: 1px solid rgba(255,255,255,.10);
      color: #e5e7eb;
    }
    .admin-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .admin-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .btn-admin {
      cursor: pointer;
      border: 0;
      border-radius: 10px;
      padding: .7rem 1rem;
      background: #6a0dad;
      color: #fff;
      font-weight: 700;
    }
    .btn-danger { background: #ff5555; }
    .hidden { display: none; }
    .admin-note { font-size: .85rem; color: #a78bfa; }
  `;
  document.head.appendChild(style);
}

injectAdminStyles();

function createAdminOverlay() {
  if (document.getElementById('adminOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'adminOverlay';
  overlay.className = 'admin-overlay';
  overlay.innerHTML = `
    <div class="admin-modal">
      <div class="admin-header">
        <h2>XD Admin</h2>
        <button class="btn-admin btn-danger" id="closeAdmin">Fechar</button>
      </div>
      <div class="admin-body" id="adminBody">
        <div class="admin-section">
          <button class="admin-toggle" type="button">🔐 Login</button>
          <div class="admin-content" id="admin-login">
            <div class="admin-grid-2">
              <input class="admin-input" id="adminUsername" placeholder="Usuário">
              <input type="password" class="admin-input" id="adminPassword" placeholder="Senha">
            </div>
            <div class="admin-actions">
              <button class="btn-admin" id="adminLoginBtn">Entrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  // Bind close
  document.getElementById('closeAdmin').onclick = () => overlay.classList.remove('active');
}

createAdminOverlay();

// Open with Ctrl+M
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'm') {
    e.preventDefault();
    document.getElementById('adminOverlay').classList.add('active');
  }
});

function saveAdminData() {
  localStorage.setItem('adminData', JSON.stringify(adminData));
  localStorage.setItem('products', JSON.stringify(adminData.products));
}



// Login
const login = async () => {
  const user = document.getElementById('adminUsername').value.trim();
  const pass = document.getElementById('adminPassword').value.trim();
  if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
    window.location.href = 'pages/admin.html';
  } else {
    alert('Usuário ou senha inválidos');
  }
};

document.getElementById('adminLoginBtn').onclick = login;

// Allow enter key on both fields
document.getElementById('adminUsername').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    login();
  }
});
document.getElementById('adminPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    login();
  }
});
