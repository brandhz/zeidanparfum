const NUMERO_ZAP = "5531991668430"; // mesmo do Streamlit
const grid = document.getElementById("grid");
const brandSelect = document.getElementById("brandSelect");

// lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxPrice = document.getElementById("lightboxPrice");
const lightboxZap = document.getElementById("lightboxZap");
const closeLightbox = document.getElementById("closeLightbox");

let produtos = [];

async function carregaDados() {
  const resp = await fetch("data.json");
  produtos = await resp.json();
  populaMarcas();
  renderGrid();
}

function populaMarcas() {
  const marcas = Array.from(new Set(produtos.map(p => p.marca))).sort();
  marcas.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    brandSelect.appendChild(opt);
  });
}

function renderGrid() {
  const marca = brandSelect.value;
  grid.innerHTML = "";

  const filtrados = marca === "TODAS"
    ? produtos
    : produtos.filter(p => p.marca === marca);

  filtrados.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${p.imagem}" alt="${p.nome}">
      </div>
      <div class="card-title">${p.nome}</div>
      <div class="card-price">R$ ${p.preco}</div>
      <a href="${montaLinkZap(p)}" target="_blank" class="zap-btn">
        💎 Encomendar
      </a>
    `;

    // clique na imagem abre lightbox com blur
    card.querySelector("img").addEventListener("click", e => {
      e.preventDefault();
      abreLightbox(p);
    });

    grid.appendChild(card);
  });
}

function montaLinkZap(p) {
  const msg = `Olá! Gostaria de encomendar o perfume *${p.nome}* (R$ ${p.preco}).`;
  const encoded = encodeURIComponent(msg);
  const num = NUMERO_ZAP.replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encoded}`;
}

function abreLightbox(p) {
  lightboxImg.src = p.imagem;
  lightboxTitle.textContent = p.nome;
  lightboxPrice.textContent = `R$ ${p.preco}`;
  lightboxZap.href = montaLinkZap(p);
  lightbox.classList.remove("hidden");
}

function fechaLightbox() {
  lightbox.classList.add("hidden");
}

brandSelect.addEventListener("change", renderGrid);
closeLightbox.addEventListener("click", fechaLightbox);
lightbox.addEventListener("click", e => {
  if (e.target === lightbox || e.target === document.querySelector(".lightbox-backdrop")) {
    fechaLightbox();
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") fechaLightbox();
});

carregaDados().catch(console.error);
