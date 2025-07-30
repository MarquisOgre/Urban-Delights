'use client';

import { Button } from '@/components/ui/button';
import { Settings, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  exportAllData: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, exportAllData }) => {
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

          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {[
              { label: 'Orders', key: 'orders' },
              { label: 'Create Order', key: 'create-order' },
              { label: 'Pricing', key: 'pricing' }
            ].map(link => (
              <button
                key={link.key}
                onClick={() => setCurrentView(link.key)}
                className={`px-2 py-2 lg:px-3 rounded-md text-xs lg:text-sm font-medium transition-colors ${
                  currentView === link.key
                    ? 'bg-orange-100 text-orange-800'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                {link.label}
              </button>
            ))}
            
            <div className="border-l border-gray-300 pl-4 ml-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Backend</span>
              <div className="flex space-x-2 mt-1">
                {[
                  { label: 'Recipes', key: 'recipes' },
                  { label: 'Ingredients', key: 'ingredients' },
                  { label: 'Add Recipe', key: 'add-recipe' },
                  { label: 'Indent', key: 'indent' },
                  { label: 'Stock Register', key: 'stock-register' },
                ].map(link => (
                  <button
                    key={link.key}
                    onClick={() => setCurrentView(link.key)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      currentView === link.key
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <div className="grid grid-cols-3 gap-1 p-2">
              {[
                { label: 'Orders', key: 'orders' },
                { label: 'Create', key: 'create-order' },
                { label: 'Backend', key: 'recipes' },
              ].map(link => (
                <button
                  key={link.key}
                  onClick={() => setCurrentView(link.key)}
                  className={`px-2 py-3 rounded-md text-xs font-medium transition-colors text-center ${
                    currentView === link.key
                      ? 'bg-orange-100 text-orange-800'
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-1 lg:space-x-2">
            <Button
              onClick={() => setCurrentView('manage-recipes')}
              size="sm"
              className={`hidden md:flex ${
                currentView === 'manage-recipes'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Settings size={16} className="mr-1" />
              <span className="hidden lg:inline">Manage</span>
            </Button>
            <Button
              onClick={exportAllData}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download size={14} className="lg:mr-1" />
              <span className="hidden lg:inline">Export</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
