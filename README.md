# Travel Planner - Spring Boot + Angular

A full-stack travel planning application built with Spring Boot backend and Angular frontend.

## Architecture

- **Backend**: Spring Boot with Maven, Spring Web, Spring Data JPA, H2 Database
- **Frontend**: Angular with TypeScript
- **Communication**: RESTful APIs

## Project Structure

```
travel-planner/
├── backend/                 # Spring Boot application
│   ├── src/main/java/       # Java source code
│   │   └── com/travelplanner/
│   │       ├── TravelPlannerApplication.java
│   │       ├── entity/      # JPA entities
│   │       ├── repository/  # Data repositories
│   │       ├── service/     # Business logic
│   │       └── controller/  # REST controllers
│   ├── src/main/resources/  # Configuration files
│   └── pom.xml             # Maven dependencies
└── frontend/               # Angular application
    ├── src/app/            # Angular components
    ├── angular.json        # Angular CLI configuration
    ├── package.json        # NPM dependencies
    └── tsconfig.json       # TypeScript configuration
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- Maven 3.6 or higher
- Angular CLI (`npm install -g @angular/cli`)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies and run:
   ```bash
   mvn spring-boot:run
   ```

3. The backend will start on http://localhost:8080

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. The frontend will start on http://localhost:4200

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/{id}` - Get trip by ID
- `PUT /api/trips/{id}` - Update trip
- `DELETE /api/trips/{id}` - Delete trip
- `GET /api/trips/search?destination={name}` - Search trips by destination
- `GET /api/trips/upcoming` - Get upcoming trips

## Database

The application uses H2 in-memory database for development. You can access the H2 console at:
http://localhost:8080/api/h2-console

- **JDBC URL**: `jdbc:h2:mem:travelplanner`
- **Username**: `sa`
- **Password**: (empty)

## Development

### Running Both Services

1. Start the backend in one terminal:
   ```bash
   cd backend && mvn spring-boot:run
   ```

2. Start the frontend in another terminal:
   ```bash
   cd frontend && ng serve
   ```

3. Access the application at http://localhost:4200

## Features

- ✅ Create, read, update, delete trips
- ✅ Search trips by destination
- ✅ View upcoming trips
- ✅ Responsive UI with Angular
- ✅ RESTful API with Spring Boot
- ✅ In-memory H2 database
- ✅ CORS configuration for frontend-backend communication

## Next Steps

- Add user authentication
- Implement trip activities and itineraries
- Add file upload for trip photos
- Integrate with external APIs (weather, maps)
- Add email notifications
- Deploy to cloud platform