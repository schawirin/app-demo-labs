# Usar a imagem base do Python
FROM python:3.12-slim

# Definir o diretório de trabalho no container
WORKDIR /app

# Copiar o arquivo requirements.txt para o container
COPY requirements.txt requirements.txt

# Instalar as dependências necessárias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante dos arquivos do aplicativo para o container
COPY . .

# Expor a porta 8080
EXPOSE 8080

# Comando para rodar o aplicativo
CMD ["python3", "app.py"]
