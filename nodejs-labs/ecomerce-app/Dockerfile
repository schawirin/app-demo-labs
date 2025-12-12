FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --production --ignore-engines

COPY . .

RUN npm run build

ENV NODE_ENV production

CMD [ "yarn", "start" ]

