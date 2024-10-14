FROM node:20.18.0-bookworm
#RUN mkdir /app
WORKDIR /app
COPY .env .
COPY package.json .
RUN npm install && npm install
COPY . .
EXPOSE 8668
CMD ["npm", "run", "dev"]
