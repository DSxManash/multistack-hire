FROM node:22-alpine

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

RUN npm install

# Copy the rest of your frontend code
COPY . .

# Expose the Vite default port
EXPOSE 5173

# Run Vite and bind to 0.0.0.0 so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]