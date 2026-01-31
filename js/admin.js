import { renderProducts } from "./ui.js";
import { addProduct, removeProduct, updateProduct } from "./store.js";

// ===============================
// ADMIN - LOGIN PRIMEIRO, PAINEL APÓS AUTENTICAÇÃO
// Login: usuário "kayser", senha "1234"
// ===============================

const ADMIN_USER = 'kayser';
const ADMIN_PASS = '1234';

// ===============================
// DEFAULTS E ADMIN DATA
// ===============================
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
    copyMode: 'payload', // 'payload' | 'key'
    amountMode: 'fixed' // 'fixed' | 'open'
  },
  content: {
    checkoutNote: '',
    successDiscordStepsHTML: ''
  },
  products: JSON.parse(localStorage.getItem('products') || '[]')
};

function getAdminData() {
  try {
    const raw = localStorage.getItem('adminData');
    if (!raw) return defaultAdminData;
    const parsed = JSON.parse(raw);
    return {
      ...defaultAdminData,
      ...parsed,
      store: {
        ...defaultAdminData.store,
        ...(parsed.store || {}),
        links: { ...defaultAdminData.store.links, ...((parsed.store || {}).links || {}) },
        theme: { ...defaultAdminData.store.theme, ...((parsed.store || {}).theme || {}) }
      },
      pix: { ...defaultAdminData.pix, ...(parsed.pix || {}) },
      content: { ...defaultAdminData.content, ...(parsed.content || {}) },
      products: Array.isArray(parsed.products) ? parsed.products : defaultAdminData.products
    };
  } catch { return defaultAdminData; }
}

let adminData = getAdminData();

// ===============================
// APLICA TEMA IMEDIATO (cores/fundo)
// ===============================
function applyThemeFromStorage() {
  const data = getAdminData();
  try {
    document.documentElement.style.setProperty('--primary', data.store.theme.primary);
    document.documentElement.style.setProperty('--secondary', data.store.theme.secondary);
    document.documentElement.style.setProperty('--background', data.store.theme.background);
  } catch {}
  try {
    const b = document.body;
    b.style.backgroundColor = data.store.theme.background || '#0a0a0a';
    if (data.store.theme.backgroundImage) {
      b.style.backgroundImage = `url('${data.store.theme.backgroundImage}')`;
      b.style.backgroundSize = data.store.theme.backgroundSize || 'cover';
      b.style.backgroundRepeat = data.store.theme.backgroundRepeat || 'no-repeat';
      b.style.backgroundPosition = data.store.theme.backgroundPosition || 'center center';
      b.style.backgroundAttachment = 'fixed';
    } else {
      b.style.backgroundImage = '';
    }
  } catch {}
}
applyThemeFromStorage();

// ===============================
// ESTILOS DO PAINEL
// ===============================
(function injectStyles(){
  if (document.getElementById('adminPanelStyles')) return;
  const style = document.createElement('style');
  style.id = 'adminPanelStyles';
  style.textContent = `
    .admin-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;z-index:9999}
    .admin-overlay.active{display:flex}
    .admin-modal{width:min(980px,90vw);max-height:90vh;overflow:auto;background:#0b0b0f;border:2px solid #6a0dad;border-radius:14px;box-shadow:0 10px 40px rgba(106,13,173,.35)}
    .admin-header{padding:16px 18px;background:linear-gradient(135deg,#1a1028,#2a0f48);border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0}
    .admin-header h2{margin:0;color:#EDE9FE;font-size:1.05rem}
    .admin-body{padding:14px 18px;display:grid;gap:10px}
    .admin-section{background:#0f0f14;border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden}
    .admin-toggle{width:100%;text-align:left;padding:12px 14px;background:#151520;border:0;color:#e5e7eb;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:space-between}
    .admin-toggle:hover{background:#1a1a2a}
    .admin-content{padding:12px 14px;display:grid;gap:8px}
    .admin-actions{display:flex;gap:10px;justify-content:flex-end;padding:12px 18px;border-top:1px solid rgba(255,255,255,.08)}
    .admin-input, .admin-select, .admin-textarea{width:100%;padding:10px 12px;border-radius:10px;background:#0f0f18;border:1px solid rgba(255,255,255,.10);color:#e5e7eb}
    .admin-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .admin-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
    .btn-admin{cursor:pointer;border:0;border-radius:10px;padding:.7rem 1rem;background:#6a0dad;color:#fff;font-weight:700}
    .btn-danger{background:#ff5555}
    .hidden{display:none}
    .admin-note{font-size:.85rem;color:#a78bfa}
  `;
  document.head.appendChild(style);
})();

// ===============================
// OVERLAY + LOGIN (APENAS LOGIN INICIAL)
// ===============================
function ensureOverlay() {
  if (document.getElementById('adminOverlay')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="admin-overlay" id="adminOverlay">
      <div class="admin-modal">
        <div class="admin-header">
          <h2>XD Admin</h2>
          <button class="btn-admin btn-danger" id="closeAdmin">Fechar</button>
        </div>
        <div class="admin-body" id="adminBody">
          <div class="admin-section">
            <button class="admin-toggle" type="button">🔐 Login</button>
            <div class="admin-content" id="adminLogin">
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
    </div>
  `);
}

ensureOverlay();

// CTRL+M abre painel (somente login presente)
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key.toLowerCase() === 'm') {
    e.preventDefault();
    document.getElementById('adminOverlay').classList.add('active');
  }
});

// Fechar
(function bindClose(){
  const btn = document.getElementById('closeAdmin');
  if (btn) btn.onclick = () => document.getElementById('adminOverlay').classList.remove('active');
})();

// ===============================
// UTIL: Salvar/Persistir
// ===============================
function persistAdminData() {
  localStorage.setItem('adminData', JSON.stringify(adminData));
  localStorage.setItem('products', JSON.stringify(adminData.products));
}

// ===============================
// CONSTRUÇÃO DO PAINEL (APÓS LOGIN)
// ===============================
async function buildPanelSections() {
  const body = document.getElementById('adminBody');
  // Limpa e reinsere header + corpo básicos
  body.innerHTML = '';

  // Seções: Loja, Produtos, PIX/Checkout, Conteúdo + Ações
  const sectionsHTML = `
    <div class="admin-section">
      <button class="admin-toggle" type="button">🏪 Loja</button>
      <div class="admin-content hidden">
        <input class="admin-input" id="storeName" placeholder="Nome da loja">
        <input class="admin-input" id="storeSlogan" placeholder="Slogan (opcional)">
        <div class="admin-grid-2">
          <input class="admin-input" id="discordUrl" placeholder="URL do Discord (https://...)">
          <span class="admin-note">Link usado na página de sucesso.</span>
        </div>
        <h4 class="admin-note">Tema - Cores</h4>
        <div class="admin-grid-3">
          <div><label>Primária</label><input type="color" class="admin-input" id="themePrimary"></div>
          <div><label>Secundária</label><input type="color" class="admin-input" id="themeSecondary"></div>
          <div><label>Fundo (cor)</label><input type="color" class="admin-input" id="themeBackground"></div>
        </div>
        <h4 class="admin-note">Fundo - Imagem</h4>
        <input class="admin-input" id="themeBackgroundImage" placeholder="URL da imagem (https://...)">
        <div class="admin-grid-3">
          <select class="admin-select" id="themeBackgroundSize">
            <option value="cover">cover</option>
            <option value="contain">contain</option>
            <option value="auto">auto</option>
          </select>
          <select class="admin-select" id="themeBackgroundRepeat">
            <option value="no-repeat">no-repeat</option>
            <option value="repeat">repeat</option>
            <option value="repeat-x">repeat-x</option>
            <option value="repeat-y">repeat-y</option>
          </select>
          <select class="admin-select" id="themeBackgroundPosition">
            <option value="center center">center center</option>
            <option value="top center">top center</option>
            <option value="center left">center left</option>
            <option value="bottom center">bottom center</option>
          </select>
        </div>
      </div>
    </div>

    <div class="admin-section">
      <button class="admin-toggle" type="button">📦 Produtos</button>
      <div class="admin-content hidden">
        <div class="admin-grid-3">
          <input class="admin-input" id="prodName" placeholder="Nome do produto">
          <input class="admin-input" id="prodPrice" placeholder="Preço" type="number" step="0.01">
          <input class="admin-input" id="prodImg" placeholder="imagem.jpg">
        </div>
        <small class="admin-note">Base: <strong>assets/images/</strong></small>
        <div class="admin-actions"><button class="btn-admin" id="addProduct">Adicionar Produto</button></div>
        <div id="adminProductList"></div>
        <div class="admin-actions"><button class="btn-admin btn-danger" id="removeSelected">Remover selecionados</button></div>
      </div>
    </div>

    <div class="admin-section">
      <button class="admin-toggle" type="button">💳 PIX / Checkout</button>
      <div class="admin-content hidden">
        <input class="admin-input" id="pixKey" placeholder="Chave PIX">
        <div class="admin-grid-2">
          <input class="admin-input" id="pixName" placeholder="Nome recebedor (ou . para ocultar)">
          <input class="admin-input" id="pixCity" placeholder="Cidade (ou . para ocultar)">
        </div>
        <div class="admin-grid-2">
          <label>Modo Copia e Cola
            <select class="admin-select" id="pixCopyMode">
              <option value="payload">Payload completo (recomendado)</option>
              <option value="key">Somente chave</option>
            </select>
          </label>
          <label>Valor
            <select class="admin-select" id="pixAmountMode">
              <option value="fixed">Fixo (total do carrinho)</option>
              <option value="open">Aberto (cliente digita)</option>
            </select>
          </label>
        </div>
        <textarea class="admin-textarea" id="checkoutNote" placeholder="Aviso no checkout (opcional)" rows="3"></textarea>
      </div>
    </div>

    <div class="admin-section">
      <button class="admin-toggle" type="button">📝 Conteúdo</button>
      <div class="admin-content hidden">
        <label for="successSteps">Instruções (HTML) da página de sucesso</label>
        <textarea class="admin-textarea" id="successSteps" rows="6" placeholder="HTML das instruções (Discord, tickets, etc.)"></textarea>
      </div>
    </div>

    <div class="admin-actions">
      <button class="btn-admin" id="saveAdmin">💾 Salvar alterações</button>
    </div>
  `;

  body.insertAdjacentHTML('beforeend', sectionsHTML);

  bindAccordions();
  await loadAdminFields();
  bindProducts();
  bindSave();
}

// ACCORDION
function bindAccordions() {
  document.querySelectorAll('#adminOverlay .admin-toggle').forEach(btn => {
    btn.onclick = () => {
      const content = btn.nextElementSibling;
      if (content) content.classList.toggle('hidden');
    };
  });
}

// Carregar valores nos campos
async function loadAdminFields() {
  // Loja
  document.getElementById('storeName').value = adminData.store.name || '';
  document.getElementById('storeSlogan').value = adminData.store.slogan || '';
  document.getElementById('discordUrl').value = (adminData.store.links && adminData.store.links.discordUrl) || '';
  document.getElementById('themePrimary').value = adminData.store.theme.primary || '#6a0dad';
  document.getElementById('themeSecondary').value = adminData.store.theme.secondary || '#5a0cb0';
  document.getElementById('themeBackground').value = adminData.store.theme.background || '#0a0a0a';
  document.getElementById('themeBackgroundImage').value = adminData.store.theme.backgroundImage || '';
  document.getElementById('themeBackgroundSize').value = adminData.store.theme.backgroundSize || 'cover';
  document.getElementById('themeBackgroundRepeat').value = adminData.store.theme.backgroundRepeat || 'no-repeat';
  document.getElementById('themeBackgroundPosition').value = adminData.store.theme.backgroundPosition || 'center center';

  // PIX
  document.getElementById('pixKey').value = adminData.pix.key || '';
  document.getElementById('pixName').value = adminData.pix.merchantName || '.';
  document.getElementById('pixCity').value = adminData.pix.merchantCity || '.';
  document.getElementById('pixCopyMode').value = adminData.pix.copyMode || 'payload';
  document.getElementById('pixAmountMode').value = adminData.pix.amountMode || 'fixed';
  document.getElementById('checkoutNote').value = adminData.content.checkoutNote || '';

  // Conteúdo
  document.getElementById('successSteps').value = adminData.content.successDiscordStepsHTML || '';

  await loadAdminProducts();
}

// Carregar produtos da API
async function loadAdminProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error('Erro ao carregar produtos');
    const products = await response.json();
    renderAdminProducts(products);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    renderAdminProducts([]);
  }
}

// Produtos: render, add, remove
function renderAdminProducts(products) {
  const list = document.getElementById('adminProductList');
  list.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'admin-product';
    div.style.display = 'grid';
    div.style.gridTemplateColumns = 'auto 1fr 120px 1fr';
    div.style.gap = '6px';
    div.style.alignItems = 'center';
    div.style.margin = '6px 0';

    const promoChecked = p.promoEnabled ? ' checked' : '';
    const promoPriceVal = (p.promoPrice !== undefined && p.promoPrice !== null) ? p.promoPrice : '';

    div.innerHTML = `
      <input type="checkbox" class="remove-check" data-id="${p.id}">
      <input type="text" class="admin-input edit-name" value="${p.name}">
      <input type="number" step="0.01" class="admin-input edit-price" value="${p.price}">
      <input type="text" class="admin-input edit-img" value="${p.img.replace('assets/images/','')}">
      <div style="grid-column: 1 / -1; display:flex; gap:8px; align-items:center; margin-top:4px;">
        <label style="display:flex; align-items:center; gap:6px;">
          <input type="checkbox" class="edit-promo-enabled"${promoChecked}>
          Promoção ativa
        </label>
        <input type="number" step="0.01" class="admin-input edit-promo-price" placeholder="Preço promocional" value="${promoPriceVal}">
      </div>
    `;
    list.appendChild(div);
  });
}

function bindProducts() {
  const addBtn = document.getElementById('addProduct');
  if (addBtn) addBtn.onclick = async () => {
    const name = document.getElementById('prodName').value.trim();
    const price = String(document.getElementById('prodPrice').value).trim();
    const img = document.getElementById('prodImg').value.trim();
    if (!name || !price || !img) { alert('Preencha todos os campos'); return; }

    try {
      await addProduct({ name, price, img: 'assets/images/' + img });
      document.getElementById('prodName').value = '';
      document.getElementById('prodPrice').value = '';
      document.getElementById('prodImg').value = '';
      await loadAdminProducts();
      await renderProducts();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto');
    }
  };

  const removeBtn = document.getElementById('removeSelected');
  if (removeBtn) removeBtn.onclick = async () => {
    const checked = document.querySelectorAll('.remove-check:checked');
    const ids = [...checked].map(c => Number(c.dataset.id));

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

// Salvar
function bindSave() {
  const saveBtn = document.getElementById('saveAdmin');
  if (!saveBtn) return;
  saveBtn.onclick = async () => {
    // Loja
    adminData.store.name = document.getElementById('storeName').value.trim();
    adminData.store.slogan = document.getElementById('storeSlogan').value.trim();
    adminData.store.links.discordUrl = document.getElementById('discordUrl').value.trim();
    adminData.store.theme.primary = document.getElementById('themePrimary').value;
    adminData.store.theme.secondary = document.getElementById('themeSecondary').value;
    adminData.store.theme.background = document.getElementById('themeBackground').value;
    adminData.store.theme.backgroundImage = document.getElementById('themeBackgroundImage').value.trim();
    adminData.store.theme.backgroundSize = document.getElementById('themeBackgroundSize').value;
    adminData.store.theme.backgroundRepeat = document.getElementById('themeBackgroundRepeat').value;
    adminData.store.theme.backgroundPosition = document.getElementById('themeBackgroundPosition').value;

    // Atualizar produtos inline via API
    const productElements = document.querySelectorAll('#adminProductList .admin-product');
    for (let i = 0; i < productElements.length; i++) {
      const el = productElements[i];
      const id = Number(el.querySelector('.remove-check').dataset.id);
      const name = el.querySelector('.edit-name').value;
      const price = el.querySelector('.edit-price').value;
      const img = 'assets/images/' + el.querySelector('.edit-img').value;
      const promoEnabled = el.querySelector('.edit-promo-enabled').checked;
      const promoPrice = el.querySelector('.edit-promo-price').value;

      try {
        await updateProduct(id, { name, price, img, promoEnabled, promoPrice });
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
      }
    }

    // PIX
    adminData.pix.key = document.getElementById('pixKey').value.trim();
    adminData.pix.merchantName = document.getElementById('pixName').value.trim() || '.';
    adminData.pix.merchantCity = document.getElementById('pixCity').value.trim() || '.';
    adminData.pix.copyMode = document.getElementById('pixCopyMode').value;
    adminData.pix.amountMode = document.getElementById('pixAmountMode').value;

    // Conteúdo
    adminData.content.checkoutNote = document.getElementById('checkoutNote').value;
    adminData.content.successDiscordStepsHTML = document.getElementById('successSteps').value;

    // Persistir apenas configurações (produtos já salvos via API)
    persistAdminData();
    applyThemeFromStorage();
    alert('Alterações salvas. Recarregando para aplicar...');
    location.reload();
  };
}

// ===============================
// LOGIN
// ===============================
(function bindLogin(){
  const loginBtn = document.getElementById('adminLoginBtn');
  if (!loginBtn) return;
  loginBtn.onclick = async () => {
    const user = (document.getElementById('adminUsername').value || '').trim();
    const pass = (document.getElementById('adminPassword').value || '').trim();
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      // Injetar painel completo agora
      await buildPanelSections();
    } else {
      alert('Usuário ou senha inválidos');
    }
  };
})();
