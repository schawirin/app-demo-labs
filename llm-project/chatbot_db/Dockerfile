FROM python:3.9-slim

WORKDIR /app

# Garante que o diretório do banco existe dentro do container
RUN mkdir -p /app/data

# Copia os arquivos necessários
COPY criar_bd.py /app/criar_bd.py
COPY requirements.txt /app/requirements.txt
COPY chatbot.py /app/chatbot.py

# Instala dependências do sistema e do Python
RUN apt-get update && apt-get install -y sqlite3
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# Criar o banco de dados no local correto
RUN python /app/criar_bd.py

# Mantém o container rodando sem executar o chatbot
CMD ["tail", "-f", "/dev/null"]
