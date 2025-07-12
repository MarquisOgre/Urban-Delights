'use client';

import { Button } from '@/components/ui/button';
import { Settings, Download } from 'lucide-react';

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
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-orange-800">Artisan Delights</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {[
              { label: 'Recipes', key: 'recipes' },
              { label: 'Ingredient List', key: 'ingredients' },
              { label: 'Add Recipe', key: 'add-recipe' },
              { label: 'Indent', key: 'indent' },
            ].map(link => (
              <button
                key={link.key}
                onClick={() => setCurrentView(link.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === link.key
                    ? 'bg-orange-100 text-orange-800'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setCurrentView('manage-recipes')}
              size="sm"
              className={`${
                currentView === 'manage-recipes'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Settings size={16} className="mr-1" />
              Manage
            </Button>
            <Button
              onClick={exportAllData}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
