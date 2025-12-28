/* =====================================================
   CONFIGURAÇÕES GLOBAIS
   ===================================================== */
const perfumeGrid = document.getElementById("perfumeGrid");
const brandColumns = document.getElementById("brandColumns");
const searchInput = document.getElementById("searchInput");
const brandPanel = document.querySelector(".brand-panel");
const brandsToggle = document.getElementById("brandsToggle");
const homeLink = document.getElementById("homeLink");
const categoryButtons = document.querySelectorAll(".category-btn") || [];

// Modal de imagem (só existe na vitrine/index)
const imageModal = document.getElementById("imageModal");
const imageModalImg = document.getElementById("imageModalImg");
const imageModalClose = document.getElementById("imageModalClose");

let perfumes = [];
let currentCategory = "TODAS";

const LIMITE_INICIAL = 30;

// Número global de WhatsApp
window.WHATSAPP_NUMBER = "5531991668430";

/* =====================================================
   FUNÇÕES AUXILIARES
   ===================================================== */
function normalizeCat(value) {
  return (value || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function detectarGenero(produto) {
  const textoCompleto = (
    (produto.Produto || "") + " " + 
    (produto.Familia || "") + " " + 
    (produto.Descricao || "") + " " +
    (produto["Gênero"] || produto.Genero || "") 
  ).toLowerCase();

  if (textoCompleto.includes("compartilhável") || textoCompleto.includes("unissex") || textoCompleto.includes("shared") || textoCompleto.includes("unisex")) return "UNISSEX";
  if (textoCompleto.includes("feminino") || textoCompleto.includes("woman") || textoCompleto.includes("women") || textoCompleto.includes("femme") || textoCompleto.includes("donna") || textoCompleto.includes("lady") || textoCompleto.includes("girl") || textoCompleto.includes("pour elle")) return "FEMININO";
  if (textoCompleto.includes("masculino") || textoCompleto.includes("homem") || textoCompleto.includes("man") || textoCompleto.includes("men") || textoCompleto.includes("uomo") || textoCompleto.includes("homme") || textoCompleto.includes("boy") || textoCompleto.includes("pour homme")) return "MASCULINO";
  return "UNISSEX"; 
}

/* =====================================================
   CARREGAMENTO DE DADOS
   ===================================================== */
async function loadPerfumes() {
  try {
    const response = await fetch("data.json");
    perfumes = await response.json();

    if (brandColumns) populateBrandColumns();
    if (perfumeGrid) renderCards("TODAS", "", "TODAS");
  } catch (error) {
    console.error("Erro ao carregar data.json:", error);
  }
}

/* =====================================================
   RENDERIZAÇÃO (MOSTRAR CARD NA TELA)
   ===================================================== */
function renderCards(selectedBrand, searchTerm, category) {
  if (!perfumeGrid) return;
  perfumeGrid.innerHTML = "";
  const term = (searchTerm || "").trim().toLowerCase();
  const catFilter = normalizeCat(category || "TODAS");

  const filtered = perfumes.filter((p) => {
    const brand = p.Marca || "";
    const name = p.Produto || "";
    const price = (p.Preco_Venda || "").trim();
    const catJSON = normalizeCat(p.Categoria || "");
    const genderDetected = normalizeCat(detectarGenero(p));

    if (!price) return false;
    const matchBrand = selectedBrand === "TODAS" || brand === selectedBrand;
    const combined = `${name} ${brand}`.toLowerCase();
    const matchText = combined.includes(term);
    const matchCategory = (catFilter === "TODAS") || (catJSON === catFilter) || (genderDetected === catFilter);
    return matchBrand && matchText && matchCategory;
  });

  const ordenados = [...filtered.filter((p) => p.Destaque === true), ...filtered.filter((p) => p.Destaque !== true)];
  const limited = ordenados.slice(0, LIMITE_INICIAL);

  limited.forEach((p) => {
    const card = document.createElement("article");
    const catClass = normalizeCat(p.Categoria || "").toLowerCase();
    const genClass = normalizeCat(detectarGenero(p)).toLowerCase();
    card.className = `product-card ${catClass} ${genClass}`;

    let detalheHref = p.Produto ? "produto.html?id=" + encodeURIComponent(p.Produto) : null;
    
    // Tratamento de aspas para não quebrar o HTML
    const marcaSafe = (p.Marca || "").replace(/'/g, " ");
    const produtoSafe = (p.Produto || "").replace(/'/g, " ");
    const precoSafe = p.Preco_Venda || "";

    card.innerHTML = `
      ${detalheHref ? `<a href="${detalheHref}" class="product-link">` : `<div class="product-link">`}
        <div class="product-image-wrap">
          ${p.Imagem ? `<img src="${p.Imagem}" alt="${p.Produto ?? ""}" class="product-image" data-full="${p.Imagem}" />` : ""}
        </div>
        <div class="product-name">${p.Produto ?? ""}</div>
        <div class="product-meta">
          <span class="product-brand">${p.Marca ?? ""}</span>
          <span class="product-price">${p.Preco_Venda ?? ""}</span>
        </div>
      ${detalheHref ? `</a>` : `</div>`}
      <div class="product-actions">
        <button class="product-btn" onclick="adicionarAoCarrinho('${marcaSafe}', '${produtoSafe}', '${precoSafe}')">
          Encomende <i class="fa-solid fa-cart-plus"></i>
        </button>
      </div>
    `;
    perfumeGrid.appendChild(card);
  });
}

/* =====================================================
   PAINEL DE MARCAS
   ===================================================== */
function populateBrandColumns() {
  const brandsWithPrice = perfumes.filter((p) => (p.Preco_Venda || "").trim() !== "").map((p) => p.Marca || "");
  const brands = [...new Set(brandsWithPrice)].filter((b) => b && b.trim() !== "").sort((a, b) => a.localeCompare(b));
  const columns = 4;
  const perColumn = Math.ceil(brands.length / columns);
  brandColumns.innerHTML = "";

  for (let i = 0; i < columns; i++) {
    const ul = document.createElement("ul");
    const slice = brands.slice(i * perColumn, (i + 1) * perColumn);
    slice.forEach((brand) => {
      const li = document.createElement("li");
      li.textContent = brand;
      li.addEventListener("click", () => {
        if (perfumeGrid) {
          renderCards(brand, searchInput ? searchInput.value : "", currentCategory);
          const produtos = document.getElementById("produtos");
          if (produtos) produtos.scrollIntoView({ behavior: "smooth" });
        } else {
          localStorage.setItem("abrirMarcas", "0");
          localStorage.setItem("marcaSelecionada", brand);
          window.location.href = "index.html";
        }
        closeBrandPanel();
      });
      ul.appendChild(li);
    });
    brandColumns.appendChild(ul);
  }
}

if (brandsToggle && brandPanel) {
  brandsToggle.addEventListener("click", () => {
    if (brandPanel.classList.contains("open")) closeBrandPanel(); else openBrandPanel();
  });
}
function openBrandPanel() { if (brandPanel) brandPanel.classList.add("open"); }
function closeBrandPanel() { if (brandPanel) brandPanel.classList.remove("open"); }
document.addEventListener("click", (e) => {
  if (!brandPanel || !brandsToggle) return;
  if (!brandPanel.contains(e.target) && !brandsToggle.contains(e.target)) closeBrandPanel();
});

/* =====================================================
   INTERAÇÕES GERAIS
   ===================================================== */
if (homeLink && perfumeGrid) {
  homeLink.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    currentCategory = "TODAS";
    categoryButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.cat === "TODAS"));
    renderCards("TODAS", "", currentCategory);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
if (searchInput && perfumeGrid) {
  searchInput.addEventListener("input", (e) => renderCards("TODAS", e.target.value, currentCategory));
}
if (categoryButtons.length && perfumeGrid) {
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.cat;
      renderCards("TODAS", searchInput ? searchInput.value : "", currentCategory);
    });
  });
}
window.addEventListener('scroll', function() {
  const header = document.querySelector('.hero-bar');
  if (header) {
    if (window.scrollY > 50) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  }
});

/* =====================================================
   INICIALIZAÇÃO DO SITE
   ===================================================== */
loadPerfumes();

if (localStorage.getItem("abrirMarcas") === "1") {
  localStorage.removeItem("abrirMarcas");
  openBrandPanel();
  const marcasSection = document.getElementById("marcas") || document.getElementById("produtos");
  if (marcasSection) marcasSection.scrollIntoView({ behavior: "smooth" });
}
if (perfumeGrid) {
  const marcaSelecionada = localStorage.getItem("marcaSelecionada");
  if (marcaSelecionada) {
    localStorage.removeItem("marcaSelecionada");
    renderCards(marcaSelecionada, "", currentCategory);
  }
}

/* =====================================================
   LÓGICA DO CARRINHO DE COMPRAS (GLOBAL)
   ===================================================== */
let carrinho = JSON.parse(localStorage.getItem('carrinhoZeidan')) || [];

function atualizarCarrinhoUI() {
    const container = document.getElementById('cart-items');
    const contador = document.getElementById('cart-count');
    const totalDisplay = document.getElementById('cart-total-value');
    
    // Salva
    localStorage.setItem('carrinhoZeidan', JSON.stringify(carrinho));

    // Proteção: Se a sacola não existir na página (ex: página de contato), não faz nada
    if (!container) return;

    // Atualiza contador
    if (contador) contador.innerText = carrinho.length;

    if (carrinho.length === 0) {
        container.innerHTML = '<p class="empty-msg" style="text-align:center; color:#888; margin-top:50px;">Sua sacola está vazia 🛍️</p>';
        if (totalDisplay) totalDisplay.innerText = "R$ 0,00";
        return;
    }

    let html = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        let precoNumerico = 0;
        try {
            // Remove R$, pontos de milhar e troca vírgula por ponto
            let limpo = item.preco.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            precoNumerico = parseFloat(limpo);
        } catch(e) { precoNumerico = 0; }
        
        if (!isNaN(precoNumerico)) total += precoNumerico;

        html += `
            <div class="cart-item">
                <div style="flex:1;">
                    <div style="font-weight:bold; font-size:14px;">${item.produto}</div>
                    <div style="font-size:12px; color:#666;">${item.marca}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold; color:#333;">${item.preco}</div>
                    <button onclick="removerDoCarrinho(${index})" class="cart-remove-btn">Remover</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    if (totalDisplay) {
        totalDisplay.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}

// Funções Globais (com window.) para serem vistas pelo HTML
window.adicionarAoCarrinho = function(marca, produto, preco) {
    carrinho.push({ marca, produto, preco });
    atualizarCarrinhoUI();
    toggleCart(); 
};

window.removerDoCarrinho = function(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
};

window.toggleCart = function() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        atualizarCarrinhoUI();
    }
};

window.finalizarNoZap = function() {
    if (carrinho.length === 0) return alert("Sua sacola está vazia!");

    let mensagem = "Olá Zeidan! Gostaria de verificar a disponibilidade destes perfumes:\n\n";
    let totalEstimado = 0;

    carrinho.forEach(item => {
        mensagem += `▪️ *${item.produto}* (${item.marca}) - ${item.preco}\n`;
        try {
            let limpo = item.preco.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            let valor = parseFloat(limpo);
            if(!isNaN(valor)) totalEstimado += valor;
        } catch(e){}
    });

    mensagem += `\n💰 *Total Estimado:* ${totalEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    mensagem += `\n\nAguardo a confirmação e o link de pagamento!`;

    let telefone = "5531991668430"; 
    let url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
};

// Inicializa carrinho assim que o HTML carregar
document.addEventListener("DOMContentLoaded", atualizarCarrinhoUI);