FROM node:18

# Install pnpm
RUN npm install -g pnpm

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install

# Bundle app source
COPY . .

# Build the application
RUN pnpm run build

# Expose the port
EXPOSE 8000

# Start the application
CMD ["pnpm", "run", "dev"]
