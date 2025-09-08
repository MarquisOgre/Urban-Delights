'use client';

interface HeaderProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {

  const navigationItems = [
    { key: 'recipes', label: 'Recipes' },
    { key: 'ingredients', label: 'Ingredients' },
    { key: 'pricing', label: 'Pricing Manager' },
    { key: 'indent', label: 'Indent' },
    { key: 'stock', label: 'Stock Register' },
  ];
  
  return (
    <nav className="bg-white shadow-sm border-b border-orange-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => setCurrentView && setCurrentView('main')}
            >
              <img src="/logo.png" alt="Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-orange-800">Artisan Delights</span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentView && setCurrentView(item.key)}
                  className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                    currentView === item.key 
                      ? 'text-orange-600 border-b-2 border-orange-600 pb-4' 
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
