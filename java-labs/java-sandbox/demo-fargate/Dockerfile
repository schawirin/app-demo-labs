# Usa uma imagem que já tem Maven e Java 17
FROM maven:3.9.5-eclipse-temurin-17 AS build

WORKDIR /app

# Baixa o Datadog Java Agent
RUN curl -Lo dd-java-agent.jar https://dtdg.co/latest-java-tracer 

# Copia os arquivos do projeto
COPY . .

# Compila a aplicação garantindo suporte ao Java 17
RUN mvn clean package -DskipTests --no-transfer-progress

# Usa uma imagem menor para a aplicação final
FROM eclipse-temurin:17-jdk
WORKDIR /app

# Copia os arquivos necessários
COPY --from=build /app/target/sandbox-2.0.2.jar app.jar
COPY --from=build /app/dd-java-agent.jar dd-java-agent.jar

# Expor a porta 8080
EXPOSE 8080

# Iniciar a aplicação com Datadog APM e correlação de logs/traces
ENTRYPOINT ["java", "-javaagent:/app/dd-java-agent.jar", "-Ddd.trace.sample.rate=1",  "-Ddd.logs.injection=true", "-jar", "app.jar"]
