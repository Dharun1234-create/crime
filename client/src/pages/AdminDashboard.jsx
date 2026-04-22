import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  FileCheck, 
  Clock, 
  TrendingUp,
  MapPin,
  PieChart as PieIcon,
  Activity,
  Users,
  Shield,
  ArrowRight
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title,
  Filler
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysisRes, officersRes] = await Promise.all([
          api.get('/analysis/dashboard'),
          api.get('/auth/users')
        ]);
        
        if (analysisRes.data.success) setData(analysisRes.data.analytics);
        if (officersRes.data.success) {
          setOfficers(officersRes.data.users.filter(u => u.role === 'inspector'));
        }
      } catch (error) {
        console.error("Failed to fetch admin dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout title="Admin Command Centre">
        <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const pieData = {
    labels: data?.crimeTypeDistribution?.map(item => item.type) || [],
    datasets: [{
      data: data?.crimeTypeDistribution?.map(item => item.count) || [],
      backgroundColor: ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316'],
      borderColor: '#0f172a',
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } } },
  };

  const stats = [
    { label: 'Total Force Depth', value: officers.length, icon: <Users className="text-blue-500" /> },
    { label: 'Total FIR Cases', value: data?.totalFIRs, icon: <FileCheck className="text-emerald-500" /> },
    { label: 'Active Investigations', value: data?.statusBreakdown?.investigating, icon: <Activity className="text-purple-500" /> },
    { label: 'Unresolved/Pending', value: data?.statusBreakdown?.pending, icon: <Clock className="text-orange-500" /> },
  ];

  return (
    <Layout title="Admin Command Centre">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-morphism p-6 rounded-2xl border-slate-800 card-hover bg-slate-900/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-slate-800">{stat.icon}</div>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Global Intel</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1 tracking-tighter italic">{stat.value ?? 0}</h3>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Crime Analysis Overview */}
        <div className="lg:col-span-2 glass-morphism p-8 rounded-3xl border-slate-800 relative bg-slate-900/40">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">AI CRIME ANALYSIS CENTRE</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Intelligent pattern recognition & risk assessment engine</p>
            </div>
            <Activity className="text-blue-500" size={24} />
          </div>
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="p-6 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Shield className="text-blue-500 w-12 h-12 animate-pulse" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2 uppercase italic">Predictive Intelligence Active</h4>
            <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
              Our neural models are cross-referencing all registered FIRs to identify suspicious patterns, localized risk spikes, and structural criminal methodologies.
            </p>
            <Link to="/analytics" className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40">
              Access Intelligence Matrix <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Tactical Overview */}
        <div className="space-y-8">
          <div className="glass-morphism p-8 rounded-3xl border-slate-800 h-1/2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Category Depth</h3>
              <PieIcon className="text-indigo-500" size={20} />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>

          <div className="glass-morphism p-6 rounded-3xl border-slate-800 flex-1 overflow-hidden">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Officer Deployment</h3>
                <Shield className="text-blue-500" size={20} />
             </div>
             <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {officers.map(off => (
                  <div key={off._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/40 transition-colors group">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 font-black border border-blue-500/20">{off.name[0]}</div>
                       <div>
                          <p className="text-xs font-black text-white uppercase tracking-tighter">{off.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase">{off.assignedDistrict}</p>
                       </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowRight size={14} className="text-slate-600" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Full Matrix */}
      <div className="mt-8 glass-morphism rounded-3xl border-slate-800 overflow-hidden bg-slate-900/40">
        <div className="p-8 flex items-center justify-between">
           <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Global Activity Feed</h3>
           <Link to="/records" className="text-blue-400 text-[10px] font-black uppercase tracking-widest hover:underline px-4 py-2 bg-blue-400/5 rounded-lg border border-blue-400/20">Access Master Files</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800/50 bg-slate-800/20">
                <th className="px-8 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Descriptor</th>
                <th className="px-6 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Jurisdiction</th>
                <th className="px-6 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Investigator</th>
                <th className="px-6 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data?.recentFIRs?.map((fir) => (
                <tr key={fir._id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-8 py-5">
                    <Link to={`/fir/${fir._id}`}>
                      <p className="text-white font-black group-hover:text-blue-400 transition-colors tracking-tighter uppercase text-sm">{fir.title}</p>
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tighter">{fir.crimeType} • {format(new Date(fir.date), 'MMM dd, HH:mm')}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-1 rounded border border-slate-700 text-slate-400 text-[9px] font-black uppercase tracking-tighter shadow-sm">
                      {fir.district}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-400 text-[10px] font-black uppercase">{fir.inspectorName}</td>
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

export default AdminDashboard;
