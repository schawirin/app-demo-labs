FROM python:3.9-slim

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["ddtrace-run", "python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]