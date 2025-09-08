'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface HeaderProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
  exportAllData?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, exportAllData }) => {

  const handleBackendNavigation = () => {
    if (typeof setCurrentView === 'function') {
      setCurrentView('main');
    }
  };
  
  return (
    <nav className="bg-white shadow-sm border-b border-orange-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => setCurrentView && setCurrentView('main')}
            >
              <img src="/logo.png" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-orange-800">Artisan Delights</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-3">
            {exportAllData && (
              <Button
                onClick={exportAllData}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download size={14} className="lg:mr-1" />
                <span className="hidden lg:inline">Export</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
