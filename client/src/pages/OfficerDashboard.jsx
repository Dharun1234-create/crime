import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileCheck, 
  Clock, 
  Activity,
  MapPin,
  MessageSquare,
  ArrowRight,
  Shield,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const OfficerDashboard = () => {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysisRes, requestsRes] = await Promise.all([
          api.get('/analysis/dashboard'),
          api.get('/fir/my-requests')
        ]);
        
        if (analysisRes.data.success) setData(analysisRes.data.analytics);
        if (requestsRes.data.success) setRequests(requestsRes.data.firs);
      } catch (error) {
        console.error("Failed to fetch officer dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout title="Operations Hub">
        <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // Filter district stats for officer's assigned district
  const districtStats = (data?.districtStats || []).filter(d => d.district === currentUser?.assignedDistrict);

  const stats = [
    { label: 'Assigned Range', value: currentUser?.assignedDistrict, icon: <MapPin className="text-blue-500" /> },
    { label: 'Total active cases', value: data?.recentFIRs?.length || 0, icon: <Briefcase className="text-emerald-500" /> },
    { label: 'Pending Updates', value: requests.length, icon: <MessageSquare className="text-orange-500" /> },
    { label: 'Investigation Level', value: data?.statusBreakdown?.investigating || 0, icon: <Activity className="text-purple-500" /> },
  ];

  return (
    <Layout title="Officer Operations Hub">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-morphism p-6 rounded-2xl border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 rounded-xl bg-slate-800">{stat.icon}</div>
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Personal Intel</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1 tracking-tighter uppercase">{stat.value}</h3>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Sector Intelligence */}
        <div className="lg:col-span-2 glass-morphism p-8 rounded-3xl border-slate-800 bg-slate-900/40 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">AI CRIME ANALYSIS: <span className="text-blue-400">{currentUser?.assignedDistrict}</span></h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Localized predictive modeling for active investigations</p>
            </div>
            <Shield className="text-blue-500" size={24} />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20 rotate-3">
              <Activity className="text-blue-500 animate-pulse" size={40} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2 uppercase italic">Sector Analysis Active</h4>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              AI models are currently processing recent incidents in <b>{currentUser?.assignedDistrict}</b> to reconstruct methodologies and predict execution patterns.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Scanning</p>
                <div className="h-1 bg-blue-500 rounded-full w-full"></div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Matching</p>
                <div className="h-1 bg-indigo-500 rounded-full w-2/3"></div>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Predicting</p>
                <div className="h-1 bg-purple-500 rounded-full w-1/3"></div>
              </div>
            </div>
            <Link to="/analytics" className="mt-10 text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 hover:underline">
              Exploit Full Intelligent Matrix <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Priority Directives */}
        <div className="space-y-6">
           <div className="glass-morphism p-6 rounded-3xl border-orange-500/20 bg-orange-600/5 h-full">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-black text-white uppercase italic tracking-tighter italic">HQ Directives</h3>
                 <MessageSquare className="text-orange-500" size={20} />
              </div>
              <div className="space-y-4">
                 {requests.length === 0 ? (
                   <div className="p-4 rounded-2xl bg-slate-800/30 text-slate-500 text-xs font-bold text-center uppercase tracking-widest border border-slate-800">
                      No pending directives from Admin
                   </div>
                 ) : (
                   requests.map(req => (
                     <Link to={`/fir/${req._id}`} key={req._id}>
                        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/50 transition-all group">
                           <p className="text-xs font-black text-white uppercase tracking-tighter mb-1 line-clamp-1">{req.title}</p>
                           <p className="text-[10px] text-orange-500/80 font-bold uppercase">Update Requested by HQ</p>
                           <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight size={14} className="text-orange-500" />
                           </div>
                        </div>
                     </Link>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* My Assigned Registry */}
      <div className="mt-8 glass-morphism rounded-3xl border-slate-800 overflow-hidden bg-slate-900/40">
        <div className="p-8 flex items-center justify-between">
           <h3 className="text-xl font-black text-white uppercase italic tracking-widest">My Operational Registry</h3>
           <Link to="/records" className="text-blue-400 text-[10px] font-black uppercase tracking-widest hover:underline px-4 py-2 bg-blue-400/5 rounded-lg border border-blue-400/20">Full Personal Log</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-800/20">
                <th className="px-8 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Case Profile</th>
                <th className="px-6 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Timeline</th>
                <th className="px-6 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Current State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data?.recentFIRs?.map((fir) => (
                <tr key={fir._id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-8 py-5">
                    <Link to={`/fir/${fir._id}`}>
                      <p className="text-white font-black group-hover:text-blue-400 transition-colors tracking-tighter uppercase text-sm">{fir.title}</p>
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tighter line-clamp-1">{fir.location}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-5">
                     <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-[9px] font-black uppercase tracking-tighter">{fir.crimeType}</span>
                  </td>
                  <td className="px-6 py-5 text-slate-400 text-[10px] font-black uppercase">{format(new Date(fir.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${
                      fir.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                      fir.status === 'Investigating' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse'
                    }`}>
                      {fir.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default OfficerDashboard;
