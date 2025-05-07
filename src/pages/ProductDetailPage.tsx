
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Check, ChevronRight, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { addItem, cart } = useCart();
  
  const alreadyInCart = cart.items.some(item => item.product_id === id);

  // Fetch product details
  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.products.getById(id || ''),
    enabled: !!id,
  });

  // Fetch related products
  const { data: relatedProducts, isLoading: isRelatedLoading } = useQuery({
    queryKey: ['relatedProducts', id],
    queryFn: () => api.products.getAll({ category: product?.category?.id, limit: 4, exclude: id }),
    enabled: !!product?.category?.id,
  });

  const handleAddToCart = async () => {
    if (!id) return;
    
    try {
      await addItem(id, quantity);
      toast.success('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const renderProductContent = () => {
    if (isProductLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="h-96 w-full rounded-md" />
          <div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      );
    }

    if (!product) {
      return (
        <div className="py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products">
            <Button className="bg-overlay-purple hover:bg-overlay-darkpurple">
              Browse All Products
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Images */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Product Info */}
        <div>
          {/* Breadcrumb */}
          <nav className="flex text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-overlay-purple">Home</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link to="/products" className="hover:text-overlay-purple">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link 
                  to={`/categories/${product.category.id}`} 
                  className="hover:text-overlay-purple"
                >
                  {product.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* Product Title & Rating */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < (product.rating || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center mb-6">
            <span className="text-2xl font-bold text-overlay-darkpurple">
              ${product.price?.toFixed(2)}
            </span>
            
            {product.comparePrice && (
              <span className="ml-2 text-gray-500 line-through">
                ${product.comparePrice?.toFixed(2)}
              </span>
            )}
            
            {product.comparePrice && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                Save {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6">{product.shortDescription}</p>

          {/* Quantity Selector */}
          <div className="flex items-center mb-6">
            <span className="mr-4 text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                className="px-3 py-1 border-r border-gray-300"
                onClick={decrementQuantity}
              >
                -
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button
                className="px-3 py-1 border-l border-gray-300"
                onClick={incrementQuantity}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="mb-6">
            <Button
              size="lg"
              className="w-full bg-overlay-purple hover:bg-overlay-darkpurple flex items-center justify-center gap-2"
              onClick={handleAddToCart}
              disabled={alreadyInCart}
            >
              {alreadyInCart ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </>
              )}
            </Button>
          </div>

          {/* Product Features */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Product Features:</h3>
            <ul className="space-y-1">
              {product.features?.map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {renderProductContent()}

        {/* Product Details Tabs */}
        {product && (
          <div className="mt-16">
            <Tabs defaultValue="description">
              <TabsList className="w-full border-b justify-start mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="p-4 bg-white rounded-md">
                <div className="prose max-w-none text-gray-700">
                  <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="p-4 bg-white rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.specifications?.map((spec: any, index: number) => (
                    <div key={index} className="border-b border-gray-200 pb-2">
                      <div className="font-medium text-gray-700">{spec.name}</div>
                      <div className="text-gray-600">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="p-4 bg-white rounded-md">
                <div className="space-y-6">
                  {product.reviews?.length > 0 ? (
                    product.reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">{review.user}</div>
                          <div className="text-sm text-gray-500">{review.date}</div>
                        </div>
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No reviews yet for this product.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts?.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title">You Might Also Like</h2>
            
            {isRelatedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="rounded-lg overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct: any) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
