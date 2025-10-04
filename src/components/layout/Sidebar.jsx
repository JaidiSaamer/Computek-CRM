import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  FileText,
  CreditCard,
  User,
  Download,
  Settings,
  Users,
  BarChart3,
  Package,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: Home,
        roles: ['client', 'staff', 'admin']
      }
    ];

    const clientItems = [
      {
        label: 'Make Order',
        path: '/orders/create',
        icon: ShoppingCart,
        roles: ['client']
      },
      {
        label: 'My Orders',
        path: '/orders',
        icon: FileText,
        roles: ['client']
      },
      {
        label: 'Make Payment',
        path: '/payments/make',
        icon: CreditCard,
        roles: ['client']
      },
      {
        label: 'Online Payment',
        path: '/payments/online',
        icon: CreditCard,
        roles: ['client']
      }
    ];

    const staffItems = [
      {
        label: 'All Orders',
        path: '/orders',
        icon: FileText,
        roles: ['staff', 'admin']
      },
      {
        label: 'Payments',
        path: '/payments',
        icon: CreditCard,
        roles: ['staff', 'admin']
      }
    ];

    const adminItems = [
      {
        label: 'User Management',
        path: '/admin/users',
        icon: Users,
        roles: ['admin']
      },
      {
        label: 'Order Options',
        path: '/admin/options',
        icon: Settings,
        roles: ['admin']
      },
      {
        label: 'Inventory',
        path: '/admin/inventory',
        icon: Package,
        roles: ['admin']
      },
      {
        label: 'Analytics',
        path: '/admin/analytics',
        icon: BarChart3,
        roles: ['admin']
      }
    ];

    const commonItems = [
      {
        label: 'Profile',
        path: '/profile',
        icon: User,
        roles: ['client', 'staff', 'admin']
      },
      {
        label: 'Support',
        path: '/support',
        icon: HelpCircle,
        roles: ['client', 'staff', 'admin']
      },
      {
        label: 'Downloads',
        path: '/downloads',
        icon: Download,
        roles: ['client', 'staff', 'admin']
      }
    ];

    const allItems = [...baseItems, ...clientItems, ...staffItems, ...adminItems, ...commonItems];

    return allItems.filter(item => item.roles.includes(user?.userType));
  };

  const menuItems = getMenuItems();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src="./src/assets/CP_logo.png"
            alt="Computek Printing"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Computek</h2>
            <p className="text-sm text-gray-600">Printing</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
