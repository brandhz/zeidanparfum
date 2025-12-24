const perfumeGrid = document.getElementById("perfumeGrid");
const brandColumns = document.getElementById("brandColumns");
const searchInput = document.getElementById("searchInput");
const brandPanel = document.querySelector(".brand-panel");
const brandsToggle = document.getElementById("brandsToggle");
const homeLink = document.getElementById("homeLink");

let perfumes = [];

// Seu número de WhatsApp
const WHATSAPP_NUMBER = "5531991668430";

// Carrega dados do data.json
async function loadPerfumes() {
  try {
    const response = await fetch("data.json");
    perfumes = await response.json();

    populateBrandColumns();
    renderCards("TODAS", "");
  } catch (error) {
    console.error("Erro ao carregar data.json:", error);
  }
}

// Lista de marcas em colunas – só marcas com ao menos um perfume com preço
function populateBrandColumns() {
  const brandsWithPrice = perfumes
    .filter((p) => (p.Preco_Venda || "").trim() !== "")
    .map((p) => p.Marca || "");

  const brands = [...new Set(brandsWithPrice)]
    .filter((b) => b && b.trim() !== "")
    .sort((a, b) => a.localeCompare(b));

  const columns = 4;
  const perColumn = Math.ceil(brands.length / columns);

  for (let i = 0; i < columns; i++) {
    const ul = document.createElement("ul");
    const slice = brands.slice(i * perColumn, (i + 1) * perColumn);

    slice.forEach((brand) => {
      const li = document.createElement("li");
      li.textContent = brand;
      li.addEventListener("click", () => {
        renderCards(brand, searchInput.value);
        closeBrandPanel();
        document
          .getElementById("produtos")
          .scrollIntoView({ behavior: "smooth" });
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
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMsg}`;
}

// Renderiza cards (só com preço)
function renderCards(selectedBrand, searchTerm) {
  perfumeGrid.innerHTML = "";
  const term = (searchTerm || "").trim().toLowerCase();

  const filtered = perfumes.filter((p) => {
    const brand = p.Marca || "";
    const name = p.Produto || "";
    const price = (p.Preco_Venda || "").trim();
    if (!price) return false;

    const matchBrand =
      selectedBrand === "TODAS" || brand === selectedBrand;

    const combined = `${name} ${brand}`.toLowerCase();
    const matchText = combined.includes(term);

    return matchBrand && matchText;
  });

  filtered.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const whatsappLink = buildWhatsAppLink(p);

    card.innerHTML = `
      <div class="product-image-wrap">
        ${
          p.Imagem
            ? `<img src="${p.Imagem}" alt="${p.Produto ?? ""}" class="product-image" />`
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

      <div class="product-actions">
        <a class="product-btn" href="${whatsappLink}" target="_blank" rel="noopener noreferrer">
          Encomende
        </a>
      </div>
    `;

    perfumeGrid.appendChild(card);
  });
}

/* Controle do painel de marcas */

brandsToggle.addEventListener("click", () => {
  const isOpen = brandPanel.classList.contains("open");
  if (isOpen) {
    closeBrandPanel();
  } else {
    openBrandPanel();
  }
});

function openBrandPanel() {
  brandPanel.classList.add("open");
}

function closeBrandPanel() {
  brandPanel.classList.remove("open");
}

// fecha se clicar fora do painel
document.addEventListener("click", (e) => {
  const isInsidePanel = brandPanel.contains(e.target);
  const isToggle = brandsToggle.contains(e.target);
  if (!isInsidePanel && !isToggle) {
    closeBrandPanel();
  }
});

/* Início – volta para todos os perfumes */
homeLink.addEventListener("click", () => {
  searchInput.value = "";
  renderCards("TODAS", "");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Busca por texto
searchInput.addEventListener("input", (e) => {
  renderCards("TODAS", e.target.value);
});

// Inicia
loadPerfumes();
