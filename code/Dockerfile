FROM node:20

# Copy the app folder to the container
COPY ./app /app


WORKDIR /app/chatty/ui
RUN npm install
RUN npm run build:ui

WORKDIR /app
RUN npm install