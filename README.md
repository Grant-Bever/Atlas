# Atlas V2

A comprehensive business management system with separate interfaces for managers, employees, and customers. Built with a modern JavaScript stack and deployed on Google Cloud Run. Made for the Applied AI in Software Development course at Marist University in the Spring Semester of 2025, taught by Professor Brian Gormanly. 

## Authors
Christian Sarmiento, Grant Bever, Chris Carolan

## Access Links
Employee View: https://employee-client-671804272646.us-east1.run.app <br>
Customer View: https://customer-client-671804272646.us-east1.run.app <br>
Manager View: https://manager-client-671804272646.us-east1.run.app <br>

## Project Overview

Atlas V2 is a modular application designed to manage various aspects of a business, including:

- **Inventory management**
- **Employee scheduling and timesheets**
- **Customer ordering**
- **Invoicing and billing**
- **Sales analytics**

The system consists of multiple microservices with dedicated frontends for different user roles.

## Architecture

The application is structured as follows:

### Backend
- **Manager Server**: Core API service that handles authentication, database operations, and business logic
- **Database**: PostgreSQL hosted on Google Cloud SQL

### Frontends
- **Manager Client**: Administration interface for owners and managers
- **Employee Client**: Interface for staff to manage timesheets and schedules
- **Customer Client**: Public-facing interface for customers to place orders

## Tech Stack

### Backend
- Node.js
- Express
- Sequelize ORM
- PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt for password hashing

### Frontend
- React
- React Router
- CSS/SASS for styling
- Fetch API for data fetching

### DevOps
- Docker for containerization
- Google Cloud Run for hosting
- Google Cloud SQL for database
- Google Cloud Build for CI/CD

## Directory Structure

```
AtlasV2/
├── manager/           # Manager application
│   ├── client/        # Manager frontend (React)
│   └── server/        # Main API server (Express)
├── employee/          # Employee application
│   └── client/        # Employee frontend (React)
├── customer/          # Customer application
│   └── customer/      # Customer frontend (React)
├── common/            # Shared code and utilities
│   ├── config/        # Common configuration
│   └── models/        # Shared data models
└── cloudbuild.yaml    # CI/CD configuration
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Docker (for local containerized development)
- PostgreSQL (local or remote)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AtlasV2.git
   cd AtlasV2
   ```

2. **Set up environment variables**
   Create a `.env` file in each service directory based on the `.env.example` templates.

3. **Install dependencies**
   ```bash
   # Install dependencies for manager server
   cd manager/server
   npm install

   # Install dependencies for manager client
   cd ../client
   npm install

   # Repeat for employee and customer clients
   ```

4. **Setup the database**
   ```bash
   cd manager/server
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. **Start the development servers**
   ```bash
   # Start the manager server
   cd manager/server
   npm run dev

   # In a new terminal, start the manager client
   cd manager/client
   npm start

   # Repeat for employee and customer clients
   ```

## API Configuration

Each client has a `utils/config.js` file where the API URL is defined:

```javascript
export const API_BASE_URL = 'https://manager-server-671804272646.us-east1.run.app';
```

Update this URL for local development or different environments.

## Deployment

The application is deployed to Google Cloud Run using Cloud Build.

### Manual Deployment Steps

1. **Build and push Docker images**
   ```bash
   gcloud builds submit --config=cloudbuild.yaml
   ```

2. **Run database migrations**
   ```bash
   # SSH into the server container
   gcloud run services ssh manager-server --region=us-east1
   
   # Run migrations
   cd /app
   npx sequelize-cli db:migrate
   ```

## Environment Variables

### Manager Server
```
PORT=3002
DB_NAME=atlas_db
DB_USER=atlas_user
DB_PASS=your_db_password
DB_HOST=/cloudsql/your-project:us-east1:atlas-db
JWT_SECRET=your_jwt_secret
```

### Frontend Clients
```
REACT_APP_API_URL=https://manager-server-671804272646.us-east1.run.app
```

## Common Issues and Troubleshooting

### API Connection Issues
- Check that CORS is properly configured in the server
- Verify the API_BASE_URL in each client's config.js file
- Ensure the server is running and accessible

### Authentication Problems
- JWT tokens expire after 24 hours by default
- Check browser console for detailed error messages
- Verify the JWT_SECRET is consistent across environments

### Timesheet Functionality
- The timesheet system requires proper date handling across time zones
- Employee clock-in/out events must be paired correctly
- Manager approval process requires submitted timesheets

## Feature Roadmap

- [ ] Advanced reporting and analytics
- [ ] Mobile app versions of all clients
- [ ] Integration with third-party payment processors
- [ ] Enhanced user permission system

## License

This project is licensed under the MIT License - see the LICENSE file for details. 