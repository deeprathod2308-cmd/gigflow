FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN ./node_modules/.bin/tsc
EXPOSE 5000
CMD ["node", "dist/index.js"]