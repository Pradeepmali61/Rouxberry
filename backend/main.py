
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from uuid import uuid4, UUID
import json

app = FastAPI(title="OverlaySnow API")

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://overlaysnow-clone.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = "YOUR_SECRET_KEY_HERE"  # In production, store this in environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Data models
class User(BaseModel):
    id: str
    email: str
    name: str
    password_hash: str
    role: str = "user"
    created_at: datetime = datetime.now()

class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[str] = None

class Category(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime = datetime.now()

class Product(BaseModel):
    id: str
    name: str
    description: str
    short_description: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    image: str
    category_id: str
    features: Optional[List[str]] = []
    specifications: Optional[List[Dict[str, str]]] = []
    is_featured: bool = False
    is_new: bool = False
    rating: Optional[float] = None
    review_count: Optional[int] = None
    created_at: datetime = datetime.now()

class CartItem(BaseModel):
    id: str
    user_id: str
    product_id: str
    quantity: int
    created_at: datetime = datetime.now()

class Order(BaseModel):
    id: str
    user_id: str
    items: List[Dict[str, Any]]
    total: float
    status: str = "pending"
    created_at: datetime = datetime.now()

# In-memory database (replace with a real database in production)
users_db = {}
categories_db = {}
products_db = {}
cart_items_db = {}
orders_db = {}

# Initialize with some data
def init_sample_data():
    # Create a test admin user
    admin_id = str(uuid4())
    admin_password = "admin123"
    admin_password_hash = pwd_context.hash(admin_password)
    users_db[admin_id] = User(
        id=admin_id,
        email="admin@example.com",
        name="Admin User",
        password_hash=admin_password_hash,
        role="admin"
    )

    # Create some categories
    category_ids = []
    categories = [
        {"name": "Stream Overlays", "description": "Professional overlays for your stream"},
        {"name": "Social Media", "description": "Templates for social media posts"},
        {"name": "Animated", "description": "Animated graphics and transitions"},
        {"name": "Bundle Packs", "description": "Get multiple products at a discount"}
    ]
    for category in categories:
        cat_id = str(uuid4())
        category_ids.append(cat_id)
        categories_db[cat_id] = Category(
            id=cat_id,
            name=category["name"],
            description=category["description"],
            image=f"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&h=500&fit=crop"
        )

    # Create some products
    products = [
        {
            "name": "Stream Starter Pack",
            "description": "Everything you need to get your stream looking professional.",
            "short_description": "Complete overlay package for new streamers",
            "price": 49.99,
            "category_id": category_ids[0],
            "is_featured": True
        },
        {
            "name": "Premium Gaming Overlay",
            "description": "High-end overlay designed specifically for gaming streams.",
            "short_description": "Take your gaming stream to the next level",
            "price": 39.99,
            "compare_price": 59.99,
            "category_id": category_ids[0],
            "is_new": True
        },
        {
            "name": "Social Media Bundle",
            "description": "Templates for Instagram, Twitter, and Facebook posts.",
            "short_description": "Consistent branding across all platforms",
            "price": 29.99,
            "category_id": category_ids[1],
            "is_featured": True
        },
        {
            "name": "Animated Stream Transitions",
            "description": "Smooth animations to transition between scenes.",
            "short_description": "Professional scene transitions",
            "price": 19.99,
            "category_id": category_ids[2],
            "is_new": True
        },
        {
            "name": "Complete Stream Package",
            "description": "The ultimate bundle with overlays, transitions, alerts and more.",
            "short_description": "All-in-one streaming solution",
            "price": 89.99,
            "compare_price": 129.99,
            "category_id": category_ids[3],
            "is_featured": True
        },
        {
            "name": "Alert Box Bundle",
            "description": "Custom alerts for subscribers, donations and followers.",
            "short_description": "Engage your audience with custom alerts",
            "price": 24.99,
            "category_id": category_ids[0]
        },
        {
            "name": "YouTube Thumbnail Pack",
            "description": "Eye-catching thumbnail templates for YouTube videos.",
            "short_description": "Increase your click-through rate",
            "price": 19.99,
            "category_id": category_ids[1]
        },
        {
            "name": "Logo Animation",
            "description": "Custom animation for your brand logo.",
            "short_description": "Make your brand memorable",
            "price": 34.99,
            "category_id": category_ids[2]
        }
    ]

    for product in products:
        prod_id = str(uuid4())
        products_db[prod_id] = Product(
            id=prod_id,
            name=product["name"],
            description=product["description"],
            short_description=product["short_description"],
            price=product["price"],
            compare_price=product.get("compare_price"),
            image=f"https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=300&fit=crop",
            category_id=product["category_id"],
            is_featured=product.get("is_featured", False),
            is_new=product.get("is_new", False),
            features=["High resolution graphics", "Fully customizable", "Easy installation", "Compatible with popular streaming software"],
            specifications=[
                {"name": "Format", "value": "PNG/PSD"},
                {"name": "Resolution", "value": "1920x1080"},
                {"name": "File Size", "value": "25MB"}
            ],
            rating=4.8,
            review_count=24
        )

init_sample_data()

# Security functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(email: str, password: str):
    user = next((u for u in users_db.values() if u.email == email), None)
    if not user or not verify_password(password, user.password_hash):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = users_db.get(user_id)
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource",
        )
    return current_user

# API Routes
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# Auth endpoints
@app.post("/api/auth/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register", response_model=Token)
async def register_user(user_data: UserCreate):
    # Check if email already exists
    if any(u.email == user_data.email for u in users_db.values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    user_id = str(uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password
    )
    
    users_db[user_id] = new_user
    
    # Generate token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id, "role": "user"}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role
    )

# Category endpoints
@app.get("/api/categories")
async def get_all_categories():
    return list(categories_db.values())

@app.get("/api/categories/{category_id}")
async def get_category_by_id(category_id: str):
    if category_id not in categories_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return categories_db[category_id]

@app.post("/api/categories", status_code=status.HTTP_201_CREATED)
async def create_category(category_data: dict, current_user: User = Depends(get_admin_user)):
    category_id = str(uuid4())
    new_category = Category(
        id=category_id,
        name=category_data["name"],
        description=category_data.get("description"),
        image=category_data.get("image")
    )
    categories_db[category_id] = new_category
    return new_category

@app.put("/api/categories/{category_id}")
async def update_category(category_id: str, category_data: dict, current_user: User = Depends(get_admin_user)):
    if category_id not in categories_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    category = categories_db[category_id]
    
    for key, value in category_data.items():
        if hasattr(category, key):
            setattr(category, key, value)
    
    categories_db[category_id] = category
    return category

@app.delete("/api/categories/{category_id}")
async def delete_category(category_id: str, current_user: User = Depends(get_admin_user)):
    if category_id not in categories_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    del categories_db[category_id]
    return {"detail": "Category deleted"}

# Product endpoints
@app.get("/api/products")
async def get_all_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
    featured: Optional[bool] = None,
    exclude: Optional[str] = None
):
    filtered_products = list(products_db.values())
    
    # Apply filters
    if category:
        filtered_products = [p for p in filtered_products if p.category_id == category]
    
    if search:
        search_lower = search.lower()
        filtered_products = [
            p for p in filtered_products 
            if search_lower in p.name.lower() or 
               (p.description and search_lower in p.description.lower())
        ]
    
    if featured is not None:
        filtered_products = [p for p in filtered_products if p.is_featured == featured]
        
    if exclude:
        filtered_products = [p for p in filtered_products if p.id != exclude]
    
    # Apply sorting
    if sort:
        if sort == "price_low":
            filtered_products.sort(key=lambda p: p.price)
        elif sort == "price_high":
            filtered_products.sort(key=lambda p: p.price, reverse=True)
        elif sort == "newest":
            filtered_products.sort(key=lambda p: p.created_at, reverse=True)
        elif sort == "popular":
            filtered_products.sort(key=lambda p: p.rating or 0, reverse=True)
    
    # Calculate pagination
    total = len(filtered_products)
    total_pages = (total + limit - 1) // limit  # Ceiling division
    
    # Apply pagination
    start_idx = (page - 1) * limit
    end_idx = min(start_idx + limit, total)
    paged_products = filtered_products[start_idx:end_idx]
    
    # Add category information to each product
    for product in paged_products:
        if product.category_id in categories_db:
            category = categories_db[product.category_id]
            product_dict = product.dict()
            product_dict["category"] = {"id": category.id, "name": category.name}
            setattr(product, "category", {"id": category.id, "name": category.name})
    
    if limit == -1:  # Return all products without pagination
        return paged_products
    
    return {
        "items": paged_products,
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": total_pages
    }

@app.get("/api/products/{product_id}")
async def get_product_by_id(product_id: str):
    if product_id not in products_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product = products_db[product_id]
    
    # Add category information
    if product.category_id in categories_db:
        category = categories_db[product.category_id]
        setattr(product, "category", {"id": category.id, "name": category.name})
    
    return product

@app.get("/api/products/category/{category_id}")
async def get_products_by_category(category_id: str):
    if category_id not in categories_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    category_products = [p for p in products_db.values() if p.category_id == category_id]
    return category_products

@app.post("/api/products", status_code=status.HTTP_201_CREATED)
async def create_product(product_data: dict, current_user: User = Depends(get_admin_user)):
    # Validate category_id
    if product_data["category_id"] not in categories_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID"
        )
    
    product_id = str(uuid4())
    new_product = Product(
        id=product_id,
        name=product_data["name"],
        description=product_data["description"],
        price=product_data["price"],
        image=product_data["image"],
        category_id=product_data["category_id"],
        short_description=product_data.get("short_description"),
        compare_price=product_data.get("compare_price"),
        features=product_data.get("features", []),
        specifications=product_data.get("specifications", []),
        is_featured=product_data.get("is_featured", False),
        is_new=product_data.get("is_new", False)
    )
    
    products_db[product_id] = new_product
    return new_product

@app.put("/api/products/{product_id}")
async def update_product(product_id: str, product_data: dict, current_user: User = Depends(get_admin_user)):
    if product_id not in products_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Validate category_id if provided
    if "category_id" in product_data and product_data["category_id"] not in categories_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID"
        )
    
    product = products_db[product_id]
    
    for key, value in product_data.items():
        if hasattr(product, key):
            setattr(product, key, value)
    
    products_db[product_id] = product
    return product

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_admin_user)):
    if product_id not in products_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    del products_db[product_id]
    return {"detail": "Product deleted"}

# Cart endpoints
@app.get("/api/cart")
async def get_user_cart(current_user: User = Depends(get_current_active_user)):
    user_id = current_user.id
    user_cart_items = [item for item in cart_items_db.values() if item.user_id == user_id]
    
    # Add product information to each cart item
    cart_response = []
    total = 0
    
    for item in user_cart_items:
        if item.product_id in products_db:
            product = products_db[item.product_id]
            item_total = product.price * item.quantity
            total += item_total
            
            cart_response.append({
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "image": product.image
                }
            })
    
    return {"items": cart_response, "total": total}

@app.post("/api/cart/items")
async def add_item_to_cart(item_data: dict, current_user: User = Depends(get_current_active_user)):
    user_id = current_user.id
    product_id = item_data["product_id"]
    quantity = item_data.get("quantity", 1)
    
    # Verify product exists
    if product_id not in products_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if item is already in cart
    existing_item = next(
        (item for item in cart_items_db.values() 
         if item.user_id == user_id and item.product_id == product_id),
        None
    )
    
    if existing_item:
        # Update quantity if already in cart
        existing_item.quantity += quantity
        return {"detail": "Item quantity updated in cart"}
    
    # Add new item to cart
    item_id = str(uuid4())
    new_cart_item = CartItem(
        id=item_id,
        user_id=user_id,
        product_id=product_id,
        quantity=quantity
    )
    
    cart_items_db[item_id] = new_cart_item
    return {"detail": "Item added to cart"}

@app.put("/api/cart/items/{item_id}")
async def update_cart_item(item_id: str, item_data: dict, current_user: User = Depends(get_current_active_user)):
    user_id = current_user.id
    
    if item_id not in cart_items_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    cart_item = cart_items_db[item_id]
    
    # Verify item belongs to user
    if cart_item.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this item"
        )
    
    quantity = item_data.get("quantity")
    if quantity is not None:
        cart_item.quantity = max(1, quantity)  # Ensure quantity is at least 1
    
    return {"detail": "Cart item updated"}

@app.delete("/api/cart/items/{item_id}")
async def remove_cart_item(item_id: str, current_user: User = Depends(get_current_active_user)):
    user_id = current_user.id
    
    if item_id not in cart_items_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    cart_item = cart_items_db[item_id]
    
    # Verify item belongs to user
    if cart_item.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to remove this item"
        )
    
    del cart_items_db[item_id]
    return {"detail": "Item removed from cart"}

@app.delete("/api/cart/clear")
async def clear_cart(current_user: User = Depends(get_current_active_user)):
    user_id = current_user.id
    
    # Find all items belonging to the user
    user_items = [item_id for item_id, item in cart_items_db.items() if item.user_id == user_id]
    
    # Remove them
    for item_id in user_items:
        del cart_items_db[item_id]
    
    return {"detail": "Cart cleared"}

# Order endpoints
@app.get("/api/orders")
async def get_user_orders(current_user: User = Depends(get_current_active_user)):
    user_id = current_user.id
    
    if current_user.role == "admin":
        # Admin can see all orders
        return list(orders_db.values())
    else:
        # Regular users can only see their own orders
        user_orders = [order for order in orders_db.values() if order.user_id == user_id]
        return user_orders

@app.get("/api/orders/{order_id}")
async def get_order_by_id(order_id: str, current_user: User = Depends(get_current_active_user)):
    if order_id not in orders_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    order = orders_db[order_id]
    
    # Verify user has access to this order
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )
    
    return order

@app.post("/api/orders", status_code=status.HTTP_201_CREATED)
async def create_order(order_data: dict, current_user: User = Depends(get_current_active_user)):
    user_id = current_user.id
    
    # Get user's cart
    user_cart_items = [item for item in cart_items_db.values() if item.user_id == user_id]
    
    if not user_cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Calculate total and create order items
    total = 0
    order_items = []
    
    for item in user_cart_items:
        if item.product_id in products_db:
            product = products_db[item.product_id]
            item_total = product.price * item.quantity
            total += item_total
            
            order_items.append({
                "product_id": item.product_id,
                "product_name": product.name,
                "quantity": item.quantity,
                "price": product.price,
                "total": item_total
            })
    
    # Create the order
    order_id = str(uuid4())
    new_order = Order(
        id=order_id,
        user_id=user_id,
        items=order_items,
        total=total,
        status=order_data.get("status", "pending")
    )
    
    orders_db[order_id] = new_order
    
    # Clear the user's cart after creating the order
    user_items = [item_id for item_id, item in cart_items_db.items() if item.user_id == user_id]
    for item_id in user_items:
        del cart_items_db[item_id]
    
    return new_order

@app.put("/api/orders/{order_id}")
async def update_order(order_id: str, order_data: dict, current_user: User = Depends(get_admin_user)):
    if order_id not in orders_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Only update allowed fields
    order = orders_db[order_id]
    
    if "status" in order_data:
        order.status = order_data["status"]
    
    return order

@app.delete("/api/orders/{order_id}")
async def delete_order(order_id: str, current_user: User = Depends(get_admin_user)):
    if order_id not in orders_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    del orders_db[order_id]
    return {"detail": "Order deleted"}

# Analytics endpoints (admin only)
@app.get("/api/analytics/sales")
async def get_sales_analytics(period: str = "month", current_user: User = Depends(get_admin_user)):
    # Generate some sample analytics data
    # In a real app, you would query the database for actual order data
    
    # Sample data for revenue over time
    revenue_data = []
    total_revenue = 0
    
    if period == "week":
        days = 7
        date_format = "%a"  # Day abbreviation (Mon, Tue, etc.)
    elif period == "month":
        days = 30
        date_format = "%d %b"  # Day and month abbreviation (01 Jan, 02 Jan, etc.)
    elif period == "quarter":
        days = 90
        date_format = "%b"  # Month abbreviation (Jan, Feb, etc.)
    else:  # year
        days = 12
        date_format = "%b"  # Month abbreviation (Jan, Feb, etc.)
    
    import random
    from datetime import timedelta
    
    # Generate sample data
    if period == "year":
        # For year, use months
        for i in range(days):
            date = (datetime.now() - timedelta(days=365-i*30)).strftime(date_format)
            revenue = random.uniform(5000, 15000)
            total_revenue += revenue
            revenue_data.append({"date": date, "revenue": round(revenue, 2)})
    else:
        # For other periods, use days
        for i in range(days):
            date = (datetime.now() - timedelta(days=days-i)).strftime(date_format)
            revenue = random.uniform(100, 1000)
            total_revenue += revenue
            revenue_data.append({"date": date, "revenue": round(revenue, 2)})
    
    # Sample metrics
    return {
        "totalRevenue": round(total_revenue, 2),
        "revenueGrowth": 12.5,
        "orderCount": 156,
        "orderGrowth": 8.2,
        "conversionRate": 3.2,
        "conversionChange": 0.5,
        "averageOrderValue": round(total_revenue / 156, 2),
        "aovGrowth": 4.1,
        "revenueOverTime": revenue_data
    }

@app.get("/api/analytics/best-sellers")
async def get_best_sellers(limit: int = 5, current_user: User = Depends(get_admin_user)):
    # Generate sample best selling products
    # In a real app, you would query the database for actual order data
    
    import random
    
    # Get a sample of products
    sample_products = list(products_db.values())
    random.shuffle(sample_products)
    
    best_sellers = []
    for i, product in enumerate(sample_products[:limit]):
        category_name = "Unknown"
        if product.category_id in categories_db:
            category_name = categories_db[product.category_id].name
            
        best_sellers.append({
            "id": product.id,
            "name": product.name,
            "category": category_name,
            "sales": random.randint(20, 100),
            "revenue": round(product.price * random.randint(20, 100), 2)
        })
    
    # Sort by revenue
    best_sellers.sort(key=lambda x: x["revenue"], reverse=True)
    
    return best_sellers

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
