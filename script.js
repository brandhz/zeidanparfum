const brandSelect = document.getElementById("brandSelect");
const perfumeGrid = document.getElementById("perfumeGrid");
let perfumes = [];

// Carrega dados do data.json
async function loadPerfumes() {
  try {
    const response = await fetch("data.json");
    perfumes = await response.json();

    populateBrandSelect();
    renderCards("TODAS");
  } catch (error) {
    console.error("Erro ao carregar data.json:", error);
  }
}

// Preenche o select com as marcas (campo "Marca")
function populateBrandSelect() {
  const brands = [
    "TODAS",
    ...new Set(perfumes.map((p) => p.Marca)),
  ];

  brands.forEach((brand) => {
    const opt = document.createElement("option");
    opt.value = brand;
    opt.textContent = brand;
    brandSelect.appendChild(opt);
  });
}

// Renderiza os cards conforme a marca selecionada
function renderCards(selectedBrand) {
  perfumeGrid.innerHTML = "";

  const filtered =
    selectedBrand === "TODAS"
      ? perfumes
      : perfumes.filter(
          (p) => p.Marca === selectedBrand
        );

  filtered.forEach((p) => {
    const card = document.createElement("article");
    card.className = "perfume-card";

    card.innerHTML = `
      <div class="perfume-header">
        <div class="perfume-name">
          ${p.Produto ?? ""}
        </div>
        <div class="perfume-brand">
          ${p.Marca ?? ""}
        </div>
      </div>

      <div class="perfume-info">
        ${
          p.ID
            ? `<span class="perfume-tag">ID ${p.ID}</span>`
            : ""
        }
        ${
          p.Preco_Venda
            ? `<span>${p.Preco_Venda}</span>`
            : ""
        }
      </div>

      ${
        p.Imagem
          ? `<p class="perfume-notes">${p.Imagem}</p>`
          : ""
      }
    `;

    perfumeGrid.appendChild(card);
  });
}

// Troca de opção no select
brandSelect.addEventListener("change", (e) => {
  renderCards(e.target.value);
});

// Inicia
loadPerfumes();
