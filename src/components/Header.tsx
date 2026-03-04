'use client';

import { useState } from 'react';
import { Menu, X, ChefHat, PlusCircle, Package, DollarSign, ClipboardList, Warehouse, RefreshCw } from 'lucide-react';
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

  const navigationItems = [
    { key: 'recipes', label: 'Recipes', icon: ChefHat },
    { key: 'add-recipe', label: 'Add Recipe', icon: PlusCircle },
    { key: 'ingredients', label: 'Ingredients', icon: Package },
    { key: 'pricing', label: 'Pricing Manager', icon: DollarSign },
    { key: 'indent', label: 'Indent', icon: ClipboardList },
    { key: 'stock-register', label: 'Stock Register', icon: Warehouse },
  ];

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
            <img src="/logo.png" alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0" />
            <span className="text-base sm:text-xl font-bold text-orange-800 truncate">Artisan Delights</span>
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
