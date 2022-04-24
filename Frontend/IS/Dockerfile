FROM node:16 AS builder
WORKDIR /app
COPY . .
COPY .env .
RUN npm install -g ts-node
RUN npm install
RUN npm run build:prod

FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist/IS .
ENTRYPOINT ["nginx", "-g", "daemon off;"]