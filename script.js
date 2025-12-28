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

// Modal de imagem (só existe na vitrine)
const imageModal = document.getElementById("imageModal");
const imageModalImg = document.getElementById("imageModalImg");
const imageModalClose = document.getElementById("imageModalClose");

let perfumes = [];
let currentCategory = "TODAS";

const LIMITE_INICIAL = 30;

// Número global de WhatsApp (somente números, com código do país)
window.WHATSAPP_NUMBER = "5531991668430";

/* =====================================================
   FUNÇÕES AUXILIARES
   ===================================================== */

// Normaliza texto (tira acentos e põe em maiúsculo)
function normalizeCat(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

// WhatsApp Link Builder
function buildWhatsAppLink(perfume) {
  const nome = perfume.Produto || "";
  const marca = perfume.Marca || "";
  const preco = perfume.Preco_Venda || "";

  const msg = `Olá, quero encomendar o perfume:
${nome} - ${marca}
Preço: ${preco}`;

  const encodedMsg = encodeURIComponent(msg);
  return `https://wa.me/${window.WHATSAPP_NUMBER}?text=${encodedMsg}`;
}

/* =====================================================
   LÓGICA DE GÊNERO AUTOMÁTICA (INTELIGÊNCIA ARTIFICIAL)
   ===================================================== */
function detectarGenero(produto) {
  // Pega todo o texto disponível do produto
  // Usa notação de colchetes ["Gênero"] para evitar erro com acentos
  const textoCompleto = (
    (produto.Produto || "") + " " + 
    (produto.Familia || "") + " " + 
    (produto.Descricao || "") + " " +
    (produto["Gênero"] || produto.Genero || "") 
  ).toLowerCase();

  // 1. Verifica se é Unissex / Compartilhável
  if (
    textoCompleto.includes("compartilhável") || 
    textoCompleto.includes("unissex") || 
    textoCompleto.includes("shared") ||
    textoCompleto.includes("unisex")
  ) {
    return "UNISSEX";
  }

  // 2. Verifica se é Feminino
  if (
    textoCompleto.includes("feminino") || 
    textoCompleto.includes("woman") || 
    textoCompleto.includes("women") || 
    textoCompleto.includes("femme") || 
    textoCompleto.includes("donna") || 
    textoCompleto.includes("lady") ||
    textoCompleto.includes("girl") ||
    textoCompleto.includes("pour elle")
  ) {
    return "FEMININO";
  }

  // 3. Verifica se é Masculino
  if (
    textoCompleto.includes("masculino") || 
    textoCompleto.includes("homem") || 
    textoCompleto.includes("man") || 
    textoCompleto.includes("men") || 
    textoCompleto.includes("uomo") || 
    textoCompleto.includes("homme") ||
    textoCompleto.includes("boy") ||
    textoCompleto.includes("pour homme")
  ) {
    return "MASCULINO";
  }

  // Padrão se não achar nada
  return "UNISSEX"; 
}

/* =====================================================
   CARREGAMENTO DE DADOS
   ===================================================== */
async function loadPerfumes() {
  try {
    const response = await fetch("data.json");
    perfumes = await response.json();

    if (brandColumns) {
      populateBrandColumns();
    }
    if (perfumeGrid) {
      // Inicia mostrando TODOS
      renderCards("TODAS", "", "TODAS");
    }
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
  
  // Categoria selecionada no botão (ex: MASCULINO, ARABE, TODAS)
  const catFilter = normalizeCat(category || "TODAS");

  const filtered = perfumes.filter((p) => {
    const brand = p.Marca || "";
    const name = p.Produto || "";
    const price = (p.Preco_Venda || "").trim();
    
    // Categoria do JSON (ex: Árabe, Designer)
    const catJSON = normalizeCat(p.Categoria || "");
    
    // Gênero Detectado Automaticamente
    const genderDetected = normalizeCat(detectarGenero(p));

    if (!price) return false;

    // LÓGICA DE FILTRO:
    const matchBrand = selectedBrand === "TODAS" || brand === selectedBrand;
    
    const combined = `${name} ${brand}`.toLowerCase();
    const matchText = combined.includes(term);

    // O produto passa se:
    // 1. O filtro for TODAS
    // 2. A categoria do JSON bater (ex: cliquei em Árabe e ele é Árabe)
    // 3. O gênero bater (ex: cliquei em Masculino e ele tem "Man" no nome)
    const matchCategory = (catFilter === "TODAS") || 
                          (catJSON === catFilter) || 
                          (genderDetected === catFilter);

    return matchBrand && matchText && matchCategory;
  });

  // Ordenação: Destaques primeiro
  const destacados = filtered.filter((p) => p.Destaque === true);
  const comuns = filtered.filter((p) => p.Destaque !== true);
  const ordenados = [...destacados, ...comuns];

  // Limite de cards (paginação simples)
  const limited = ordenados.slice(0, LIMITE_INICIAL);

  // Criação do HTML
  limited.forEach((p) => {
    const card = document.createElement("article");
    
    // Define classes para CSS
    const catClass = normalizeCat(p.Categoria || "").toLowerCase();
    const genClass = normalizeCat(detectarGenero(p)).toLowerCase();
    card.className = `product-card ${catClass} ${genClass}`;

    const whatsappLink = buildWhatsAppLink(p);

    let detalheHref = null;
    if (p.Produto) {
      detalheHref = "produto.html?id=" + encodeURIComponent(p.Produto);
    }

    card.innerHTML = `
      ${detalheHref ? `<a href="${detalheHref}" class="product-link">` : `<div class="product-link">`}
        <div class="product-image-wrap">
          ${
            p.Imagem
              ? `<img src="${p.Imagem}" alt="${p.Produto ?? ""}" class="product-image" data-full="${p.Imagem}" />`
              : ""
          }
        </div>

        <div class="product-name">
          ${p.Produto ?? ""}
        </div>

        <div class="product-meta">
          <span class="product-brand">
            ${p.Marca ?? ""}
          </span>
          <span class="product-price">
            ${p.Preco_Venda ?? ""}
          </span>
        </div>
      ${detalheHref ? `</a>` : `</div>`}

      <div class="product-actions">
        <a class="product-btn" href="${whatsappLink}" target="_blank" rel="noopener noreferrer">
          Encomende
        </a>
      </div>
    `;

    perfumeGrid.appendChild(card);
  });
}

/* =====================================================
   PAINEL DE MARCAS
   ===================================================== */
function populateBrandColumns() {
  const brandsWithPrice = perfumes
    .filter((p) => (p.Preco_Venda || "").trim() !== "")
    .map((p) => p.Marca || "");

  const brands = [...new Set(brandsWithPrice)]
    .filter((b) => b && b.trim() !== "")
    .sort((a, b) => a.localeCompare(b));

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
          renderCards(
            brand,
            searchInput ? searchInput.value : "",
            currentCategory
          );
          const produtos = document.getElementById("produtos");
          if (produtos) {
            produtos.scrollIntoView({ behavior: "smooth" });
          }
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
    const isOpen = brandPanel.classList.contains("open");
    if (isOpen) {
      closeBrandPanel();
    } else {
      openBrandPanel();
    }
  });
}

function openBrandPanel() {
  if (brandPanel) {
    brandPanel.classList.add("open");
  }
}

function closeBrandPanel() {
  if (brandPanel) {
    brandPanel.classList.remove("open");
  }
}

// Fecha painel ao clicar fora
document.addEventListener("click", (e) => {
  if (!brandPanel || !brandsToggle) return;
  const isInsidePanel = brandPanel.contains(e.target);
  const isToggle = brandsToggle.contains(e.target);
  if (!isInsidePanel && !isToggle) {
    closeBrandPanel();
  }
});

/* =====================================================
   EVENTOS E INTERAÇÕES
   ===================================================== */

/* Botão Início */
if (homeLink && perfumeGrid) {
  homeLink.addEventListener("click", () => {
    if (!perfumeGrid) return;
    if (searchInput) {
      searchInput.value = "";
    }
    currentCategory = "TODAS";
    categoryButtons.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.cat === "TODAS")
    );
    renderCards("TODAS", "", currentCategory);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* Busca por texto */
if (searchInput && perfumeGrid) {
  searchInput.addEventListener("input", (e) => {
    renderCards("TODAS", e.target.value, currentCategory);
  });
}

/* Filtro por categoria (Botões) */
if (categoryButtons.length && perfumeGrid) {
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Atualiza categoria global e renderiza
      currentCategory = btn.dataset.cat;
      renderCards(
        "TODAS",
        searchInput ? searchInput.value : "",
        currentCategory
      );
    });
  });
}

/* Modal de imagem */
function openImageModal() {
  if (!imageModal) return;
  imageModal.classList.add("open");
}

function closeImageModal() {
  if (!imageModal || !imageModalImg) return;
  imageModal.classList.remove("open");
  imageModalImg.src = "";
}

if (imageModalClose) {
  imageModalClose.addEventListener("click", closeImageModal);
}

if (imageModal) {
  imageModal.addEventListener("click", (e) => {
    if (
      e.target === imageModal ||
      e.target.classList.contains("image-modal-backdrop")
    ) {
      closeImageModal();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && imageModal && imageModal.classList.contains("open")) {
    closeImageModal();
  }
});

/* Efeito Blur na Barra ao Rolar */
window.addEventListener('scroll', function() {
  const header = document.querySelector('.hero-bar');
  if (!header) return; // Segurança

  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */
loadPerfumes();

// Verifica localStorage (se veio de outra página)
if (localStorage.getItem("abrirMarcas") === "1") {
  localStorage.removeItem("abrirMarcas");
  openBrandPanel();
  const marcasSection = document.getElementById("marcas") || document.getElementById("produtos");
  if (marcasSection) {
    marcasSection.scrollIntoView({ behavior: "smooth" });
  }
}

if (perfumeGrid) {
  const marcaSelecionada = localStorage.getItem("marcaSelecionada");
  if (marcaSelecionada) {
    localStorage.removeItem("marcaSelecionada");
    renderCards(marcaSelecionada, "", currentCategory);
  }
}