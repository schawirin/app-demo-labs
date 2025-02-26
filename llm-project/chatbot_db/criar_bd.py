import sqlite3
import os

# Caminho correto do banco de dados dentro do container
DB_PATH = "/app/data/chatbot.db"

# Garante que o diretório do banco existe
os.makedirs("/app/data", exist_ok=True)

# Conectar ao banco de dados (ou criar um novo)
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Criar a tabela de serviços (se não existir)
cursor.execute('''
    CREATE TABLE IF NOT EXISTS servicos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        preco_base REAL NOT NULL,
        adicional_por_hora REAL NOT NULL
    )
''')

# Inserir serviços no banco
servicos = [
    ("troca de lâmpada", 50, 10),
    ("troca de tomada", 80, 20),
    ("troca de chuveiro", 150, 30)
]

for servico in servicos:
    cursor.execute("INSERT OR IGNORE INTO servicos (nome, preco_base, adicional_por_hora) VALUES (?, ?, ?)", servico)

# Salvar e fechar a conexão
conn.commit()
conn.close()

print(f"Banco de dados criado e atualizado com sucesso em {DB_PATH}!")
