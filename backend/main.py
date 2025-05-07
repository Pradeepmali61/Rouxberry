
"""
Main FastAPI application file with API endpoints.
"""

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import jwt
import uuid
from passlib.context import CryptContext
from pydantic import BaseModel
from data.seed_data import categories, products, users

app = FastAPI(title="OverlaySnow API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your_secret_key"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# In-memory database
db = {
    "users": users,
    "categories": categories,
    "products": products,
    "carts": [],
    "orders": []
}

# --- Models ---
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    is_admin: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class CartItem(BaseModel):
    product_id: str
    quantity: int

class CartItemUpdate(BaseModel):
    quantity: int

class OrderCreate(BaseModel):
    cart_items: List[CartItem]
    shipping_address: Dict[str, Any]
    payment_method: str

# --- Authentication ---
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(email: str, password: str):
    user = next((u for u in db["users"] if u["email"] == email), None)
    if not user or not verify_password(password, user.get("password", "")):
        return False
    return user

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise credentials_exception
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    if user is None:
        raise credentials_exception
    
    return user

# --- Endpoints ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the OverlaySnow API"}

# Auth endpoints
@app.post("/api/auth/register")
def register(user: UserCreate):
    # Check if email already exists
    if any(u["email"] == user.email for u in db["users"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with hashed password
    new_user = {
        "id": f"user_{uuid.uuid4().hex}",
        "name": user.name,
        "email": user.email,
        "password": get_password_hash(user.password),
        "is_admin": False
    }
    
    db["users"].append(new_user)
    
    # Create access token
    access_token = create_access_token({"sub": new_user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user["id"],
            "name": new_user["name"],
            "email": new_user["email"],
            "is_admin": new_user["is_admin"]
        }
    }

@app.post("/api/auth/login")
def login(user_data: UserLogin):
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token({"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "is_admin": user["is_admin"]
        }
    }

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "is_admin": current_user["is_admin"]
    }

# Categories endpoints
@app.get("/api/categories")
def get_categories():
    return db["categories"]

@app.get("/api/categories/{category_id}")
def get_category(category_id: str):
    category = next((c for c in db["categories"] if c["id"] == category_id), None)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

# Products endpoints
@app.get("/api/products")
def get_products(
    page: int = 1,
    limit: int = 12,
    sort: str = "newest",
    search: Optional[str] = None,
    category: Optional[str] = None
):
    filtered_products = db["products"]
    
    # Filter by category if specified
    if category:
        filtered_products = [p for p in filtered_products if p["category"] == category]
    
    # Filter by search term if specified
    if search:
        search_lower = search.lower()
        filtered_products = [
            p for p in filtered_products if 
            search_lower in p["name"].lower() or 
            search_lower in p["description"].lower()
        ]
    
    # Sort products
    if sort == "price_low":
        filtered_products = sorted(filtered_products, key=lambda p: p["price"])
    elif sort == "price_high":
        filtered_products = sorted(filtered_products, key=lambda p: p["price"], reverse=True)
    elif sort == "popular":
        # For demo purposes, just randomize
        import random
        random.shuffle(filtered_products)
    else:  # "newest" as default
        # For demo purposes, just use the original order
        pass
    
    # Calculate pagination
    total_items = len(filtered_products)
    total_pages = max(1, (total_items + limit - 1) // limit)
    page = min(max(1, page), total_pages)
    
    start_idx = (page - 1) * limit
    end_idx = min(start_idx + limit, total_items)
    
    paginated_products = filtered_products[start_idx:end_idx]
    
    return {
        "items": paginated_products,
        "page": page,
        "limit": limit,
        "totalItems": total_items,
        "totalPages": total_pages
    }

@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    product = next((p for p in db["products"] if p["id"] == product_id), None)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

# Cart endpoints
@app.get("/api/cart")
def get_cart(current_user: dict = Depends(get_current_user)):
    cart = next((c for c in db["carts"] if c["user_id"] == current_user["id"]), None)
    
    if not cart:
        # Create empty cart if none exists
        cart = {
            "id": f"cart_{uuid.uuid4().hex}",
            "user_id": current_user["id"],
            "items": []
        }
        db["carts"].append(cart)
    
    # Calculate cart totals and add product details
    items_with_details = []
    total = 0
    
    for item in cart["items"]:
        product = next((p for p in db["products"] if p["id"] == item["product_id"]), None)
        if product:
            item_with_details = {
                "id": item["id"],
                "product": product,
                "quantity": item["quantity"],
                "subtotal": product["price"] * item["quantity"]
            }
            items_with_details.append(item_with_details)
            total += item_with_details["subtotal"]
    
    return {
        "id": cart["id"],
        "items": items_with_details,
        "total": total,
        "itemCount": sum(item["quantity"] for item in cart["items"])
    }

@app.post("/api/cart/items")
def add_to_cart(item: CartItem, current_user: dict = Depends(get_current_user)):
    # Check if product exists
    product = next((p for p in db["products"] if p["id"] == item.product_id), None)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user has a cart
    cart = next((c for c in db["carts"] if c["user_id"] == current_user["id"]), None)
    
    if not cart:
        # Create new cart if none exists
        cart = {
            "id": f"cart_{uuid.uuid4().hex}",
            "user_id": current_user["id"],
            "items": []
        }
        db["carts"].append(cart)
    
    # Check if product already in cart
    existing_item = next((i for i in cart["items"] if i["product_id"] == item.product_id), None)
    
    if existing_item:
        # Update quantity if item exists
        existing_item["quantity"] += item.quantity
    else:
        # Add new item
        cart["items"].append({
            "id": f"item_{uuid.uuid4().hex}",
            "product_id": item.product_id,
            "quantity": item.quantity
        })
    
    return {"message": "Item added to cart"}

# Add other endpoints as needed - orders, analytics, etc.

# Run the application with:
# uvicorn main:app --reload
