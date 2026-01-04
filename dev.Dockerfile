# syntax=docker/dockerfile:1

FROM node:alpine AS base
RUN apk add --no-cache cpio findutils git
RUN npm install -g npm@11.7.0
WORKDIR /src

FROM base AS deps
RUN --mount=type=bind,target=.,rw \
  --mount=type=cache,target=/src/node_modules \
  npm install && mkdir /vendor && cp package-lock.json /vendor

FROM scratch AS vendor-update
COPY --from=deps /vendor /

FROM deps AS vendor-validate
RUN --mount=type=bind,target=.,rw <<EOT
  set -e
  git add -A
  cp -rf /vendor/* .
  if [ -n "$(git status --porcelain -- package-lock.json)" ]; then
    echo >&2 'ERROR: Vendor result differs. Please vendor your package with "docker buildx bake vendor-update"'
    git status --porcelain -- package-lock.json
    exit 1
  fi
EOT

FROM deps AS build
RUN --mount=type=bind,target=.,rw \
  --mount=type=cache,target=/src/node_modules \
  npm run build && mkdir /out && cp -Rf dist /out/

FROM scratch AS build-update
COPY --from=build /out /

FROM build AS build-validate
RUN --mount=type=bind,target=.,rw <<EOT
  set -e
  git add -A
  cp -rf /out/* .
  if [ -n "$(git status --porcelain -- dist)" ]; then
    echo >&2 'ERROR: Build result differs. Please build first with "docker buildx bake build"'
    git status --porcelain -- dist
    exit 1
  fi
EOT

FROM deps AS format
RUN --mount=type=bind,target=.,rw \
  --mount=type=cache,target=/src/node_modules \
  npm run eslint:fix \
  && mkdir /out && find . -name '*.js' -not -path './node_modules/*' | cpio -pdm /out

FROM scratch AS format-update
COPY --from=format /out /

FROM deps AS lint
RUN --mount=type=bind,target=.,rw \
  --mount=type=cache,target=/src/node_modules \
  npm run eslint

FROM deps AS test
RUN --mount=type=bind,target=.,rw \
  --mount=type=cache,target=/src/node_modules \
  npm test && cp -r ./coverage /tmp

FROM scratch AS test-coverage
COPY --from=test /tmp/coverage /

FROM deps AS jsdoc
RUN --mount=type=bind,target=.,rw \
  --mount=type=cache,target=/src/node_modules \
  npm run jsdoc && cp -r ./jsdoc /tmp

FROM scratch AS jsdoc-update
COPY --from=jsdoc /tmp/jsdoc /
