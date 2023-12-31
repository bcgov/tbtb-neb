# Stage 1: Use yarn to build the app
FROM artifacts.developer.gov.bc.ca/docker-remote/node:16.20.0 as builder
WORKDIR /usr/src/app
COPY . .
# RUN npm install -g npm@9.1.1 \
#     && npm install --omit=dev \
#     && npm install -D webpack webpack-cli
# RUN yes | npm run dist

# #RUN INLINE_RUNTIME_CHUNK=false npm run build
RUN npm install
RUN npm run build && ls -la && cd build && npm ci --production 
#RUN cd build && node server.js

# Stage 2: Copy the JS React SPA into the Nginx HTML directory
FROM artifacts.developer.gov.bc.ca/docker-remote/bitnami/nginx:1.21.6
COPY ./nginx.conf /opt/bitnami/nginx/conf/
COPY --from=builder /usr/src/app/build /app
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
