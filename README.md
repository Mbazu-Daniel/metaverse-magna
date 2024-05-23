## Guideline
Here are step-by-step guidelines to set up and run the code locally with Docker, using Docker Compose for managing services, and `nodemon` for automatically reloading the application when changes are detected.

### Step 1: Prerequisites

Ensure you have the following installed on your local machine:

-   Docker
-   Docker Compose
-   Node.js (for local development)
-   pnpm (for package management)

### Step 2: Clone the Repository
Clone your repository to your local machine:

    git clone https://github.com/Mbazu-Daniel/metaverse-magna
    cd metaverse-magna

### Step 3: Set Up the Project

#### 3.1. Install Dependencies

Install the necessary Node.js dependencies using `pnpm`:

    pnpm install

#### 3.2. Test Project 

Run project test using Jest library 

    pnpm jest

 

#### 3.3. Update `package.json`

Add a `dev` script in your `package.json` to use `nodemon` for watching changes:


    {
      "scripts": {
        "start": "nodemon dist/server.js",
        "dev": "nodemon --watch './**/*.ts' --exec 'ts-node' src/server.ts"


      }
    } 


#### 3.4. Create `Dockerfile`

Create a `Dockerfile` in the root directory of your project:

   
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
    
    # Expose the port
    EXPOSE 3000
    
    # Start the application in development mode
    CMD ["pnpm", "run", "dev"]

#### 3.5. Create `docker-compose.yml`

Create a `docker-compose.yml` file in the root directory of your project:

    version: "3.9"
    
    services:
      blockchain_event:
        container_name: blockchain_event
        build: .
        ports:
          - "8000:8000"
        environment:
          - DB_TYPE=postgres
          - DB_HOST=db
          - DB_PORT=5432
          - DB_USERNAME=postgres
          - DB_PASSWORD=postgres
          - DB_DATABASE=postgres
        volumes:
          - .:/usr/src/app
        depends_on:
          db:
            condition: service_healthy
    
      db:
        container_name: db
        image: postgres:15.6
        ports:
          - "5432:5432"
        environment:
          - POSTGRES_USER=postgres
          - POSTGRES_PASSWORD=postgres
          - POSTGRES_DB=postgres
        volumes:
          - pgdata:/var/lib/postgresql/data
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U postgres"]
          interval: 10s
          timeout: 5s
          retries: 5
    
    volumes:
      pgdata: {} 

### Step 4: Build and Run the Docker Containers

Use Docker Compose to build and run your Docker containers:

`docker-compose up --build` 

### Step 5: Verify the Setup

1.  **Access the Application**:
    
    -   Open your browser and navigate to `http://localhost:8000/health` to access your application health checker.
2.  **Check for Changes**:
    
    -   Make changes to your code in the `src` directory.
    -   `nodemon` will automatically detect the changes and reload the application inside the Docker container.

### Additional Notes:

-   **Database Configuration**: Ensure your application code is configured to connect to the PostgreSQL database using the environment variables specified in `docker-compose.yml` (e.g., `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`).
    
-   **Docker Commands**:
    
    -   To stop the containers: `docker-compose down`
    -   To rebuild the containers without cache: `docker-compose up --build --no-cache`
    -   To view logs: `docker-compose logs -f`

By following these steps, you should be able to set up and run your code locally using Docker and Docker Compose, with automatic reloading of the application on code changes. If you encounter any issues or have further questions, feel free to ask!

For any inquiries, please contact me at:

-   **Name:** Daniel Mbazu
-   **Email:** Mbazudaniel97@gmail.com
-   **LinkedIn:** [Daniel Mbazu](https://www.linkedin.com/in/mbazudaniel)

