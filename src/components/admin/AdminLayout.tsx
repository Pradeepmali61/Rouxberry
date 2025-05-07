
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart2, 
  Package, 
  Users, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home 
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { path: '/admin/products', label: 'Products', icon: <Package className="w-5 h-5" /> },
    { path: '/admin/orders', label: 'Orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { path: '/admin/customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="flex items-center justify-between h-16 px-6 bg-overlay-purple text-white">
            <Link to="/admin" className="flex items-center space-x-3">
              <span className="font-bold text-xl">Admin Panel</span>
            </Link>
          </div>
          
          <div className="flex flex-col justify-between h-full p-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-md ${
                    isCurrentPath(item.path)
                      ? 'bg-overlay-lightpurple text-overlay-purple font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center space-x-3 px-3">
                <div className="w-10 h-10 rounded-full bg-overlay-purple text-white flex items-center justify-center text-lg font-medium">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link to="/" className="flex items-center space-x-3 p-3 rounded-md text-gray-700 hover:bg-gray-100">
                  <Home className="w-5 h-5" />
                  <span>Back to Site</span>
                </Link>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-3 p-3 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 mr-4"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <span className="font-bold text-lg text-gray-800">Admin Panel</span>
          </div>
          <Link to="/" className="text-gray-700">
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 mt-14 bg-white md:hidden">
          <div className="p-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-md ${
                    isCurrentPath(item.path)
                      ? 'bg-overlay-lightpurple text-overlay-purple font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            
            <div className="mt-6">
              <Separator />
              <div className="mt-4 space-y-2">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-3 p-3 w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto md:pb-8 pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
