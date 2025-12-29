import json
import time
import random
import requests
import re

ARQUIVO_JSON = 'data.json'

# --- CONFIGURAÇÃO DE "ANTÍDOTOS" (PALAVRAS NEGATIVAS) ---
ANTIDOTOS = {
    "AFNAN": ["rebel", "dive", "rare", "turathi", "supremacy"],
    "ARMAF": ["milestone", "mandarin", "limoni", "sillage", "untold", "iconic", "precieux", "maleka", "lionheart", "imperiale", "bling", "oud", "urban elixir", "woman"],
    "LATTAFA": ["oud for glory", "amethyst", "sublime", "zanzibar", "elixir", "ou", "candy"], # Adicionei zanzibar por precaução
    "AL HARAMAIN": ["ruby", "rouge", "bleu"],
}

# --- TERMOS DE BUSCA ARTÍSTICA ---
TEMPLATES_BUSCA = [
    "{nome} perfume bottle dramatic still life photography {negativos}",
    "{nome} fragrance luxurious editorial campaign shot {negativos}",
    "{nome} perfume official stylistic product photo {negativos}"
]

def buscar_bing_artistico_v2(termo, quantidade=2):
    print(f"   🎨 Buscando (V2): {termo}...")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    termo_url = requests.utils.quote(termo)
    url = f"https://www.bing.com/images/search?q={termo_url}&qft=+filterui:imagesize-large&form=IRFLTR&first=1"
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        links = re.findall(r'murl&quot;:&quot;(http.*?)&quot;', response.text)
        
        links_limpos = [l for l in links if 'http' in l and not l.endswith('.gif') and 'logo' not in l.lower()]
        
        if links_limpos:
            return list(set(links_limpos))[:quantidade]
    except Exception as e:
        print(f"   ⚠️ Erro na busca: {e}")
    return []

def main():
    print("📸 INICIANDO ROBÔ ARTISTA V2.1 (CORRIGIDO)...")
    print("-------------------------------------------------------------")

    try:
        with open(ARQUIVO_JSON, 'r', encoding='utf-8') as f:
            produtos = json.load(f)
    except FileNotFoundError:
        print("❌ Erro: data.json não encontrado!")
        return

    contador_produtos_alterados = 0
    
    for i, p in enumerate(produtos):
        # --- AQUI ESTAVA O ERRO, AGORA ESTÁ .upper() ---
        marca = p.get('Marca', '').strip().upper() 
        produto_nome = p.get('Produto', '').strip()
        nome_completo = f"{marca} {produto_nome}".strip()
        
        if not nome_completo: continue

        campos_vazios = []
        if not p.get('Imagem'): campos_vazios.append('Imagem')
        if not p.get('Imagem2'): campos_vazios.append('Imagem2')
        if not p.get('Imagem3'): campos_vazios.append('Imagem3')
        if not p.get('Imagem4'): campos_vazios.append('Imagem4')
        
        if campos_vazios:
            print(f"\n[{i+1}/{len(produtos)}] Processando: {nome_completo}")
            
            lista_negativos = ANTIDOTOS.get(marca, [])
            negativos_filtrados = [f"-{neg}" for neg in lista_negativos if neg.lower() not in produto_nome.lower()]
            string_negativos = " ".join(negativos_filtrados)

            if string_negativos:
                print(f"   🛡️  Ativando filtros negativos: {string_negativos}")

            pool_de_fotos = []
            
            for template in TEMPLATES_BUSCA:
                busca = template.format(nome=nome_completo, negativos=string_negativos)
                fotos_encontradas = buscar_bing_artistico_v2(busca, quantidade=2)
                
                for foto in fotos_encontradas:
                    if foto not in pool_de_fotos:
                        pool_de_fotos.append(foto)
                time.sleep(0.5)

            idx_foto = 0
            fotos_usadas_agora = 0
            for campo in campos_vazios:
                if idx_foto < len(pool_de_fotos):
                    p[campo] = pool_de_fotos[idx_foto]
                    idx_foto += 1
                    fotos_usadas_agora += 1
            
            if fotos_usadas_agora > 0:
                print(f"   ✅ {fotos_usadas_agora} fotos adicionadas!")
                contador_produtos_alterados += 1
                with open(ARQUIVO_JSON, 'w', encoding='utf-8') as f:
                    json.dump(produtos, f, indent=2, ensure_ascii=False)
            else:
                 print("   ⚠️ Não foram encontradas boas fotos.")

            time.sleep(random.uniform(2.5, 4.0))

    print(f"\n✨ FINALIZADO! {contador_produtos_alterados} produtos atualizados.")

if __name__ == "__main__":
    main()