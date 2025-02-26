# Use uma imagem base do Python 3.9-slim
FROM python:3.9-slim

# Instale dependências de sistema necessárias para compilar pacotes
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho
WORKDIR /app

# Atualiza o pip e instala as dependências do projeto
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação para o container
COPY . .

# Inicia a aplicação com uvicorn, escutando na porta 8000
CMD ["uvicorn", "whatsapp_integration:app", "--host", "0.0.0.0", "--port", "8000"]
