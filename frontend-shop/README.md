# Almaeng Shop Frontend

React-based frontend for shop management interface.

## Setup

1. Install dependencies:
   ```bash
   cd frontend-shop
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

   The app will run on [http://localhost:3000](http://localhost:3000)

   **Note:** To run both frontends simultaneously, you'll need to change the port for one of them.
   You can set the PORT environment variable:
   ```bash
   PORT=3001 npm start
   ```

## Project Structure

```
frontend-shop/
├── public/           # Static files
├── src/
│   ├── components/   # Reusable React components
│   ├── pages/        # Page components
│   ├── services/     # API and external service integrations
│   ├── utils/        # Utility functions
│   ├── assets/       # Images, fonts, etc.
│   ├── App.js        # Main application component
│   └── index.js      # Application entry point
└── package.json
```

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
