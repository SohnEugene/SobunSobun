# 25-2 창의연구실습 인피니티 알맹

Almaeng Web Application - Customer and Shop Management Platform

## Project Structure

```
Almaeng2/
├── backend/              # Node.js + Express backend server
├── frontend-customer/    # React frontend for customer interface
├── frontend-shop/        # React frontend for shop management interface
└── README.md
```

## Technology Stack

- **Backend:** Node.js, Express.js
- **Frontend:** React, React Router
- **API Communication:** Axios
- **Database:** (To be configured)

## Continuous Deployment

- Continuous Deployment (CD) is enabled for this project.  
- Whenever changes are pushed to the `main` branch, the project is automatically deployed.

**Backend**  
- The backend is deployed via Railway.  
- Live API: https://almaeng2-production.up.railway.app/  
- HTTP call logs can be monitored from the [Logs tab](https://railway.com/project/cf680da0-3fcc-4bd2-91d8-f11d0f1dc935/logs?environmentId=a0901102-d5a5-4b5a-a3a0-99d53ff19713)

**Frontend**  
- The frontend is deployed via Vercel.  
- Currently, only the customer service is deployed.  
- Live site: https://almaeng2.vercel.app/

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

#### 1. Backend Server

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend will run on `http://localhost:5000`

#### 2. Customer Frontend

```bash
cd frontend-customer
npm install
npm start
```

Customer app will run on `http://localhost:3000`

#### 3. Shop Frontend

```bash
cd frontend-shop
npm install
PORT=3001 npm start
```

Shop app will run on `http://localhost:3001`

## Development

- Backend API endpoints will be available at `http://localhost:5000/api`
- Both frontends are configured to proxy API requests to the backend
- Each application has its own README with more detailed instructions

## Next Steps

1. Set up database (PostgreSQL/MongoDB)
2. Implement authentication system
3. Create API endpoints for products, customers, and shops
4. Build UI components for both interfaces
5. Connect frontend to backend APIs

## Contributing

See individual README files in each directory for development guidelines.
