# Lively Travel Planner

A comprehensive full-stack web application for planning personalized travel itineraries. Users can create customized trip plans based on their traveler profile, with automatic generation of day-by-day activities, meal suggestions, and reservation recommendations.

## Features

### 🎯 Traveler Profiles
- **Mobility-Conscious Traveler**: Wheelchair accessible routes, minimal walking, convenient transportation
- **Family with Young Children**: Kid-friendly activities, shorter durations, nap times, family restaurants
- **Foodie / Culinary Explorer**: Local cuisine focus, food tours, cooking classes, restaurant reservations
- **Adventure / Active Traveler**: High-energy outdoor activities, hiking, biking, early starts
- **Cultural Enthusiast / History Buff**: Museums, galleries, historic landmarks, guided tours

### 🚀 Core Functionality
- **Trip Planning**: Enter destinations, travel dates, group size, and budget
- **Automatic Itinerary Generation**: AI-powered day-by-day planning based on traveler profile
- **Activity Management**: Morning, afternoon, and evening activity scheduling
- **Reservation Tracking**: Restaurant, tour, and accommodation reservation management
- **Customization**: Edit and personalize generated itineraries

### 🛠 Technology Stack
- **Frontend**: React 18, Material-UI, React Router, Axios
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: PostgreSQL with structured models for trips, activities, and reservations
- **Security**: Helmet, CORS, Rate Limiting, BCrypt password hashing

## Project Structure

```
livelytravelplanner/
├── client/                 # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── pages/          # Page components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend API
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── scripts/          # Database setup scripts
│   ├── services/         # Business logic services
│   ├── index.js
│   └── package.json
├── .github/
│   └── copilot-instructions.md
├── package.json           # Root package.json for scripts
└── README.md
```

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 16 or higher)
- **PostgreSQL** (version 12 or higher)
- **npm** or **yarn** package manager

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install all dependencies (root, server, and client)
npm run install-deps
```

### 2. Database Setup

1. **Create PostgreSQL Database**:
   - Make sure PostgreSQL is running on your system
   - Create a database named `travel_planner` (or your preferred name)

2. **Configure Environment Variables**:
   ```bash
   # Copy the example environment file
   cd server
   cp .env.example .env
   
   # Edit .env with your database credentials
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=travel_planner
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Initialize Database**:
   ```bash
   # Run database setup script
   npm run setup-db
   ```

   This will:
   - Create all necessary tables (users, traveler_profiles, trips, itinerary_days, activities, reservations)
   - Insert default traveler profiles
   - Set up indexes for performance

### 3. Running the Application

#### Development Mode (Recommended)
```bash
# Start both frontend and backend concurrently
npm run dev
```

This will start:
- **Backend server** on `http://localhost:5000`
- **Frontend application** on `http://localhost:3000`

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the backend server
npm run server
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Trip Management
- `GET /api/trips` - Get user's trips
- `POST /api/trips` - Create new trip with auto-generated itinerary
- `GET /api/trips/:id` - Get trip details with full itinerary
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Traveler Profiles
- `GET /api/profiles` - Get all traveler profiles
- `GET /api/profiles/:id` - Get specific profile

### Activities & Reservations
- `GET /api/activities/day/:dayId` - Get activities for a day
- `POST /api/activities` - Create new activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

## Database Schema

### Key Tables

**users**
- User authentication and profile information

**traveler_profiles**
- Predefined traveler types with preferences and constraints

**trips**
- Main trip information linking users to their planned trips

**itinerary_days**
- Individual days within a trip

**activities**
- Specific activities scheduled for each day

**reservations**
- Reservation details for activities requiring bookings

## Development Scripts

```bash
# Root level scripts
npm run dev              # Start frontend and backend
npm run install-deps     # Install all dependencies
npm run setup-db         # Setup database

# Server scripts
cd server
npm run dev              # Start backend with nodemon
npm run start            # Start backend (production)

# Client scripts
cd client
npm start                # Start frontend development server
npm run build            # Build for production
npm test                 # Run tests
```

## Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=travel_planner
DB_USER=your_username
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_jwt_secret_key

# External APIs (optional)
GOOGLE_MAPS_API_KEY=your_api_key
AMADEUS_API_KEY=your_api_key
```

## Features in Detail

### Itinerary Generation
The application automatically generates itineraries based on:
- **Traveler Profile**: Activities tailored to mobility needs, family requirements, food preferences, etc.
- **Trip Duration**: Appropriate number of activities per day
- **Time Slots**: Morning, afternoon, and evening activity distribution
- **Budget Considerations**: Cost-appropriate activity suggestions
- **Accessibility**: Wheelchair access, family-friendly venues, fitness requirements

### Security Features
- JWT-based authentication
- Password hashing with BCrypt
- Rate limiting to prevent abuse
- CORS configuration
- Input validation and sanitization
- SQL injection prevention

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- **External API Integration**: Google Maps, booking platforms, weather data
- **Real-time Collaboration**: Multiple users planning together
- **Mobile Application**: React Native companion app
- **AI Recommendations**: Machine learning for better activity suggestions
- **Social Features**: Trip sharing and reviews
- **Offline Mode**: Downloadable itineraries for offline access

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Lively Travel Planner** - Making travel planning effortless and personalized! ✈️🗺️