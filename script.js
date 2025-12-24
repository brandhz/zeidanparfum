const NUMERO_ZAP = "5531991668430"; // seu WhatsApp

// URL base da planilha (usando gviz para trazer JSON)
const GVIZ_URL = "https://docs.google.com/spreadsheets/d/1q5pgZ3OEpJhFjdbZ19xp1k2dUWzXhPL16SRMZnWaV-k/gviz/tq?sheet=Produtos";

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

// ------------------ CARREGAR DADOS DA PLANILHA (GVIZ JSON) ------------------
async function carregaDados() {
  const resp = await fetch(GVIZ_URL);
  const text = await resp.text();

  // resposta vem como "/*O_o*/\ngoogle.visualization.Query.setResponse(...);"
  const jsonStr = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const data = JSON.parse(jsonStr);

  const cols = data.table.cols.map(c => c.label);
  const rows = data.table.rows;

  const idxMarca = cols.indexOf("Marca");
  const idxProduto = cols.indexOf("Produto");
  const idxPreco = cols.indexOf("Preco_Venda");
  const idxImagem = cols.indexOf("Imagem");

  produtos = rows.map(r => {
    const c = r.c;

    const marca = c[idxMarca]?.v || "";
    const nome = c[idxProduto]?.v || "";
    const bruto = c[idxPreco]?.v || "";
    const precoLimpo = String(bruto).replace("R$", "").trim();
    const imagem = c[idxImagem]?.v || "";

    return {
      marca,
      nome,
      preco: precoLimpo,
      imagem
    };
  }).filter(p => p.nome && p.preco); // some produtos sem preço

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
