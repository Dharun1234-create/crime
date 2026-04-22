import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, UserCircle } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 fixed top-0 right-0 left-64 z-10 px-8 flex items-center justify-between">
      <h2 className="text-2xl font-bold text-white uppercase tracking-wide">{title}</h2>
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search cases..." 
            className="bg-slate-800/50 border border-slate-700 text-sm rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-300"
          />
        </div>
        
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="text-right">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Officer ID: #POL-{user?.id.substring(user.id.length - 4)}</p>
          </div>
          <UserCircle size={32} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
