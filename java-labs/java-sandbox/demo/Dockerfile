# Etapa 1: Construção da aplicação
FROM maven:latest AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Criação da imagem final
FROM openjdk:latest
WORKDIR /app
COPY --from=build /app/target/sandbox-2.0.2.jar app.jar

# Expor a porta 8080
EXPOSE 8080

# Comando para iniciar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
