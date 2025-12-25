const perfumeGrid = document.getElementById("perfumeGrid");
const brandColumns = document.getElementById("brandColumns");
const searchInput = document.getElementById("searchInput");
const brandPanel = document.querySelector(".brand-panel");
const brandsToggle = document.getElementById("brandsToggle");
const homeLink = document.getElementById("homeLink");
const categoryButtons = document.querySelectorAll(".category-btn") || [];

// modal de imagem (só existe na vitrine)
const imageModal = document.getElementById("imageModal");
const imageModalImg = document.getElementById("imageModalImg");
const imageModalClose = document.getElementById("imageModalClose");

let perfumes = [];
let currentCategory = "TODAS";

const LIMITE_INICIAL - 30

// número global de WhatsApp
window.WHATSAPP_NUMBER = "5531991668430";

// normaliza categoria
function normalizeCat(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

// Carrega dados do data.json
async function loadPerfumes() {
  try {
    const response = await fetch("data.json");
    perfumes = await response.json();

    if (brandColumns) {
      populateBrandColumns();
    }
    if (perfumeGrid) {
      renderCards("TODAS", "", currentCategory);
    }
  } catch (error) {
    console.error("Erro ao carregar data.json:", error);
  }
}

// Lista de marcas em colunas – só com preço
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

// WhatsApp
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

// Renderiza cards na vitrine
function renderCards(selectedBrand, searchTerm, category) {
  if (!perfumeGrid) return;

  perfumeGrid.innerHTML = "";
  const term = (searchTerm || "").trim().toLowerCase();
  const cat = normalizeCat(category || "TODAS");

  const filtered = perfumes.filter((p) => {
    const brand = p.Marca || "";
    const name = p.Produto || "";
    const price = (p.Preco_Venda || "").trim();
    const catValue = normalizeCat(p.Categoria || "");

    if (!price) return false;

    const matchBrand = selectedBrand === "TODAS" || brand === selectedBrand;
    const combined = `${name} ${brand}`.toLowerCase();
    const matchText = combined.includes(term);
    const matchCategory = cat === "TODAS" || catValue === cat;

    return matchBrand && matchText && matchCategory;
  });

  // limita quantidade de cards mostrados na vitrine
  const limited = filtered.slice(0, LIMITE_INICIAL);

  filtered.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product-card";
  });  

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

    const imgEl = card.querySelector(".product-image");
    if (imgEl && imageModal && imageModalImg) {
      imgEl.addEventListener("click", () => {
        const fullSrc = imgEl.getAttribute("data-full");
        imageModalImg.src = fullSrc;
        imageModalImg.alt = imgEl.alt || "";
        openImageModal();
      });
    }

    perfumeGrid.appendChild(card);
  });
}

/* Painel de marcas */

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

// fecha se clicar fora do painel
document.addEventListener("click", (e) => {
  if (!brandPanel || !brandsToggle) return;
  const isInsidePanel = brandPanel.contains(e.target);
  const isToggle = brandsToggle.contains(e.target);
  if (!isInsidePanel && !isToggle) {
    closeBrandPanel();
  }
});

/* Botão Início – só vitrine */
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

/* Busca por texto – só vitrine */
if (searchInput && perfumeGrid) {
  searchInput.addEventListener("input", (e) => {
    renderCards("TODAS", e.target.value, currentCategory);
  });
}

/* Filtro por categoria – só vitrine */
if (categoryButtons.length && perfumeGrid) {
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.cat;
      renderCards(
        "TODAS",
        searchInput ? searchInput.value : "",
        currentCategory
      );
    });
  });
}

/* Modal de imagem – só vitrine */
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

/* Inicia */
loadPerfumes();

// Se veio de outra página pedindo para abrir o painel de marcas
if (localStorage.getItem("abrirMarcas") === "1") {
  localStorage.removeItem("abrirMarcas");
  openBrandPanel();
  const marcasSection =
    document.getElementById("marcas") || document.getElementById("produtos");
  if (marcasSection) {
    marcasSection.scrollIntoView({ behavior: "smooth" });
  }
}

// Se veio da página de produto com marca selecionada
if (perfumeGrid) {
  const marcaSelecionada = localStorage.getItem("marcaSelecionada");
  if (marcaSelecionada) {
    localStorage.removeItem("marcaSelecionada");
    renderCards(marcaSelecionada, "", currentCategory);
  }
}



