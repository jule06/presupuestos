FROM node:20-alpine AS build
WORKDIR /app

ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN sed -i "s/TU_GOOGLE_CLIENT_ID_AQUI/${GOOGLE_CLIENT_ID}/g" \
    src/environments/environment.prod.ts

RUN npm run build:prod

FROM nginx:alpine
COPY --from=build /app/dist/proyectopresupuesto-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]
CMD ["/bin/sh", "-c", "sed -i 's/listen ${PORT:-80}/listen '\"$PORT\"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
