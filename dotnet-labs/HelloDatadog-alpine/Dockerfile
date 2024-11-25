# Use a imagem oficial do .NET para build
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build-env
WORKDIR /app

# Copie os arquivos do projeto para o container
COPY . ./

# Compile e publique o projeto em modo Release
RUN dotnet publish -c Release -o out

# Use a imagem runtime do .NET
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copie os arquivos publicados para o container final
COPY --from=build-env /app/out .

# Configure variáveis de ambiente
ENV ASPNETCORE_ENVIRONMENT=Development
ENV DOTNET_LOGGING__CONSOLE__LOGLEVEL__DEFAULT=Debug
ENV ASPNETCORE_URLS=http://+:5000

# Exponha a porta do aplicativo
EXPOSE 5000

# Configure o ponto de entrada para o aplicativo
ENTRYPOINT ["dotnet", "HelloDatadog.dll"]
