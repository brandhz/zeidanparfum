const brandSelect = document.getElementById("brandSelect");
const perfumeGrid = document.getElementById("perfumeGrid");
const brandColumns = document.getElementById("brandColumns");
const searchInput = document.getElementById("searchInput");

let perfumes = [];

// Carrega dados do data.json (array com Marca, Produto, Preco_Venda, Imagem)
async function loadPerfumes() {
  try {
    const response = await fetch("data.json");
    perfumes = await response.json();

    populateBrandSelect();
    populateBrandColumns();
    renderCards("TODAS", "");
  } catch (error) {
    console.error("Erro ao carregar data.json:", error);
  }
}

// Preenche o select de marcas
function populateBrandSelect() {
  const brands = ["TODAS", ...new Set(perfumes.map((p) => p.Marca || ""))];

  brands
    .filter((b) => b && b.trim() !== "")
    .sort((a, b) => a.localeCompare(b))
    .forEach((brand) => {
      const opt = document.createElement("option");
      opt.value = brand;
      opt.textContent = brand;
      brandSelect.appendChild(opt);
    });
}

// Lista de marcas em colunas clicáveis
function populateBrandColumns() {
  const brands = [...new Set(perfumes.map((p) => p.Marca || ""))]
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
        brandSelect.value = brand;
        renderCards(brand, searchInput.value);
        document
          .getElementById("produtos")
          .scrollIntoView({ behavior: "smooth" });
      });
      ul.appendChild(li);
    });

    brandColumns.appendChild(ul);
  }
}

// Renderiza cards usando marca + texto de busca
// e IGNORA perfumes sem Preco_Venda preenchido
function renderCards(selectedBrand, searchTerm) {
  perfumeGrid.innerHTML = "";
  const term = searchTerm.trim().toLowerCase();

  const filtered = perfumes.filter((p) => {
    const brand = p.Marca || "";
    const name = p.Produto || "";
    const price = (p.Preco_Venda || "").trim();

    // Só entra se tiver preço
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
        <button class="product-btn" type="button">
          Ver mais
        </button>
      </div>
    `;

    perfumeGrid.appendChild(card);
  });
}

// Eventos
brandSelect.addEventListener("change", (e) => {
  renderCards(e.target.value, searchInput.value);
});

searchInput.addEventListener("input", (e) => {
  renderCards(brandSelect.value, e.target.value);
});

// Inicia
loadPerfumes();
