FROM node:20

# Copy the app folder to the container
COPY ./app /app

WORKDIR /app

# Install the dependencies
RUN npm install

CMD ["chatty/server.js"]
