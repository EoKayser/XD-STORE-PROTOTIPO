// ===============================
// CONFIG
// ===============================
const ADMIN_PASSWORD = "1234";

// ===============================
// INJETAR HTML
// ===============================
if (!document.getElementById("adminOverlay")) {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="admin-overlay" id="adminOverlay">
      <div class="admin-modal">

        <div id="adminLogin">
          <h2>Administração</h2>
          <input type="password" id="adminPassword" placeholder="Senha">
          <button id="adminLoginBtn">Entrar</button>
        </div>

        <div id="adminPanel" class="hidden">

          <button class="admin-toggle">🏪 Loja</button>
          <div class="admin-content hidden">
            <input id="storeName" placeholder="Nome da loja">
          </div>

          <button class="admin-toggle">📦 Produtos</button>
          <div class="admin-content hidden">
            <input id="prodName" placeholder="Nome do produto">
            <input id="prodPrice" placeholder="Preço">
            <input id="prodImg" placeholder="imagem.jpg">
            <small>assets/images/ será usado automaticamente</small>
            <button id="addProduct">Adicionar Produto</button>

            <div id="adminProductList"></div>
            <button id="removeSelected" style="background:#ff5555;margin-top:10px">
              Remover selecionados
            </button>
          </div>

          <button id="saveAdmin">💾 Salvar alterações</button>
          <button id="closeAdmin" style="margin-top:10px;background:#ff5555">Fechar</button>

        </div>

      </div>
    </div>
  `);
}

// ===============================
// ELEMENTOS
// ===============================
const overlay = document.getElementById("adminOverlay");
const loginBox = document.getElementById("adminLogin");
const panelBox = document.getElementById("adminPanel");

// ===============================
// DADOS
// ===============================
let adminData = JSON.parse(localStorage.getItem("adminData")) || {
  store: { name: "XD Store" },
  products: JSON.parse(localStorage.getItem("products")) || []
};

// ===============================
// LOGIN
// ===============================
document.getElementById("adminLoginBtn").onclick = () => {
  const pass = document.getElementById("adminPassword").value;

  if (pass === ADMIN_PASSWORD) {
    loginBox.classList.add("hidden");
    panelBox.classList.remove("hidden");
    loadAdmin();
  } else {
    alert("Senha incorreta");
  }
};

// ===============================
// ABRIR (CTRL + M)
// ===============================
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key.toLowerCase() === "m") {
    e.preventDefault();
    overlay.classList.add("active");
    loginBox.classList.remove("hidden");
    panelBox.classList.add("hidden");
    document.getElementById("adminPassword").value = "";
  }
});

// ===============================
// FECHAR
// ===============================
document.getElementById("closeAdmin").onclick = () => {
  overlay.classList.remove("active");
  panelBox.classList.add("hidden");
  loginBox.classList.remove("hidden");
};

// ===============================
// ACCORDION
// ===============================
document.querySelectorAll(".admin-toggle").forEach(btn => {
  btn.onclick = () => {
    btn.nextElementSibling.classList.toggle("hidden");
  };
});

// ===============================
// LOAD
// ===============================
function loadAdmin() {
  document.getElementById("storeName").value = adminData.store.name;
  renderAdminProducts();
}

// ===============================
// ADICIONAR PRODUTO
// ===============================
document.getElementById("addProduct").onclick = () => {
  const name = prodName.value.trim();
  const price = prodPrice.value.trim();
  const img = prodImg.value.trim();

  if (!name || !price || !img) {
    alert("Preencha todos os campos");
    return;
  }

  adminData.products.push({
    id: Date.now(),
    name,
    price,
    img: "assets/images/" + img
  });

  prodName.value = "";
  prodPrice.value = "";
  prodImg.value = "";

  renderAdminProducts();
};

// ===============================
// RENDER PRODUTOS
// ===============================
function renderAdminProducts() {
  const list = document.getElementById("adminProductList");
  list.innerHTML = "";

  adminData.products.forEach(p => {
    const div = document.createElement("div");
    div.className = "admin-product";
    div.innerHTML = `
      <input type="checkbox" class="remove-check" data-id="${p.id}">
      <input type="text" class="edit-name" value="${p.name}">
      <input type="text" class="edit-price" value="${p.price}">
      <input type="text" class="edit-img" value="${p.img.replace("assets/images/","")}">
    `;
    list.appendChild(div);
  });
}

// ===============================
// REMOVER SELECIONADOS
// ===============================
document.getElementById("removeSelected").onclick = () => {
  const checked = document.querySelectorAll(".remove-check:checked");
  const ids = [...checked].map(c => Number(c.dataset.id));

  adminData.products = adminData.products.filter(p => !ids.includes(p.id));
  renderAdminProducts();
};

// ===============================
// SALVAR
// ===============================
document.getElementById("saveAdmin").onclick = () => {
  adminData.store.name = document.getElementById("storeName").value;

  document.querySelectorAll(".admin-product").forEach((el, i) => {
    adminData.products[i].name = el.querySelector(".edit-name").value;
    adminData.products[i].price = el.querySelector(".edit-price").value;
    adminData.products[i].img =
      "assets/images/" + el.querySelector(".edit-img").value;
  });

  localStorage.setItem("adminData", JSON.stringify(adminData));
  localStorage.setItem("products", JSON.stringify(adminData.products));

  location.reload();
};
