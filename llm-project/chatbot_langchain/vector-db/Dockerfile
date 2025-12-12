FROM python:3.9-slim

# Instalar dependências de compilação e SQLite
RUN apt-get update && \
    apt-get install -y \
    gcc \
    g++ \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install chromadb pysqlite3

EXPOSE 8000
CMD ["chroma", "run", "--path", "/data", "--port", "8000"]