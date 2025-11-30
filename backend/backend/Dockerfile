FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["backend/backend.csproj", "backend/"]
RUN dotnet restore "backend/backend.csproj"

COPY . .
WORKDIR "/src/backend"

RUN dotnet build "./backend.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./backend.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM build AS ef-tools
RUN dotnet tool install --global dotnet-ef --version 9.0.0

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=ef-tools /root/.dotnet/tools /root/.dotnet/tools

ENV PATH="$PATH:/root/.dotnet/tools"

ENV ASPNETCORE_URLS=http://+:8080

COPY backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]