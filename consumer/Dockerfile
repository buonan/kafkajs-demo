# syntax=docker/dockerfile:1

FROM node:18-alpine
ENV NODE_ENV=production

ARG COMSUMER_TOPIC
ENV COMSUMER_TOPIC=${COMSUMER_TOPIC}

ARG CONSUMER_NAME
ENV CONSUMER_NAME=${CONSUMER_NAME}

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY ./dist .

CMD [ "node", "index.js" ]