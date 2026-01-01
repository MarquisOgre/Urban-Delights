'use client';

import { useState } from 'react';
import { Menu, X, ChefHat, PlusCircle, Package, DollarSign, ClipboardList, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface HeaderProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
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
  
  return (
    <nav className="bg-white shadow-sm border-b border-orange-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => setCurrentView && setCurrentView('main')}
          >
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-orange-800">Artisan Delights</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                    currentView === item.key 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
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
