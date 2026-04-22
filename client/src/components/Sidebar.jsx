import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus, 
  FileText, 
  BarChart3, 
  LogOut, 
  ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Register FIR', icon: <FilePlus size={20} />, path: '/register' },
    { name: 'FIR Records', icon: <FileText size={20} />, path: '/records' },
    { name: 'AI Intelligence', icon: <ShieldAlert size={20} />, path: '/analytics' },
  ];

  return (
    <div className="w-64 h-screen glass-morphism bg-slate-900 border-r border-slate-800 text-white flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <ShieldAlert className="text-blue-500" size={32} />
        <h1 className="font-bold text-xl tracking-tight">Smart CRMS</h1>
      </div>
      
      <div className="flex-1 py-8 overflow-y-auto">
        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Logged in as</p>
          <p className="font-bold text-white truncate">{user?.name}</p>
          <p className="text-xs text-blue-400 uppercase">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
