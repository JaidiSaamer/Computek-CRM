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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-md shadow-lg md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>
      )}

      {/* Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-card border-r border-border flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
          md:translate-x-0
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <img
              src="./src/assets/CP_logo.png"
              alt="Computek Printing"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Computek</h2>
              <p className="text-sm text-muted-foreground">Printing</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-border">
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
    </>
  );
};

export default Sidebar;