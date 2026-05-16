# CrickX 🏏

A production-ready location-based cricket matchmaking and challenge platform for India.

## Features
* 📍 Geospatial Database (MongoDB 2dsphere indexing)
* ⚡ Real-Time WebSocket Updates (Join/Leave sync instantly)
* 🔐 JWT Authentication & Security
* 🗺️ Google Maps Integration
* 🎨 Premium UI with Glassmorphism, Angular Material & Micro-animations
* 🐳 Fully Dockerized for Deployment

## Tech Stack
* **Frontend**: Angular 21, Angular Material, RxStomp (WebSockets), CSS Custom Properties
* **Backend**: Java 21, Spring Boot 3.4, Spring Security, MongoDB, Java WebSockets
* **Infrastructure**: Docker, Docker Compose, Nginx

## How to Run Locally

You have two options to run this project: Complete Docker or Mixed Development.

### Option 1: Full Docker (Easiest - Production Simulation)
*Requires Docker and Docker Compose installed.*

1. Open a terminal in the root `CricX` directory.
2. Run: 
   ```bash
   docker-compose up -d --build
   ```
3. Access the app: `http://localhost` or `http://localhost:4200`
4. The backend is running on `http://localhost:8080`
5. The MongoDB database is running on `localhost:27017`

### Option 2: Development Mode (Hot Reloads)
*Requires JDK 21+ and Node.js 20+ installed.*

**1. Start Database**
```bash
docker-compose up -d mongodb
```

**2. Start Backend**
Open a terminal in the `backend` folder:
```bash
# If you have maven installed
mvn spring-boot:run
# Or if you're using the wrapper (Linux/Mac)
./mvnw spring-boot:run
# Or Windows
mvnw.cmd spring-boot:run
```

**3. Start Frontend**
Open a terminal in the `frontend` folder:
```bash
npm install
npm run start
```
Access the app at `http://localhost:4200`.

## Maps Integration
For the maps to work fully, you must replace `YOUR_GOOGLE_MAPS_API_KEY` in `frontend/src/environments/environment.ts` (and `environment.prod.ts`) with a valid Google Maps JavaScript API key.

## Deployment to AWS/Railways/Render
This project is already containerized context. To deploy:
1. Push this repository to GitHub.
2. Connect the repo to Render, Railway, or AWS Elastic Beanstalk.
3. For Frontend: Deploy the `frontend/` directory as a Static Site or Docker app.
4. For Backend: Deploy the `backend/` directory using the Docker environment. Provide environment variables for `MONGODB_URI` and `JWT_SECRET`.
