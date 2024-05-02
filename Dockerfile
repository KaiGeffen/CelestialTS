FROM node:16

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node . .

USER node

RUN npm install && npm run build

EXPOSE 8083

CMD [ "npm", "run", "start" ]