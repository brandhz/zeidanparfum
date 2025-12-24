const NUMERO_ZAP = "5531991668430"; // seu WhatsApp

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRddZ9ds8qVPuzf7NzxRhq0wUzcAUwQ0vJbGMX5He9TDxPFm4hCjF7lEPbOeaT6u31zhRsSFNi2HqVH/pub?gid=1902824264&single=true&output=csv";

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

// ------------------ CARREGAR DADOS DA PLANILHA (CSV) ------------------
async function carregaDados() {
  const resp = await fetch(CSV_URL);
  const csvText = await resp.text();

  const linhas = csvText.trim().split("\n");
  const cabecalho = linhas[0].split(",");

  const idxMarca = cabecalho.indexOf("Marca");
  const idxProduto = cabecalho.indexOf("Produto");
  const idxPreco = cabecalho.indexOf("Preco_Venda");
  const idxImagem = cabecalho.indexOf("Imagem");

  produtos = linhas.slice(1).map(linha => {
    const cols = linha.split(",");

    const marca = cols[idxMarca] || "";
    const nome = cols[idxProduto] || "";
    const bruto = cols[idxPreco] || "";
    const precoLimpo = bruto.replace("R$", "").trim();
    const imagem = cols[idxImagem] || "";

    return {
      marca,
      nome,
      preco: precoLimpo,
      imagem
    };
  })
  // mantém só linhas com nome e preço preenchido
  .filter(p => p.nome && p.preco);

  populaMarcas();
  renderGrid();
}

// ------------------ POPULAR SELECT DE MARCAS ------------------
function populaMarcas() {
  const marcas = Array.from(new Set(produtos.map(p => p.marca))).sort();
  marcas.forEach(m => {
    if (!m) return;
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    brandSelect.appendChild(opt);
  });
}

// ------------------ RENDERIZAR GRID ------------------
function renderGrid() {
  const marca = brandSelect.value;
  grid.innerHTML = "";

  const filtrados = marca === "TODAS"
    ? produtos
    : produtos.filter(p => p.marca === marca);

  filtrados.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    const imgSrc = p.imagem && p.imagem.startsWith("http")
      ? p.imagem
      : "https://cdn-icons-png.flaticon.com/512/3050/3050253.png";

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${imgSrc}" alt="${p.nome}">
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
      abreLightbox(p, imgSrc);
    });

    grid.appendChild(card);
  });
}

// ------------------ WHATSAPP ------------------
function montaLinkZap(p) {
  const msg = `Olá! Gostaria de encomendar o perfume *${p.nome}* (R$ ${p.preco}).`;
  const encoded = encodeURIComponent(msg);
  const num = NUMERO_ZAP.replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encoded}`;
}

// ------------------ LIGHTBOX COM BLUR ------------------
function abreLightbox(p, imgSrc) {
  lightboxImg.src = imgSrc;
  lightboxTitle.textContent = p.nome;
  lightboxPrice.textContent = `R$ ${p.preco}`;
  lightboxZap.href = montaLinkZap(p);
  lightbox.classList.remove("hidden");
}

function fechaLightbox() {
  lightbox.classList.add("hidden");
}

// eventos do lightbox
closeLightbox.addEventListener("click", fechaLightbox);
lightbox.addEventListener("click", e => {
  if (e.target === lightbox || e.target.classList.contains("lightbox-backdrop")) {
    fechaLightbox();
  }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") fechaLightbox();
});

// mudança de marca
brandSelect.addEventListener("change", renderGrid);

// inicialização
carregaDados().catch(console.error);
