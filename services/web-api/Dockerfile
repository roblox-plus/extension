# Setup runtime images
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80

# Setup build image
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build

# Copy Files
COPY NuGet.config /all/
COPY Directory.Build.props /all/
COPY Directory.Build.targets /all/
COPY Directory.Packages.props /all/

# Copy in only the csproj files for the restore step, to enable higher docker cache hit rate.
COPY *.sln /all/services/api/
COPY src/*.csproj /all/services/api/src/
# COPY tests/*.csproj /all/services/api/tests/
WORKDIR /all/services/api

# NuGet Restore
RUN dotnet restore

# Build
COPY src src
# COPY tests tests
RUN dotnet build --no-restore -c Release

# Test
# RUN dotnet test --filter TestCategory=Unit

# Publish
FROM build AS publish
WORKDIR /all/services/api/src
RUN dotnet publish --no-restore --no-build -c Release --output /app

# Build runtime image
FROM base as final
WORKDIR /app
COPY --from=publish /app/ .

ENTRYPOINT ["dotnet", "RobloxPlus.Main.Api.dll"]

ENV APP_NAME="roblox-plus-api"
