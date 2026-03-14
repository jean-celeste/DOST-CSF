# Use a light version of Node
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the files
COPY . .

# Next.js dev port
EXPOSE 3000

# Start the dev server
CMD ["npm", "run", "dev"]