# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.12.0

FROM node:${NODE_VERSION}-alpine as  base


ENV APP_USER node
ENV PM2_KILL_SIGNAL SIGINT
ENV NODE_ENV="production"
LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app



# Set production environment


# Install pnpm
ARG PNPM_VERSION=8.14.0
RUN npm install -g pnpm@$PNPM_VERSION


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
# RUN apt-get update -qq && \
#     apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY --link package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
# Copy application code
COPY --link . .

# # Build application
# RUN pnpm run build

# Remove development dependencies
# RUN pnpm prune --prod


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app

RUN npm install -g pm2
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:rotateModule true


# Set stop signal
# STOPSIGNAL ${PM2_KILL_SIGNAL}

# Start the server by default, this can be overwritten at runtime
EXPOSE 8080
CMD ["pm2-runtime", "process.docker.json", "--no-auto-exit", "--use-node-interpreter"]

