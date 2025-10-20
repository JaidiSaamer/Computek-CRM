import React, { useState, useEffect } from 'react';
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
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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
      // {
      //   label: 'Make Order',
      //   path: '/orders/create',
      //   icon: ShoppingCart,
      //   roles: ['client']
      // },
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
        label: 'Automations',
        path: '/automations',
        icon: BarChart3,
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
        label: 'Inventory',
        path: '/admin/options',
        icon: Settings,
        roles: ['admin']
      },
    ];

    const commonItems = [
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
      },
      {
        label: 'Profile',
        path: '/profile',
        icon: User,
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

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
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
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
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
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
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
    </>
  );

  return (
    <>
      {/* Hamburger Button - Mobile Only */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Backdrop Overlay - Mobile Only */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Desktop: Always visible, Mobile: Slide-in */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-gray-200 
          flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;