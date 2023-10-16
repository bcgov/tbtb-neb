# Use an official Node.js runtime as a parent image
# FROM artifacts.developer.gov.bc.ca/redhat-access-docker-remote/ubi8/nodejs-16:1-5

# # Set the ENV_VAR environment variable
# ARG ENV_ARG
# ENV ENV_VAR=$ENV_ARG

# ARG USER_ID

# # Build 
# ENV HOME_CLIENT /opt/app-root/src/app

# # Using root to transfer ownership of work dir
# USER root
# RUN mkdir -p ${HOME_CLIENT}
# RUN chown -R ${USER_ID} ${HOME_CLIENT}
# WORKDIR ${HOME_CLIENT}

# #COPY package*.json ./

# #RUN npm set progress=false && npm ci --no-cache
# COPY . .
# RUN chown -R ${USER_ID} .

# USER ${USER_ID}


# #RUN INLINE_RUNTIME_CHUNK=false npm run build
# RUN npm install && npm run build && cd build && npm ci --production 
# RUN cd build && node server.js




ARG NODE_IMAGE=node:16.13.1-alpine
ARG PORT=8080

# Set the ENV_VAR environment variable
ARG ENV_ARG
ENV ENV_VAR=$ENV_ARG
ARG USER_ID

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init
RUN mkdir -p /home/node/app && chown ${USER_ID} /home/node/app
WORKDIR /home/node/app
USER ${USER_ID}
RUN mkdir tmp

FROM base AS dependencies
COPY --chown=${USER_ID} ./package*.json ./
RUN npm ci
COPY --chown=${USER_ID} . .

FROM dependencies AS build
RUN node ace build --production

FROM base AS production
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0
COPY --chown=${USER_ID} ./package*.json ./
RUN npm ci --production
COPY --chown=${USER_ID} --from=build /home/node/app/build .
EXPOSE $PORT
CMD [ "dumb-init", "node", "server.js" ]
