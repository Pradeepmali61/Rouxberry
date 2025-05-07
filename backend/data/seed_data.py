
"""
Seed data for the application.
This can be imported and used to populate the database with initial data.
"""

categories = [
    {
        "id": "cat_tshirt",
        "name": "T-Shirts",
        "description": "Comfortable and stylish t-shirts for everyday wear",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "cat_shirt",
        "name": "Shirts",
        "description": "Elegant shirts for formal and casual occasions",
        "image": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "cat_pants",
        "name": "Pants",
        "description": "Comfortable and durable pants for all occasions",
        "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
]

products = [
    {
        "id": "prod_tshirt_1",
        "name": "Classic Cotton T-Shirt",
        "description": "A timeless classic, this comfortable 100% cotton t-shirt is perfect for everyday wear. Features a relaxed fit and soft fabric that gets better with each wash.",
        "price": 24.99,
        "category": "cat_tshirt",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "isNew": True,
        "isFeatured": True,
        "stock": 100
    },
    {
        "id": "prod_tshirt_2",
        "name": "Graphic Print T-Shirt",
        "description": "Express your unique style with our graphic print t-shirt. Made with premium cotton and featuring an original design that's sure to turn heads.",
        "price": 29.99,
        "category": "cat_tshirt",
        "image": "https://images.unsplash.com/photo-1554568218-0f1715e72254?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "isNew": False,
        "isFeatured": True,
        "stock": 75
    },
    {
        "id": "prod_shirt_1",
        "name": "Oxford Button-Down Shirt",
        "description": "A wardrobe essential, our Oxford button-down shirt is crafted from premium cotton with a slight texture. Perfect for both casual and semi-formal occasions.",
        "price": 59.99,
        "category": "cat_shirt",
        "image": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "isNew": True,
        "isFeatured": False,
        "stock": 50
    },
    {
        "id": "prod_shirt_2",
        "name": "Slim Fit Dress Shirt",
        "description": "Look your best with our slim fit dress shirt. Tailored to perfection with a modern cut that flatters your physique while providing comfort and ease of movement.",
        "price": 69.99,
        "category": "cat_shirt",
        "image": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "isNew": False,
        "isFeatured": True,
        "stock": 40
    },
    {
        "id": "prod_pants_1",
        "name": "Classic Chino Pants",
        "description": "Our classic chino pants offer timeless style and all-day comfort. Made from durable cotton twill with a hint of stretch for ease of movement.",
        "price": 49.99,
        "category": "cat_pants",
        "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "isNew": True,
        "isFeatured": True,
        "stock": 60
    },
    {
        "id": "prod_pants_2",
        "name": "Slim Fit Jeans",
        "description": "These premium slim fit jeans combine style and comfort with just the right amount of stretch. Perfect for casual everyday wear or a night out.",
        "price": 59.99,
        "category": "cat_pants",
        "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "isNew": False,
        "isFeatured": False,
        "stock": 70
    }
]

users = [
    {
        "id": "user_admin",
        "email": "admin@example.com",
        "password": "admin123",  # In a real application, this would be hashed
        "name": "Admin User",
        "is_admin": True
    },
    {
        "id": "user_customer",
        "email": "customer@example.com",
        "password": "customer123",  # In a real application, this would be hashed
        "name": "Test Customer",
        "is_admin": False
    }
]
