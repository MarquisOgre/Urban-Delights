'use client';

import { useState } from 'react';
import { Menu, X, ChefHat, PlusCircle, Package, DollarSign, ClipboardList, Warehouse, RefreshCw, LogOut, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface HeaderProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
  onRefresh?: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut, session } = useAuth();
  const navigate = useNavigate();
  const isAuthed = !!session;

  const allNavigationItems = [
    { key: 'order-dashboard', label: 'Orders', icon: ClipboardList, authOnly: true },
    { key: 'recipes', label: 'Recipes', icon: ChefHat, authOnly: false },
    { key: 'add-recipe', label: 'Add Recipe', icon: PlusCircle, authOnly: true },
    { key: 'ingredients', label: 'Ingredients', icon: Package, authOnly: false },
    { key: 'pricing', label: 'Pricing Manager', icon: DollarSign, authOnly: false },
    { key: 'indent', label: 'Indent', icon: ClipboardList, authOnly: false },
    { key: 'stock-register', label: 'Stock Register', icon: Warehouse, authOnly: false },
  ];

  const navigationItems = allNavigationItems.filter((item) => isAuthed || !item.authOnly);

  const handleNavClick = (key: string) => {
    setCurrentView && setCurrentView(key);
    setMobileMenuOpen(false);
  };

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <nav className="bg-white shadow-sm border-b border-orange-200 sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div 
            className="flex items-center space-x-2 sm:space-x-4 cursor-pointer hover:opacity-80 transition-opacity min-w-0" 
            onClick={() => setCurrentView && setCurrentView('main')}
          >
            <img src="/logo.png" alt="Urban Delights" className="h-8 sm:h-10 w-auto flex-shrink-0" />
            <span className="sr-only">Urban Delights</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="text-orange-800 hover:bg-orange-100">
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            )}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors flex items-center gap-1 xl:gap-2 ${
                    currentView === item.key 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
            {isAuthed ? (
              <Button variant="ghost" size="sm" onClick={signOut} className="text-orange-800 hover:bg-orange-100">
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="text-orange-800 border-orange-300 hover:bg-orange-100">
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center gap-1">
            {onRefresh && (
              <Button variant="ghost" size="icon" className="text-orange-800" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-orange-800">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white">
                <div className="flex flex-col gap-2 mt-8">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleNavClick(item.key)}
                        className={`px-4 py-3 text-sm font-medium rounded-md transition-colors flex items-center gap-3 ${
                          currentView === item.key 
                            ? 'bg-orange-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    );
                  })}
                  {isAuthed ? (
                    <button
                      onClick={() => { setMobileMenuOpen(false); signOut(); }}
                      className="px-4 py-3 text-sm font-medium rounded-md transition-colors flex items-center gap-3 bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}
                      className="px-4 py-3 text-sm font-medium rounded-md transition-colors flex items-center gap-3 bg-orange-600 text-white"
                    >
                      <LogIn className="h-5 w-5" />
                      Login
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
