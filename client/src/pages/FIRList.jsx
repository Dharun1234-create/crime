import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  ArrowRight, 
  ChevronRight,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

const FIRList = () => {
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    crimeType: '',
    status: '',
  });

  const crimeTypes = [
    'Theft', 'Robbery', 'Assault', 'Murder', 'Fraud', 'Cybercrime', 
    'Drug Trafficking', 'Kidnapping', 'Domestic Violence', 'Vandalism', 'Burglary', 'Other'
  ];

  const fetchFIRs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.crimeType) params.append('crimeType', filters.crimeType);
      if (filters.status) params.append('status', filters.status);
      
      const response = await api.get(`/fir/all?${params.toString()}`);
      if (response.data.success) {
        setFirs(response.data.firs);
      }
    } catch (error) {
      console.error("Failed to fetch FIRs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFIRs();
  }, [filters.crimeType, filters.status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFIRs();
  };

  return (
    <Layout title="FIR Records Repository">
      <div className="space-y-8">
        {/* Search and Filters Bar */}
        <div className="glass-morphism p-6 rounded-3xl border-slate-800 flex flex-wrap gap-6 items-end">
          <form onSubmit={handleSearch} className="flex-1 min-w-[300px] space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Universal Search</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by title, location or complainant..."
                className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </form>

          <div className="w-48 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
            <select
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-sm font-bold"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Investigating">Investigating</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="w-56 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Crime Type</label>
            <select
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-sm font-bold"
              value={filters.crimeType}
              onChange={(e) => setFilters({...filters, crimeType: e.target.value})}
            >
              <option value="">All Categories</option>
              {crimeTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <button 
            onClick={fetchFIRs}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20"
          >
            <Filter size={20} />
          </button>
        </div>

        {/* FIR List Container */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : firs.length === 0 ? (
            <div className="glass-morphism p-20 rounded-3xl border-slate-800 text-center">
              <AlertCircle size={48} className="text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">No matching records found</p>
            </div>
          ) : (
            firs.map((fir) => (
              <Link 
                key={fir._id} 
                to={`/fir/${fir._id}`}
                className="block group"
              >
                <div className="glass-morphism p-6 rounded-2xl border-slate-800 hover:border-blue-500/30 transition-all card-hover flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                      fir.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-500' :
                      fir.status === 'Investigating' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-orange-500/10 text-orange-500'
                    }`}>
                      {fir.status === 'Closed' ? <CheckCircle2 size={28} /> : <Clock size={28} />}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-tighter">
                          {fir.firNumber || 'UNASSIGNED ID'}
                        </span>
                        <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight line-clamp-1 max-w-sm">
                          {fir.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-blue-400 tracking-widest">
                          {fir.crimeType}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-slate-500 text-sm font-medium">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-600" />
                          {fir.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-600" />
                          {format(new Date(fir.date), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <ArrowRight size={14} className="text-slate-600" />
                          Officer {fir.inspectorName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className={`text-xs font-black uppercase tracking-widest mb-1 ${
                        fir.status === 'Closed' ? 'text-emerald-500' :
                        fir.status === 'Investigating' ? 'text-purple-400' :
                        'text-orange-400'
                      }`}>
                        {fir.status}
                      </p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase">Case Workflow</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FIRList;
