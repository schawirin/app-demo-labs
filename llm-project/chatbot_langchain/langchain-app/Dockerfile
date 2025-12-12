FROM python:3.9-slim

# Instalar dependências necessárias para compilar hnswlib e outros pacotes C++
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --upgrade pip

# Copiar e instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código
COPY . .

CMD ["ddtrace-run", "python", "app/app.py"]



