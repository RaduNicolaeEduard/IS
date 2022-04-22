FROM node:16
RUN apt update -y && apt install tesseract-ocr -y
# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]