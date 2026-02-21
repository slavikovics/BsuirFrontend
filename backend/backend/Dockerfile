# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY ["backend/backend.csproj", "backend/"]
RUN dotnet restore "backend/backend.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/backend"
RUN dotnet build "backend.csproj" -c Release -o /app/build

# Install dotnet-ef in build stage
RUN dotnet tool install --global dotnet-ef --version 9.0.0

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Copy published app
COPY --from=publish /app/publish .

# Copy dotnet tools from build stage
COPY --from=build /root/.dotnet/tools /root/.dotnet/tools

# Add to PATH
ENV PATH="$PATH:/root/.dotnet/tools"

# Copy entrypoint script
COPY backend/entrypoint.sh /app/entrypoint.sh

# Fix line endings and make executable
RUN sed -i 's/\r$//' /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]