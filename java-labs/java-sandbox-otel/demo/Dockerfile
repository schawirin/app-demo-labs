# Usar a imagem base do OpenJDK 17
FROM openjdk:17-jdk-slim

# Definir o diretório de trabalho
WORKDIR /app

# Copiar o JAR da sua aplicação para o container
COPY target/sandbox-2.0.2.jar app.jar

# Expor a porta que sua aplicação usa
EXPOSE 8080

# Definir variáveis de ambiente (se necessário)
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
ENV OTEL_RESOURCE_ATTRIBUTES=service.name=sandbox-service

# Comando para executar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]

