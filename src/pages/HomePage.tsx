
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/products/ProductCard';
import api from '@/lib/api';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch featured products
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => api.products.getAll({ featured: true, limit: 8 }),
  });

  // Fetch categories
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: api.categories.getAll,
  });

  useEffect(() => {
    if (productsData) {
      setFeaturedProducts(productsData);
    }
  }, [productsData]);

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  // Sample hero images for the slider
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      title: 'Premium Stream Overlays',
      description: 'Take your content to the next level with professional designs',
    },
    {
      url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
      title: 'Social Media Templates',
      description: 'Stand out on every platform with custom graphics',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative">
        <div className="bg-gradient-to-r from-overlay-purple to-overlay-darkpurple h-[70vh] md:h-[80vh] flex items-center overflow-hidden">
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Level Up Your Digital Presence
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8">
                Premium overlays, templates, and graphics for streamers and content creators.
                Stand out with professional designs that elevate your brand.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button size="lg" className="bg-white text-overlay-purple hover:bg-gray-100 hover:text-overlay-darkpurple">
                    Shop All Products
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                    Browse Categories
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
            alt="Hero" 
            className="absolute inset-0 w-full h-full object-cover object-center" 
          />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-10">Browse Categories</h2>
          
          {isCategoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Skeleton className="h-32 w-32 rounded-full mb-4" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {categories.slice(0, 4).map((category: any) => (
                <Link 
                  to={`/categories/${category.id}`} 
                  key={category.id}
                  className="group flex flex-col items-center hover-scale"
                >
                  <div className="bg-white p-6 rounded-full shadow-md mb-4 group-hover:shadow-lg transition-all duration-300">
                    <img 
                      src={category.image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'} 
                      alt={category.name} 
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                  <h3 className="font-medium text-gray-800 group-hover:text-overlay-purple transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center">
            <Link to="/categories">
              <Button variant="outline" className="border-overlay-purple text-overlay-purple hover:bg-overlay-lightpurple">
                View All Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-10">Featured Products</h2>
          
          {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
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
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center">
            <Link to="/products">
              <Button className="bg-overlay-purple hover:bg-overlay-darkpurple">
                Shop All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-10">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Twitch Streamer',
                quote: 'These overlays completely transformed my stream. The quality is amazing and installation was super easy!',
                avatar: 'https://images.unsplash.com/photo-1500673922987-e212871fec22'
              },
              {
                name: 'Mike Reynolds',
                role: 'YouTube Content Creator',
                quote: 'I\'ve tried many overlay services, but OverlaySnow is by far the best. The designs are unique and professional.',
                avatar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
              },
              {
                name: 'Emma Garcia',
                role: 'Social Media Manager',
                quote: 'The templates save me so much time and help our brand maintain a consistent look across all platforms.',
                avatar: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-overlay-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Content?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of content creators who have elevated their brand with our premium overlays and templates.
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-white text-overlay-purple hover:bg-gray-100">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
