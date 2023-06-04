# Setup runtime images
FROM node:19 AS base

# Setup image to build the published module with
FROM node:19 AS build-module

# Setup build image
FROM node:19 AS build

# Copy in only the package.json files for the install step, to enable higher docker cache hit rate.
COPY ./libs/roblox/package.json ./libs/roblox/package-lock.json /libs/roblox/
COPY ./libs/extension-utils/package.json ./libs/extension-utils/package-lock.json /libs/extension-utils/

# Restore library modules
WORKDIR /libs/roblox
RUN npm ci

WORKDIR /libs/extension-utils
RUN npm ci

# Copy in the local module contents, so we can build them.
COPY ./libs /libs

# Build the local modules
WORKDIR /libs/roblox
RUN npm run build

WORKDIR /libs/extension-utils
RUN npm run build

# Copy in only the package.json files for the install step, to enable higher docker cache hit rate.
COPY ./services/web-app/package.json ./services/web-app/package-lock.json /services/app/

# Install the packages
WORKDIR /services/app
RUN npm ci

# Build the app
COPY ./services/web-app/ /services/app/
RUN npm run build
# RUN npm run test

# Build runtime image
FROM base as final

# Copy the package.json for the final image.
COPY ./services/web-app/docker /app
WORKDIR /app

# Install serve, to serve the created frontend files with.
RUN npm ci

# Copy the created files over to the final image.
COPY --from=build /services/app/build /app/build

ENTRYPOINT ["npx", "serve", "/app/build"]
