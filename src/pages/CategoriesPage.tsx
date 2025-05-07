
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { Link } from 'react-router-dom';
import api from '@/lib/api';

const CategoriesPage = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: api.categories.getAll,
  });

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Product Categories</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Browse our collection by category to find exactly what you're looking for.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-100 animate-pulse h-48 rounded-lg"></div>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category: any) => (
                <Link 
                  to={`/products?category=${category.id}`}
                  key={category.id}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-[1.02]">
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-overlay-lightpurple">
                          <span className="text-overlay-darkpurple font-medium text-lg">
                            {category.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-overlay-purple transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="mt-2 text-gray-600">{category.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">No categories available</p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default CategoriesPage;
