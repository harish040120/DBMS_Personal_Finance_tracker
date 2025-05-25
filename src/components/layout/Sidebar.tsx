import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CreditCard, PieChart, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Transactions', path: '/transactions', icon: <CreditCard size={20} /> },
    { name: 'Categories', path: '/categories', icon: <PieChart size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const activeClasses = 'bg-indigo-100 text-indigo-700';
  const inactiveClasses = 'text-gray-600 hover:bg-gray-100 hover:text-indigo-700';

  return (
    <aside className={`bg-gradient-to-b from-gray-900 to-gray-800 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40`}>
      <div className="h-16 px-6 flex items-center border-b border-gray-700">
        <div className="flex items-center">
          <CreditCard className="text-indigo-400" size={24} />
          <span className="ml-2 font-bold text-white text-lg">FinanceTracker</span>
        </div>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                    isActive ? activeClasses : inactiveClasses
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;