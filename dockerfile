FROM node:20 as build-env
WORKDIR /app
COPY package*.json /app/.

RUN npm install
COPY . /app/.
RUN npm run build

FROM nginx:1.21.0-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-env /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]