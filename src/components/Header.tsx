'use client';

import { Button } from '@/components/ui/button';
import { Download, LogOut, UserCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
  exportAllData?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, exportAllData }) => {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const handleBackendNavigation = () => {
    if (typeof setCurrentView === 'function') {
      setCurrentView('main');
    }
  };

  const onAdminRoute = ['/orders', '/orders-list', '/backend'].some((p) =>
    location.pathname.startsWith(p)
  );

  const initials = user?.email?.[0]?.toUpperCase() || 'U';

  const handleLogout = async () => {
    await signOut();
  };
  
  return (
    <nav className="bg-white shadow-sm border-b border-orange-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-4">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-orange-800">Artisan Delights</span>
          </Link>

        </div>

          {isAdmin && (
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {onAdminRoute && (
                <Link
                  to="/"
                  className="px-2 py-2 lg:px-3 rounded-md text-xs lg:text-sm font-medium transition-colors text-gray-600 hover:text-orange-600"
                >
                  ← Back to Website
                </Link>
              )}
              <Link 
                to="/orders" 
                className={`px-2 py-2 lg:px-3 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                  location.pathname === '/orders' || location.pathname === '/' 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Order Dashboard
              </Link>
              <Link 
                to="/backend" 
                onClick={handleBackendNavigation}
                className={`px-2 py-2 lg:px-3 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/backend') 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                Backend Dashboard
              </Link>
            </div>
          )}

          {/* Mobile Navigation */}
          {isAdmin && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
              <div className="grid grid-cols-2 gap-1 p-2">
                <Link 
                  to="/orders" 
                  className={`px-2 py-3 rounded-md text-xs font-medium transition-colors text-center ${
                    location.pathname === '/orders' || location.pathname === '/' 
                      ? 'text-orange-600 bg-orange-50' 
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  Order Dashboard
                </Link>
                <Link 
                  to="/backend" 
                  onClick={handleBackendNavigation}
                  className={`px-2 py-3 rounded-md text-xs font-medium transition-colors text-center ${
                    location.pathname.startsWith('/backend') 
                      ? 'text-orange-600 bg-orange-50' 
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  Backend Dashboard
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 lg:space-x-3">
            {isAdmin && exportAllData && (
              <Button
                onClick={exportAllData}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download size={14} className="lg:mr-1" />
                <span className="hidden lg:inline">Export</span>
              </Button>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 focus:outline-none">
                    <Avatar>
                      <AvatarImage src={""} alt={user.email || "User"} />
                      <AvatarFallback>
                        <UserCircle2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="text-sm text-gray-700 hover:text-orange-600">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
