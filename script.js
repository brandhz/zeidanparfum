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
   RENDERIZAÇÃO DOS CARDS (VISUAL CLÁSSICO + CARRINHO NOVO)
   ===================================================== */
function renderCards(selectedBrand, searchTerm, category) {
  if (!perfumeGrid) return;
  perfumeGrid.innerHTML = "";
  
  const term = (searchTerm || "").trim().toLowerCase();
  const catFilter = normalizeCat(category || "TODAS");

  // Carrega favoritos salvos
  const favoritos = JSON.parse(localStorage.getItem('zeidanFavoritos')) || [];

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
    
    // Filtro Inteligente (Mantive o meu porque ele acha os Árabes pela marca)
    let matchCategory = false;
    if (catFilter === "TODAS") matchCategory = true;
    else if (catFilter === "ARABE" && (catJSON === "ARABE" || brand === "LATTAFA" || brand === "AL HARAMAIN" || brand === "AFNAN" || brand === "ARMAF")) matchCategory = true;
    else if (catFilter === "DESIGNER" && (catJSON === "DESIGNER" || brand === "DIOR" || brand === "CHANEL" || brand === "YVES SAINT LAURENT" || brand === "JEAN PAUL GAULTIER" || brand === "CAROLINA HERRERA" || brand === "PACO RABANNE")) matchCategory = true;
    else if (catFilter === "NICHO" && (catJSON === "NICHO" || brand === "CREED" || brand === "PARFUMS DE MARLY" || brand === "XERJOFF" || brand === "ROJA" || brand === "AMOUAGE")) matchCategory = true;
    else if (catJSON === catFilter || genderDetected === catFilter) matchCategory = true;

    return matchBrand && matchText && matchCategory;
  });

  // Ordenação (Destaques primeiro)
  const ordenados = [...filtered.filter((p) => p.Destaque === true), ...filtered.filter((p) => p.Destaque !== true)];
  const limited = ordenados.slice(0, LIMITE_INICIAL);

  limited.forEach((p) => {
    const card = document.createElement("article");
    const catClass = normalizeCat(p.Categoria || "").toLowerCase();
    const genClass = normalizeCat(detectarGenero(p)).toLowerCase();
    card.className = `product-card ${catClass} ${genClass}`;

    let detalheHref = p.Produto ? "produto.html?id=" + encodeURIComponent(p.Produto) : null;
    
    const marcaSafe = (p.Marca || "").replace(/'/g, " ");
    const produtoSafe = (p.Produto || "").replace(/'/g, " ");
    const precoSafe = p.Preco_Venda || "";

    // Verifica Favorito
    const isFav = favoritos.includes(p.Produto);
    const heartClass = isFav ? "active" : "";
    const heartIcon = isFav ? "fa-solid fa-heart" : "fa-regular fa-heart";

    // --- HTML LIMPO (IGUAL AO QUE VOCÊ MANDOU) ---
    card.innerHTML = `
      <div class="product-image-wrap">
          <button class="wishlist-btn ${heartClass}" onclick="toggleFavorito('${produtoSafe}', this)">
             <i class="${heartIcon}"></i>
          </button>
          
          ${detalheHref ? `<a href="${detalheHref}" class="product-link">` : `<div class="product-link">`}
             ${p.Imagem ? `<img src="${p.Imagem}" alt="${p.Produto ?? ""}" class="product-image" data-full="${p.Imagem}" />` : ""}
          ${detalheHref ? `</a>` : `</div>`}
      </div>

      ${detalheHref ? `<a href="${detalheHref}" class="product-link-text">` : ``}
        <div class="product-name">${p.Produto ?? ""}</div>
        <div class="product-meta">
          <span class="product-brand">${p.Marca ?? ""}</span>
          <span class="product-price">${p.Preco_Venda ?? ""}</span>
        </div>
      ${detalheHref ? `</a>` : ``}

      <div class="product-actions">
        <button class="product-btn" onclick="window.adicionarAoCarrinho('${marcaSafe}', '${produtoSafe}', '${precoSafe}')">
          Encomende <i class="fa-solid fa-cart-plus"></i>
        </button>
      </div>
    `;
    perfumeGrid.appendChild(card);
  });
}

// Garante que o clique do coração funcione
window.toggleFavorito = function(nomeProduto, btn) {
    if(event) event.stopPropagation();
    let favoritos = JSON.parse(localStorage.getItem('zeidanFavoritos')) || [];
    const icon = btn.querySelector('i');

    if (favoritos.includes(nomeProduto)) {
        favoritos = favoritos.filter(f => f !== nomeProduto);
        btn.classList.remove('active');
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
    } else {
        favoritos.push(nomeProduto);
        btn.classList.add('active');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
    }
    localStorage.setItem('zeidanFavoritos', JSON.stringify(favoritos));
};

// === FUNÇÃO NOVA: TOGGLE FAVORITO ===
window.toggleFavorito = function(nomeProduto, btn) {
    let favoritos = JSON.parse(localStorage.getItem('zeidanFavoritos')) || [];
    const icon = btn.querySelector('i');

    if (favoritos.includes(nomeProduto)) {
        // Remove
        favoritos = favoritos.filter(f => f !== nomeProduto);
        btn.classList.remove('active');
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
    } else {
        // Adiciona
        favoritos.push(nomeProduto);
        btn.classList.add('active');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        
        // Efeito visual de pulso
        icon.style.transform = "scale(1.3)";
        setTimeout(() => icon.style.transform = "scale(1)", 200);
    }
    
    localStorage.setItem('zeidanFavoritos', JSON.stringify(favoritos));
};

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
   1. LÓGICA DO CARRINHO (SEM JANELA, SEM SUJEIRA)
   ===================================================== */
let carrinho = JSON.parse(localStorage.getItem('carrinhoZeidan')) || [];

// Função que DESENHA o carrinho (Marca + Nome)
window.atualizarCarrinhoUI = function() {
    // Salva o estado atual
    localStorage.setItem('carrinhoZeidan', JSON.stringify(carrinho));

    const container = document.getElementById('cart-items');
    const contador = document.getElementById('cart-count');
    const totalDisplay = document.getElementById('cart-total-value');

    // 1. Atualiza a Bolinha Vermelha
    if (contador) {
        contador.innerText = carrinho.length;
        contador.style.display = carrinho.length > 0 ? 'flex' : 'none';
    }

    // Se a sacola não estiver na tela (ex: outra página), para.
    if (!container) return;

    // 2. Se vazio
    if (carrinho.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px 20px; color:#888;"><i class="fa-solid fa-basket-shopping" style="font-size:40px; margin-bottom:10px; opacity:0.5;"></i><p>Sua sacola está vazia.</p></div>';
        if (totalDisplay) totalDisplay.innerText = "R$ 0,00";
        return;
    }

    // 3. Desenha os itens
    let html = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        // Correção de Preço
        let precoNumerico = 0;
        try {
            let limpo = item.preco.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            precoNumerico = parseFloat(limpo);
        } catch(e) { precoNumerico = 0; }
        
        if (!isNaN(precoNumerico)) total += precoNumerico;

        // --- AQUI ESTÁ A CORREÇÃO DO NOME ---
        // Verificamos se o item tem 'produto' ou 'nome' (para compatibilidade)
        let nomeProduto = item.produto || item.nome || "Produto sem nome";

        html += `
            <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid #eee;">
                <div style="flex:1; padding-right:10px;">
                    <div style="font-size:10px; color:#999; text-transform:uppercase; font-weight:700; margin-bottom:2px;">
                        ${item.marca}
                    </div>
                    <div style="font-weight:600; font-size:13px; color:#000; line-height:1.3;">
                        ${nomeProduto}
                    </div>
                </div>
                <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
                    <div style="font-weight:700; color:#333; font-size:14px;">${item.preco}</div>
                    <button onclick="window.removerDoCarrinho(${index})" style="color:#ff4757; background:none; border:none; font-size:11px; cursor:pointer; text-decoration:underline; padding:0;">
                        Remover
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    
    if (totalDisplay) {
        totalDisplay.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
};

// Adicionar (Silencioso)
window.adicionarAoCarrinho = function(marca, produto, preco) {
    carrinho.push({ marca: marca, produto: produto, preco: preco });
    atualizarCarrinhoUI();

    // Efeito Visual no Ícone
    const cartIcon = document.getElementById('cart-btn') || document.querySelector('.fa-cart-shopping');
    if (cartIcon) {
        cartIcon.style.transition = "transform 0.2s";
        cartIcon.style.transform = "scale(1.3)";
        setTimeout(() => cartIcon.style.transform = "scale(1)", 300);
    }
};

// Remover
window.removerDoCarrinho = function(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
};

/* =====================================================
   2. RENDERIZAÇÃO DOS CARDS (GARANTINDO O NOME CERTO)
   ===================================================== */
function renderCards(selectedBrand, searchTerm, category) {
  if (!perfumeGrid) return;
  perfumeGrid.innerHTML = "";
  
  const term = (searchTerm || "").trim().toLowerCase();
  const catFilter = normalizeCat(category || "TODAS");
  const favoritos = JSON.parse(localStorage.getItem('zeidanFavoritos')) || [];

  const filtered = perfumes.filter((p) => {
    const brand = p.Marca || "";
    const name = p.Produto || "";
    const price = (p.Preco_Venda || "").trim();
    const catJSON = normalizeCat(p.Categoria || "");
    const genderDetected = normalizeCat(detectarGenero(p)); // Assumindo que você tem essa função

    if (!price) return false;
    
    const matchBrand = selectedBrand === "TODAS" || brand === selectedBrand;
    const combined = `${name} ${brand}`.toLowerCase();
    const matchText = combined.includes(term);
    
    let matchCategory = false;
    if (catFilter === "TODAS") matchCategory = true;
    else if (catFilter === "ARABE" && (catJSON === "ARABE" || brand === "LATTAFA" || brand === "AL HARAMAIN" || brand === "AFNAN" || brand === "ARMAF")) matchCategory = true;
    else if (catFilter === "DESIGNER" && (catJSON === "DESIGNER" || brand === "DIOR" || brand === "CHANEL" || brand === "YVES SAINT LAURENT" || brand === "JEAN PAUL GAULTIER" || brand === "CAROLINA HERRERA" || brand === "PACO RABANNE")) matchCategory = true;
    else if (catFilter === "NICHO" && (catJSON === "NICHO" || brand === "CREED" || brand === "PARFUMS DE MARLY" || brand === "XERJOFF" || brand === "ROJA" || brand === "AMOUAGE")) matchCategory = true;
    else if (catJSON === catFilter || genderDetected === catFilter) matchCategory = true;

    return matchBrand && matchText && matchCategory;
  });

  const ordenados = [...filtered.filter((p) => p.Destaque === true), ...filtered.filter((p) => p.Destaque !== true)];
  const limited = ordenados.slice(0, LIMITE_INICIAL);

  limited.forEach((p) => {
    const card = document.createElement("article");
    const catClass = normalizeCat(p.Categoria || "").toLowerCase();
    // Se não tiver detectarGenero, remova o genClass
    let genClass = "";
    try { genClass = normalizeCat(detectarGenero(p)).toLowerCase(); } catch(e){}

    card.className = `product-card ${catClass} ${genClass}`;

    let detalheHref = p.Produto ? "produto.html?id=" + encodeURIComponent(p.Produto) : null;
    
    const marcaSafe = (p.Marca || "").replace(/'/g, " ");
    const produtoSafe = (p.Produto || "").replace(/'/g, " ");
    const precoSafe = p.Preco_Venda || "";
    
    const isFav = favoritos.includes(p.Produto);
    const heartClass = isFav ? "active" : "";
    const heartIcon = isFav ? "fa-solid fa-heart" : "fa-regular fa-heart";

    card.innerHTML = `
      <div class="product-image-wrap">
          <button class="wishlist-btn ${heartClass}" onclick="toggleFavorito('${produtoSafe}', this)">
             <i class="${heartIcon}"></i>
          </button>
          ${detalheHref ? `<a href="${detalheHref}" class="product-link">` : `<div class="product-link">`}
             ${p.Imagem ? `<img src="${p.Imagem}" alt="${p.Produto ?? ""}" class="product-image" data-full="${p.Imagem}" />` : ""}
          ${detalheHref ? `</a>` : `</div>`}
      </div>

      ${detalheHref ? `<a href="${detalheHref}" class="product-link-text">` : ``}
        <div class="product-name">${p.Produto ?? ""}</div>
        <div class="product-meta">
          <span class="product-brand">${p.Marca ?? ""}</span>
          <span class="product-price">${p.Preco_Venda ?? ""}</span>
        </div>
      ${detalheHref ? `</a>` : ``}

      <div class="product-actions">
        <button class="product-btn" onclick="window.adicionarAoCarrinho('${marcaSafe}', '${produtoSafe}', '${precoSafe}')">
          Encomende <i class="fa-solid fa-cart-plus"></i>
        </button>
      </div>
    `;
    perfumeGrid.appendChild(card);
  });
}

// Inicialização
document.addEventListener("DOMContentLoaded", window.atualizarCarrinhoUI);

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

