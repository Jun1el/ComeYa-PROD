FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/ComeYa.API/ComeYa.API.csproj", "src/ComeYa.API/"]
COPY ["src/ComeYa.Application/ComeYa.Application.csproj", "src/ComeYa.Application/"]
COPY ["src/ComeYa.Domain/ComeYa.Domain.csproj", "src/ComeYa.Domain/"]
COPY ["src/ComeYa.Infrastructure/ComeYa.Infrastructure.csproj", "src/ComeYa.Infrastructure/"]
RUN dotnet restore "src/ComeYa.API/ComeYa.API.csproj"
COPY . .
WORKDIR "/src/src/ComeYa.API"
RUN dotnet build "ComeYa.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ComeYa.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ComeYa.API.dll"]
