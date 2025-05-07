
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">About OverlaySnow</h1>

        <div className="max-w-3xl mx-auto">
          <div className="prose lg:prose-xl">
            <p className="text-lg">
              Welcome to OverlaySnow, your premier destination for high-quality clothing designed with both style and comfort in mind. Since our founding, we've been dedicated to providing our customers with exceptional products that combine fashion-forward designs with everyday wearability.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
            <p>
              OverlaySnow began with a simple vision: to create clothing that people would love to wear day after day. What started as a small passion project has grown into a beloved brand, trusted by customers around the world for quality craftsmanship and attention to detail.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p>
              At OverlaySnow, we believe that great clothing should be accessible to everyone. That's why we work tirelessly to create products that are not only stylish and comfortable but also affordable and inclusive. We're committed to ethical manufacturing practices and sustainability, ensuring that our impact on the planet is as positive as our impact on your wardrobe.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Products</h2>
            <p>
              Each item in our collection is carefully designed and crafted to meet our exacting standards. From casual T-shirts to elegant shirts and comfortable pants, every piece is made with high-quality materials and attention to detail. We believe in creating clothing that stands the test of time, both in style and durability.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Promise</h2>
            <p>
              When you shop with OverlaySnow, you're not just buying clothing – you're investing in quality, comfort, and style. We stand behind every item we sell, and we're committed to ensuring your complete satisfaction with your purchase.
            </p>

            <p className="mt-8">
              Thank you for choosing OverlaySnow. We look forward to being part of your style journey.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
