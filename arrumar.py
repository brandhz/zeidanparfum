import json

# Lê o arquivo original com carinho
with open('data.json', 'r', encoding='utf-8') as f:
    produtos = json.load(f)

# Percorre produto por produto e adiciona os campos vazios
for p in produtos:
    # Só adiciona se não existir, pra não estragar nada
    if "Decant5ml" not in p:
        p["Decant5ml"] = "" 
    
    if "Decant10ml" not in p:
        p["Decant10ml"] = ""

# Salva de volta formatado e bonitinho
with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(produtos, f, indent=4, ensure_ascii=False)

print("✅ FEITO! Agora seu JSON tem os campos novos sem bagunçar os preços.")