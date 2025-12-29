import json
import os

ARQUIVO = 'data.json'

print("🏗️  PREPARANDO O TERRENO (CRIANDO CAMPOS NO JSON)...")

# Verifica se o arquivo existe
if not os.path.exists(ARQUIVO):
    print("❌ Erro: O arquivo data.json não foi encontrado!")
    exit()

try:
    # 1. Abre o arquivo
    with open(ARQUIVO, 'r', encoding='utf-8') as f:
        produtos = json.load(f)

    contador = 0

    # 2. Adiciona os campos vazios
    for p in produtos:
        # Só adiciona se a chave NÃO existir no produto
        # Isso garante que não apaga nada que você já tenha feito
        mudou = False
        
        if 'Imagem2' not in p:
            p['Imagem2'] = ""
            mudou = True
            
        if 'Imagem3' not in p:
            p['Imagem3'] = ""
            mudou = True
            
        if 'Imagem4' not in p:
            p['Imagem4'] = ""
            mudou = True
            
        if mudou:
            contador += 1

    # 3. Salva de volta
    with open(ARQUIVO, 'w', encoding='utf-8') as f:
        json.dump(produtos, f, indent=2, ensure_ascii=False)

    print(f"\n✅ SUCESSO! Estrutura atualizada em {contador} produtos.")
    print("Agora todos os produtos têm os campos: Imagem2, Imagem3 e Imagem4.")
    print("Pode rodar o robô de busca!")

except Exception as e:
    print(f"❌ Erro: {e}")