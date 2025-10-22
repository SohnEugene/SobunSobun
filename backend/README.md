# Almaeng Backend

Node.js + Express backend server for the Almaeng web application.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── routes/       # API route definitions
│   ├── controllers/  # Request handlers
│   ├── models/       # Database models
│   ├── middleware/   # Custom middleware
│   ├── config/       # Configuration files
│   └── server.js     # Main application file
├── tests/            # Test files
└── package.json
```

## API Endpoints

(To be documented as routes are implemented)

- `GET /` - API health check

## Deployment

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed deployment instructions to Railway.
