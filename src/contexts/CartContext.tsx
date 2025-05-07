
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { useAuth } from './AuthContext';

// Define types for cart items and cart
export interface CartItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Define cart context type
interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
}

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Calculate the total number of items in cart
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  // Load cart data when authenticated
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setCart({ items: [], total: 0 });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const cartData = await api.cart.get();
        setCart(cartData);
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Failed to load your cart');
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Add item to cart
  const addItem = async (productId: string, quantity: number = 1) => {
    try {
      setIsLoading(true);
      await api.cart.addItem(productId, quantity);
      const updatedCart = await api.cart.get();
      setCart(updatedCart);
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item quantity
  const updateItem = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      await api.cart.updateItem(itemId, quantity);
      const updatedCart = await api.cart.get();
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      await api.cart.removeItem(itemId);
      const updatedCart = await api.cart.get();
      setCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setIsLoading(true);
      await api.cart.clear();
      setCart({ items: [], total: 0 });
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
