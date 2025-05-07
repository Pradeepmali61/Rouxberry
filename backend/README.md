
# OverlaySnow Clone Backend

This is the backend API for the OverlaySnow clone project. It's built with FastAPI and provides RESTful endpoints for managing products, categories, users, orders, and more.

## Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

### Running the API

```bash
uvicorn main:app --reload
```

This will start the API server at `http://localhost:8000`.

## API Documentation

Once the server is running, you can access the auto-generated API documentation:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Default Users

For testing purposes, a default admin user is created:

- Email: admin@example.com
- Password: admin123

## API Endpoints

### Auth
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Register
- GET `/api/auth/me` - Get current user info

### Categories
- GET `/api/categories` - Get all categories
- GET `/api/categories/{category_id}` - Get category by ID
- POST `/api/categories` - Create new category (admin only)
- PUT `/api/categories/{category_id}` - Update category (admin only)
- DELETE `/api/categories/{category_id}` - Delete category (admin only)

### Products
- GET `/api/products` - Get all products (with filtering, sorting, and pagination)
- GET `/api/products/{product_id}` - Get product by ID
- GET `/api/products/category/{category_id}` - Get products by category
- POST `/api/products` - Create new product (admin only)
- PUT `/api/products/{product_id}` - Update product (admin only)
- DELETE `/api/products/{product_id}` - Delete product (admin only)

### Cart
- GET `/api/cart` - Get user's cart
- POST `/api/cart/items` - Add item to cart
- PUT `/api/cart/items/{item_id}` - Update cart item quantity
- DELETE `/api/cart/items/{item_id}` - Remove item from cart
- DELETE `/api/cart/clear` - Clear cart

### Orders
- GET `/api/orders` - Get user's orders (or all orders for admin)
- GET `/api/orders/{order_id}` - Get order by ID
- POST `/api/orders` - Create new order from cart items
- PUT `/api/orders/{order_id}` - Update order status (admin only)
- DELETE `/api/orders/{order_id}` - Delete order (admin only)

### Analytics (admin only)
- GET `/api/analytics/sales` - Get sales analytics
- GET `/api/analytics/best-sellers` - Get best-selling products

## Data Storage

This sample project uses in-memory data storage. In a production environment, you should replace this with a proper database like PostgreSQL or MongoDB.
