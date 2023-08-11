FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src src
COPY public public
COPY tailwind.config.js tailwind.config.js

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
