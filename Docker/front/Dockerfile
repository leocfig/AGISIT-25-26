FROM node:20-alpine

WORKDIR /app

COPY front-end/package*.json /app/
RUN npm ci

COPY front-end/ /app/

EXPOSE 5173

CMD [ "sh", "-lc", "if [ ! -d node_modules ]; then npm ci; fi; npm run dev -- --host 0.0.0.0" ]