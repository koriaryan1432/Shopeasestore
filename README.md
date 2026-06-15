# ShopEase — Full-Stack E-Commerce App

A simple full-stack e-commerce application built for portfolio/DevOps purposes:
browse products, register/login, manage a cart, and place orders.

## Tech stack

- **Frontend**: React 18 (Vite) + React Router, served via Nginx in production
- **Backend**: Node.js + Express REST API, JWT authentication
- **Database**: MySQL 8
- **Containerization**: Docker + Docker Compose (3 services: db, backend, frontend)

## Project structure

```
ecommerce-app/
├── backend/                # Express REST API
│   ├── src/
│   │   ├── config/db.js        # MySQL connection pool
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/          # JWT auth middleware
│   │   ├── routes/               # API routes
│   │   └── server.js            # App entry point
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── api/axios.js         # Axios instance (baseURL: /api)
│   │   ├── context/              # Auth + Cart context providers
│   │   ├── components/           # Navbar, ProductCard, ProtectedRoute
│   │   ├── pages/                 # Home, ProductDetail, Cart, Login, etc.
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile          # Multi-stage build -> Nginx
│   ├── nginx.conf          # SPA routing + /api proxy to backend
│   └── package.json
├── database/
│   └── init.sql            # Schema + seed data (auto-run on first container start)
├── docker-compose.yml
└── .env.example
```

## Database schema

- `users` — id, name, email, password (bcrypt hash), role
- `categories` — id, name
- `products` — id, name, description, price, image_url, category_id, stock
- `cart_items` — per-user cart (user_id, product_id, quantity)
- `orders` — id, user_id, total_amount, status, shipping_address
- `order_items` — line items for each order

Seed data includes 4 categories and 12 sample products.

## API endpoints

| Method | Endpoint                | Auth required | Description                  |
|--------|-------------------------|----------------|------------------------------|
| POST   | /api/auth/register      | No             | Create a new user account    |
| POST   | /api/auth/login         | No             | Login, returns JWT           |
| GET    | /api/products           | No             | List products (filters: `category`, `search`) |
| GET    | /api/products/:id       | No             | Get single product            |
| GET    | /api/products/categories| No             | List categories               |
| POST   | /api/products           | Admin          | Create a product               |
| GET    | /api/cart                | Yes            | Get current user's cart        |
| POST   | /api/cart                | Yes            | Add item to cart                |
| PUT    | /api/cart/:id            | Yes            | Update cart item quantity       |
| DELETE | /api/cart/:id            | Yes            | Remove item from cart           |
| POST   | /api/orders              | Yes            | Place an order from the cart    |
| GET    | /api/orders              | Yes            | Get order history               |

## Running with Docker Compose (recommended)

1. Copy the environment file and adjust secrets:
   ```bash
   cp .env.example .env
   ```

2. Build and start all three containers:
   ```bash
   docker compose up --build
   ```

3. Open the app:
   - Frontend: http://localhost
   - Backend API (direct): http://localhost:5000/api/health
   - MySQL: localhost:3306

The `database/init.sql` script runs automatically the first time the `db`
container starts, creating the schema and seeding sample products.

To stop everything:
```bash
docker compose down
```

To wipe the database volume too (fresh re-seed on next start):
```bash
docker compose down -v
```

## Running locally without Docker (development)

**Database**
- Install MySQL locally and run `database/init.sql` against it.

**Backend**
```bash
cd backend
cp .env.example .env   # set DB_HOST=localhost and your local MySQL credentials
npm install
npm run dev            # runs on http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev             # runs on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so
the frontend and backend can run independently during development.

## Notes for deployment / DevOps practice

- Each service (`frontend`, `backend`, `db`) has its own Dockerfile and can be
  built/pushed to Docker Hub independently.
- The frontend Dockerfile uses a multi-stage build (Node to build, Nginx to serve).
- The backend exposes `/api/health` for use in container healthchecks or an
  ALB/Load Balancer target group.
- Environment variables (`JWT_SECRET`, `DB_PASSWORD`, etc.) are externalized
  via `.env` — don't commit a real `.env` file.
- Good next steps for a DevOps portfolio: push images to Docker Hub, add a
  CI/CD pipeline (build, test, push, deploy), deploy to ECS/EKS or a single
  EC2 instance behind an ALB, and add Terraform for the infrastructure.
