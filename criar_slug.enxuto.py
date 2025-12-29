import json
import re
import unicodedata

ARQUIVO = 'data.json'

# PALAVRAS QUE VAMOS ARRANCAR DO LINK (Palavras "inúteis" para URL)
# Mantemos EDP, EDT, ELIXIR, INTENSE porque elas diferenciam o produto!
STOP_WORDS = [
    'de', 'da', 'do', 'das', 'dos', 'e', 'y', 'the', 'le', 'la', 
    'par', 'par.', 'parfums', 'perfume', 'perfumes', 'fragrance', 
    'eau', 'toilette', 'cologne', 'vaporisateur', 'spray', 'natural', 
    'ml', 'fl', 'oz', 'vol', 'pack', 'unid', 'unidade'
]

def criar_slug_inteligente(texto):
    # 1. Tira acentos e deixa minúsculo
    texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('ASCII')
    texto = texto.lower()
    
    # 2. Separa as palavras
    # Substitui pontos e barras por espaços para separar melhor (ex: PAR.DE -> PAR DE)
    texto = texto.replace('.', ' ').replace('/', ' ').replace('-', ' ')
    palavras = texto.split()
    
    # 3. FILTRAGEM (O Pulo do Gato) 🐱
    palavras_filtradas = []
    for p in palavras:
        # Só adiciona se NÃO for uma palavra proibida e se tiver mais de 1 letra
        if p not in STOP_WORDS and len(p) > 1:
            palavras_filtradas.append(p)
        # Exceção: Se for número (75, 100), adiciona mesmo sendo curto
        elif p.isdigit():
            palavras_filtradas.append(p)
            
    # 4. Junta tudo com tracinho
    slug_final = "-".join(palavras_filtradas)
    return slug_final

print("✂️  CRIANDO LINKS SUPER ENXUTOS...")

try:
    with open(ARQUIVO, 'r', encoding='utf-8') as f:
        produtos = json.load(f)

    for p in produtos:
        nome_completo = f"{p['Marca']} {p['Produto']}"
        
        # Gera o slug novo
        p['id_slug'] = criar_slug_inteligente(nome_completo)

    with open(ARQUIVO, 'w', encoding='utf-8') as f:
        json.dump(produtos, f, indent=2, ensure_ascii=False)

    print("✅ SUCESSO! Links encurtados.")
    
    # Mostra uns exemplos pra você ver como ficou
    print("\n--- EXEMPLOS DE COMO FICOU ---")
    for i in range(3):
        print(f"Era: {produtos[i]['Produto']}")
        print(f"Virou: {produtos[i]['id_slug']}")
        print("---")

except Exception as e:
    print(f"❌ Erro: {e}")