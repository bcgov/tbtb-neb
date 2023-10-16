# Use an official Node.js runtime as a parent image
FROM registry.access.redhat.com/ubi8/nodejs-18:1

# Set the ENV_VAR environment variable
ARG ENV_ARG
ENV ENV_VAR=$ENV_ARG

ARG USER_ID

# Build 
ENV HOME_CLIENT /opt/app-root/src/app

# Using root to transfer ownership of work dir
USER root
RUN mkdir -p ${HOME_CLIENT}
RUN chown -R ${USER_ID} ${HOME_CLIENT}
WORKDIR ${HOME_CLIENT}

#COPY package*.json ./



#RUN npm set progress=false && npm ci --no-cache
COPY . .
RUN chown -R ${USER_ID} .

USER ${USER_ID}


#RUN INLINE_RUNTIME_CHUNK=false npm run build
RUN ls -la && pwd && npm install && npm run build && ls build && cd build && npm ci --production && node server.js
