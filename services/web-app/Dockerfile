# Setup runtime images
FROM node:19 AS base

# Setup image to build the published module with
FROM node:19 AS build-module

# Setup build image
FROM node:19 AS build

# Copy in only the package.json files for the install step, to enable higher docker cache hit rate.
COPY ./package.json ./package-lock.json ./services/app/

# Install the packages
WORKDIR /services/app
RUN npm ci

# Build the app
COPY . .
RUN npm run build
# RUN npm run test

# Build runtime image
FROM base as final

# Copy the package.json for the final image.
COPY ./docker /app
WORKDIR /app

# Install serve, to serve the created frontend files with.
RUN npm ci

# Copy the created files over to the final image.
COPY --from=build /services/app/build /app/build

ENTRYPOINT ["npx", "serve", "/app/build"]
