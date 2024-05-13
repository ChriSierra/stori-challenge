FROM node:18.0-alpine
RUN apk update && apk add bash && apk add curl
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install serverless@3.38.0

COPY . .

EXPOSE 3000

CMD sh docker_entrypoint.sh