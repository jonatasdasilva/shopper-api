FROM node:20.17.0
RUN mkdir /app
WORKDIR /app
COPY .env /app
COPY package.json /app
RUN npm install && npm run build
COPY . .
EXPOSE 8778
CMD ["npm", "run", "production"]