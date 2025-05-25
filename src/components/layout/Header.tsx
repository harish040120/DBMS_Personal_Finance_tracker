import React from 'react';
import { Menu, Search } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 sticky top-0 z-30">
      <div className="px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center flex-1">
          <button 
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-indigo-400 focus:outline-none focus:text-indigo-400 lg:hidden"
          >
            <Menu size={24} />
          </button>
          
          <div className="relative ml-4 md:ml-6 flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;