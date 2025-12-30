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

let perfumes = [];
let currentCategory = "TODAS";
const LIMITE_INICIAL = 30;
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

  if (textoCompleto.includes("compartilhável") || textoCompleto.includes("unissex") || textoCompleto.includes("shared")) return "UNISSEX";
  if (textoCompleto.includes("feminino") || textoCompleto.includes("woman") || textoCompleto.includes("femme") || textoCompleto.includes("pour elle")) return "FEMININO";
  if (textoCompleto.includes("masculino") || textoCompleto.includes("homem") || textoCompleto.includes("homme") || textoCompleto.includes("pour homme")) return "MASCULINO";
  return "UNISSEX"; 
}

/* =====================================================
   LÓGICA DO CARRINHO (COM ANIMAÇÃO NO BOTÃO)
   ===================================================== */
let carrinho = JSON.parse(localStorage.getItem('carrinhoZeidan')) || [];

// 1. Atualiza visual da sacola
window.atualizarCarrinhoUI = function() {
    localStorage.setItem('carrinhoZeidan', JSON.stringify(carrinho));

    const container = document.getElementById('cart-items');
    const contador = document.getElementById('cart-count');
    const totalDisplay = document.getElementById('cart-total-value');

    // Bolinha Vermelha
    if (contador) {
        contador.innerText = carrinho.length;
        contador.style.display = carrinho.length > 0 ? 'flex' : 'none';
    }

    if (!container) return;

    if (carrinho.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px 20px; color:#888;"><i class="fa-solid fa-basket-shopping" style="font-size:40px; margin-bottom:10px; opacity:0.5;"></i><p>Sua sacola está vazia.</p></div>';
        if (totalDisplay) totalDisplay.innerText = "R$ 0,00";
        return;
    }

    let html = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        let precoNumerico = 0;
        try {
            let limpo = item.preco.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
            precoNumerico = parseFloat(limpo);
        } catch(e) { precoNumerico = 0; }
        
        if (!isNaN(precoNumerico)) total += precoNumerico;

        let nomeExibicao = item.produto || item.nome || "Produto";

        html += `
            <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid #eee;">
                <div style="flex:1; padding-right:10px;">
                    <div style="font-size:10px; color:#999; text-transform:uppercase; font-weight:700; margin-bottom:2px;">
                        ${item.marca}
                    </div>
                    <div style="font-weight:600; font-size:13px; color:#000; line-height:1.3;">
                        ${nomeExibicao}
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
    if (totalDisplay) totalDisplay.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// 2. Adicionar ao Carrinho (Com Efeito Visual)
window.adicionarAoCarrinho = function(marca, produto, preco, botao) {
    // Adiciona
    carrinho.push({ marca, produto, preco });
    atualizarCarrinhoUI();

    // Animação Ícone Carrinho (Pulsar)
    const cartIcon = document.querySelector('.cart-floating-btn i') || document.getElementById('cart-btn');
    if (cartIcon) {
        cartIcon.style.transition = "transform 0.2s, color 0.2s";
        cartIcon.style.transform = "scale(1.4)";
        cartIcon.style.color = "#2ecc71";
        setTimeout(() => {
            cartIcon.style.transform = "scale(1)";
            cartIcon.style.color = ""; 
        }, 300);
    }

    // Animação Botão "Encomende" (Fica Verde)
    if (botao) {
        const textoOriginal = botao.innerHTML;
        const estiloOriginal = botao.getAttribute("style");

        botao.innerHTML = 'Adicionado! <i class="fa-solid fa-check"></i>';
        botao.style.background = '#2ecc71'; // Verde
        botao.style.color = '#fff';
        botao.style.border = '1px solid #2ecc71';
        botao.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            botao.innerHTML = textoOriginal;
            botao.setAttribute("style", estiloOriginal || ""); // Restaura estilo original
        }, 1500);
    }
};

// 3. Remover
window.removerDoCarrinho = function(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
};

// 4. Toggle Modal
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

// 5. Finalizar WhatsApp
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
    let url = `https://wa.me/${window.WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
};

/* =====================================================
   CARREGAMENTO DE DADOS (CORRIGIDO)
   ===================================================== */
async function loadPerfumes() {
  try {
    const response = await fetch("data.json");
    perfumes = await response.json();

    // 1. Se estiver na Home (Grade de Produtos)
    if (brandColumns) populateBrandColumns();
    if (perfumeGrid) renderCards("TODAS", "", "TODAS");
    
    // 2. Inicializa carrinho
    atualizarCarrinhoUI();

    // 3. (A PARTE QUE FALTAVA) Se estiver na Página de Produto
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // Pega o nome do perfume na URL

    // ... dentro da função loadPerfumes ...

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); 

    if (id) {
        // TENTATIVA 1: Busca pelo SLUG (O jeito novo e bonito)
        let p = perfumes.find(item => item.id_slug === id);
        
        // TENTATIVA 2: Se não achou, tenta pelo NOME (O jeito antigo - Salva-vidas)
        if (!p) {
            // Decodifica os %20 para espaço para tentar achar pelo nome
            const idDecodificado = decodeURIComponent(id); 
            p = perfumes.find(item => item.Produto === idDecodificado);
        }

        // TENTATIVA 3: Tenta achar ignorando maiúsculas/minúsculas (Último recurso)
        if (!p) {
             const idLimpo = id.toLowerCase().replace(/-/g, ' ');
             p = perfumes.find(item => (item.Produto || "").toLowerCase() === idLimpo);
        }
        
        // SE ACHOU O PERFUME (Seja pelo slug ou pelo nome)
        if (p) {
            // Preenche os dados na tela
            if(document.getElementById('product-detail-name')) 
                document.getElementById('product-detail-name').innerText = p.Produto;
            
            if(document.getElementById('product-detail-brand')) 
                document.getElementById('product-detail-brand').innerText = p.Marca;
            
            if(document.getElementById('product-detail-price')) 
                document.getElementById('product-detail-price').innerText = p.Preco_Venda;
            
            if(document.getElementById('product-detail-desc')) 
                document.getElementById('product-detail-desc').innerText = p.Descricao || "Fragrância importada original.";

            // Chama a galeria
            window.montarGaleria(p);

            // Botão do Whatsapp
            const btnZap = document.getElementById('produtoWhatsapp');
            if(btnZap) {
                btnZap.onclick = function() {
                    const marcaSafe = (p.Marca||"").replace(/'/g," ");
                    const prodSafe = (p.Produto||"").replace(/'/g," ");
                    window.adicionarAoCarrinho(marcaSafe, prodSafe, p.Preco_Venda, this);
                };
            }
            
            // ESCONDE A MENSAGEM DE ERRO (Se ela estiver visível por padrão)
            const errorMsg = document.querySelector('.product-not-found-msg'); // Se tiver classe
            if(errorMsg) errorMsg.style.display = 'none';

        } else {
            console.error('Produto realmente não encontrado no JSON:', id);
            // Aqui ele mantém a tela de "Produto não encontrado"
        }
    }

/* =====================================================
   RENDERIZAÇÃO DA HOME (VITRINE)
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
    let genClass = "";
    try { genClass = normalizeCat(detectarGenero(p)); } catch(e){}

    if (!price) return false;
    
    const matchBrand = selectedBrand === "TODAS" || brand === selectedBrand;
    const combined = `${name} ${brand}`.toLowerCase();
    const matchText = combined.includes(term);
    
    let matchCategory = false;
    if (catFilter === "TODAS") matchCategory = true;
    else if (catFilter === "ARABE" && (catJSON === "ARABE" || brand === "LATTAFA" || brand === "AL HARAMAIN" || brand === "AFNAN" || brand === "ARMAF")) matchCategory = true;
    else if (catFilter === "DESIGNER" && (catJSON === "DESIGNER" || brand === "DIOR" || brand === "CHANEL" || brand === "YVES SAINT LAURENT" || brand === "JEAN PAUL GAULTIER" || brand === "CAROLINA HERRERA" || brand === "PACO RABANNE")) matchCategory = true;
    else if (catFilter === "NICHO" && (catJSON === "NICHO" || brand === "CREED" || brand === "PARFUMS DE MARLY" || brand === "XERJOFF" || brand === "ROJA" || brand === "AMOUAGE")) matchCategory = true;
    else if (catJSON === catFilter || genClass === catFilter) matchCategory = true;

    return matchBrand && matchText && matchCategory;
  });

  const ordenados = [...filtered.filter((p) => p.Destaque === true), ...filtered.filter((p) => p.Destaque !== true)];
  const limited = ordenados.slice(0, LIMITE_INICIAL);

  limited.forEach((p) => {
    const card = document.createElement("article");
    const catClass = normalizeCat(p.Categoria || "").toLowerCase();
    let genClass = "";
    try { genClass = normalizeCat(detectarGenero(p)).toLowerCase(); } catch(e){}

    card.className = `product-card ${catClass} ${genClass}`;

    let detalheHref = p.id_slug ? "produto.html?id=" + p.id_slug : null;
    
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
             ${p.Imagem ? `<img src="${p.Imagem}" alt="${p.Produto ?? ""}" class="product-image" />` : ""}
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
        <button class="product-btn" onclick="window.adicionarAoCarrinho('${marcaSafe}', '${produtoSafe}', '${precoSafe}', this)">
          Encomende <i class="fa-solid fa-cart-plus"></i>
        </button>
      </div>
    `;
    perfumeGrid.appendChild(card);
  });
}

// Favoritos
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
        // Efeito pulso
        icon.style.transform = "scale(1.3)";
        setTimeout(() => icon.style.transform = "scale(1)", 200);
    }
    localStorage.setItem('zeidanFavoritos', JSON.stringify(favoritos));
};

/* =====================================================
   PAINEL DE MARCAS E MENU
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

// Inicialização
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
   NOVA FUNÇÃO: GALERIA DE 4 FOTOS
   ===================================================== */
window.montarGaleria = function(produto) {
    const mainImg = document.getElementById('main-product-img');
    const track = document.getElementById('thumbnails-track');
    
    if (!mainImg || !track) return;

    // 1. Define a imagem grande
    mainImg.src = produto.Imagem;

    // 2. Monta a lista (Imagem 1, 2, 3 e 4)
    let lista = [];
    if(produto.Imagem) lista.push(produto.Imagem);
    if(produto.Imagem2) lista.push(produto.Imagem2);
    if(produto.Imagem3) lista.push(produto.Imagem3);
    if(produto.Imagem4) lista.push(produto.Imagem4);

    // Se tiver só 1 foto, repete ela 4 vezes
    if(lista.length === 1) lista = [produto.Imagem, produto.Imagem, produto.Imagem, produto.Imagem];
    
    // 3. Desenha os quadradinhos
    track.innerHTML = '';
    
    lista.forEach((imgSrc, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumb-item ${index === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${imgSrc}" style="width:100%; height:100%; object-fit:contain; display:block;">`;
        
        thumb.onclick = () => {
            mainImg.src = imgSrc;
            document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        };
        track.appendChild(thumb);
    });
};