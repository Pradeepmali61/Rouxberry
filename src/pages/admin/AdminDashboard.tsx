
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';

const AdminDashboard: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');

  // Check if user is authenticated and admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/admin');
      return;
    }
    
    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Fetch sales data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales', timeRange],
    queryFn: () => api.analytics.getSales(timeRange),
  });

  // Fetch best sellers
  const { data: bestSellers, isLoading: bestSellersLoading } = useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => api.analytics.getBestSellers(5),
  });

  // Colors for pie chart
  const COLORS = ['#8B5CF6', '#C4B5FD', '#A78BFA', '#7C3AED', '#6D28D9'];

  // Order status distribution - sample data
  const orderStatusData = [
    { name: 'Completed', value: 65 },
    { name: 'Processing', value: 20 },
    { name: 'Pending', value: 10 },
    { name: 'Cancelled', value: 5 },
  ];

  // Sample data for recent orders
  const recentOrders = [
    { id: '1', customer: 'John Doe', date: '2023-05-15', total: 129.99, status: 'Completed' },
    { id: '2', customer: 'Jane Smith', date: '2023-05-14', total: 79.99, status: 'Processing' },
    { id: '3', customer: 'Robert Johnson', date: '2023-05-13', total: 199.99, status: 'Pending' },
    { id: '4', customer: 'Emily Davis', date: '2023-05-12', total: 59.99, status: 'Completed' },
    { id: '5', customer: 'Michael Brown', date: '2023-05-11', total: 149.99, status: 'Cancelled' },
  ];

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-overlay-purple hover:bg-overlay-darkpurple">
              Generate Report
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">${salesData?.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-green-500 mt-1">
                    +{salesData?.revenueGrowth}% from previous period
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{salesData?.orderCount}</div>
                  <p className="text-xs text-green-500 mt-1">
                    +{salesData?.orderGrowth}% from previous period
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{salesData?.conversionRate}%</div>
                  <p className="text-xs text-red-500 mt-1">
                    -{salesData?.conversionChange}% from previous period
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Avg. Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">${salesData?.averageOrderValue.toFixed(2)}</div>
                  <p className="text-xs text-green-500 mt-1">
                    +{salesData?.aovGrowth}% from previous period
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Over Time */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>
                Sales performance for the {timeRange === 'week' ? 'past week' : timeRange === 'month' ? 'past month' : timeRange === 'quarter' ? 'past quarter' : 'past year'}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {salesLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData?.revenueOverTime || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Distribution of order statuses</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Best Sellers & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle>Best Selling Products</CardTitle>
              <CardDescription>Top 5 products by sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              {bestSellersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {bestSellers?.map((product: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-overlay-purple font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium text-gray-800">{product.name}</h4>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">{product.category}</span>
                          <span className="font-medium">${product.revenue.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest 5 customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">#{order.id}</h4>
                      <p className="text-sm text-gray-500">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" className="w-full">
                  View All Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
