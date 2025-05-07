
import { toast } from "@/components/ui/sonner";

// Base API URL - in production this would be an environment variable
const API_URL = "http://localhost:8000/api";

// Function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || 'An error occurred';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper to create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// API client
export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },
    register: async (userData: any) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: createHeaders(false),
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },
    me: async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
  },
  
  // Product endpoints
  products: {
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      }
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await fetch(`${API_URL}/products${query}`);
      return handleResponse(response);
    },
    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/products/${id}`);
      return handleResponse(response);
    },
    getByCategory: async (categoryId: string) => {
      const response = await fetch(`${API_URL}/products/category/${categoryId}`);
      return handleResponse(response);
    },
    create: async (productData: any) => {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(productData),
      });
      return handleResponse(response);
    },
    update: async (id: string, productData: any) => {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(productData),
      });
      return handleResponse(response);
    },
    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
  },
  
  // Category endpoints
  categories: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/categories`);
      return handleResponse(response);
    },
    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/categories/${id}`);
      return handleResponse(response);
    },
    create: async (categoryData: any) => {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(categoryData),
      });
      return handleResponse(response);
    },
    update: async (id: string, categoryData: any) => {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(categoryData),
      });
      return handleResponse(response);
    },
    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
  },
  
  // Order endpoints
  orders: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/orders`, {
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
    getById: async (id: string) => {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
    create: async (orderData: any) => {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(orderData),
      });
      return handleResponse(response);
    },
    update: async (id: string, orderData: any) => {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(orderData),
      });
      return handleResponse(response);
    },
    delete: async (id: string) => {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
  },
  
  // Cart operations
  cart: {
    get: async () => {
      const response = await fetch(`${API_URL}/cart`, {
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
    addItem: async (productId: string, quantity: number = 1) => {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      return handleResponse(response);
    },
    updateItem: async (itemId: string, quantity: number) => {
      const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify({ quantity }),
      });
      return handleResponse(response);
    },
    removeItem: async (itemId: string) => {
      const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
    clear: async () => {
      const response = await fetch(`${API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
  },
  
  // Admin analytics
  analytics: {
    getSales: async (period: string = 'month') => {
      const response = await fetch(`${API_URL}/analytics/sales?period=${period}`, {
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
    getBestSellers: async (limit: number = 5) => {
      const response = await fetch(`${API_URL}/analytics/best-sellers?limit=${limit}`, {
        headers: createHeaders(),
      });
      return handleResponse(response);
    },
  },
};

export default api;
