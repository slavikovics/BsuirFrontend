FROM node:18

WORKDIR /app
RUN git clone https://github.com/Rob--W/cors-anywhere.git . && \
    npm install

CMD ["node", "server.js"]
