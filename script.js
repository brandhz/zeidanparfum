const brandSelect = document.getElementById("brandSelect");
const perfumeGrid = document.getElementById("perfumeGrid");
let perfumes = [];

// Busca o JSON na raiz (data.json)
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

// Preenche o select com marcas únicas
function populateBrandSelect() {
  const brands = [
    "TODAS",
    ...new Set(perfumes.map((p) => p.marca)),
  ];

  brands.forEach((brand) => {
    const opt = document.createElement("option");
    opt.value = brand;
    opt.textContent = brand;
    brandSelect.appendChild(opt);
  });
}

// Renderiza os cards conforme a marca
function renderCards(selectedBrand) {
  perfumeGrid.innerHTML = "";

  const filtered =
    selectedBrand === "TODAS"
      ? perfumes
      : perfumes.filter(
          (p) => p.marca === selectedBrand
        );

  filtered.forEach((p) => {
    const card = document.createElement("article");
    card.className = "perfume-card";

    card.innerHTML = `
      <div class="perfume-header">
        <div class="perfume-name">${p.nome}</div>
        <div class="perfume-brand">${p.marca}</div>
      </div>

      <div class="perfume-info">
        ${
          p.tipo
            ? `<span class="perfume-tag">${p.tipo}</span>`
            : ""
        }
        ${
          p.genero
            ? `<span class="perfume-tag">${p.genero}</span>`
            : ""
        }
        ${
          p.concentracao
            ? `<span>${p.concentracao}</span>`
            : ""
        }
        ${
          p.ano
            ? `<span>${p.ano}</span>`
            : ""
        }
      </div>

      ${
        p.notas
          ? `<p class="perfume-notes">${p.notas}</p>`
          : ""
      }
    `;

    perfumeGrid.appendChild(card);
  });
}

// Troca de marca no select
brandSelect.addEventListener("change", (e) => {
  renderCards(e.target.value);
});

// Inicia
loadPerfumes();
