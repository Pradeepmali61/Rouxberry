
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    isNew?: boolean;
    isFeatured?: boolean;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await addItem(product.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="block group">
      <div className="product-card group">
        <div className="relative overflow-hidden pb-[56.25%]">
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-image absolute inset-0 w-full h-full object-cover"
          />
          {(product.isNew || product.isFeatured) && (
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              {product.isNew && (
                <Badge className="bg-overlay-purple text-white hover:bg-overlay-darkpurple">
                  New
                </Badge>
              )}
              {product.isFeatured && (
                <Badge variant="outline" className="bg-white border-overlay-purple text-overlay-purple">
                  Featured
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-overlay-purple transition-colors duration-200">
                {product.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{product.category}</p>
            </div>
            <span className="text-lg font-semibold text-overlay-darkpurple">
              ${product.price.toFixed(2)}
            </span>
          </div>
          
          <div className="mt-4">
            <Button 
              className="w-full bg-overlay-purple hover:bg-overlay-darkpurple flex items-center justify-center gap-2"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
