
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Trash, Plus, Minus, ChevronLeft } from 'lucide-react';

const CartPage: React.FC = () => {
  const { cart, isLoading, updateItem, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-24 w-24 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/4 mb-4" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
            <div className="mt-8">
              <Skeleton className="h-12 w-full md:w-1/3 ml-auto" />
            </div>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6 flex justify-center">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link to="/products">
              <Button className="bg-overlay-purple hover:bg-overlay-darkpurple">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-gray-700">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center">
                    {/* Product Info */}
                    <div className="flex items-center col-span-6 mb-4 md:mb-0">
                      <Link to={`/products/${item.product_id}`} className="shrink-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      </Link>
                      <div className="ml-4">
                        <Link to={`/products/${item.product_id}`} className="font-medium text-gray-800 hover:text-overlay-purple">
                          {item.product.name}
                        </Link>
                        <button 
                          className="text-red-500 text-sm flex items-center mt-1 hover:text-red-700"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="col-span-2 text-center text-gray-700 mb-2 md:mb-0">
                      <div className="md:hidden text-sm text-gray-500 mb-1">Price:</div>
                      ${item.product.price.toFixed(2)}
                    </div>
                    
                    {/* Quantity */}
                    <div className="col-span-2 flex justify-center mb-2 md:mb-0">
                      <div className="md:hidden text-sm text-gray-500 mb-1">Quantity:</div>
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          className="px-2 py-1 border-r border-gray-300"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button
                          className="px-2 py-1 border-l border-gray-300"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="col-span-2 text-right font-medium text-gray-900">
                      <div className="md:hidden text-sm text-gray-500 mb-1">Total:</div>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 flex justify-between items-center">
                <Button 
                  variant="outline" 
                  className="text-gray-600 hover:text-gray-800"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 ml-auto md:w-1/3">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">${cart.total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-800">$0.00</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span className="text-overlay-darkpurple">${cart.total.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full bg-overlay-purple hover:bg-overlay-darkpurple"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
              
              <Link to="/products" className="mt-4 flex items-center justify-center text-overlay-purple hover:underline">
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default CartPage;
