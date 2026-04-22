import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  ShieldAlert,
  TrendingUp, 
  Download,
  Calendar,
  Layers,
  Filter,
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
  BarElement,
  Title,
  Filler
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title,
  Filler
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analysis/dashboard');
        if (response.data.success) {
          setData(response.data.analytics);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Layout title="Strategic Intelligence">
        <div className="flex items-center justify-center h-full">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { size: 11, weight: 'bold' }, padding: 20 }
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 10 } }
      }
    }
  };

  const crimeData = {
    labels: data?.crimeTypeDistribution.map(item => item.type) || [],
    datasets: [{
      label: 'Total Cases',
      data: data?.crimeTypeDistribution.map(item => item.count) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderRadius: 8,
    }]
  };

  const trendData = {
    labels: data?.monthlyTrend.map(item => item.month) || [],
    datasets: [{
      fill: true,
      label: 'Crime Rate Pulse',
      data: data?.monthlyTrend.map(item => item.count) || [],
      borderColor: '#818cf8',
      backgroundColor: 'rgba(129, 140, 248, 0.1)',
      tension: 0.4,
      pointBackgroundColor: '#818cf8',
      pointBorderColor: '#fff',
      pointHoverRadius: 6,
    }]
  };

  return (
    <Layout title="Strategic Intelligence Dashboard">
      <div className="space-y-8">
        {/* Header Ribbon */}
        <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 rounded-xl text-white text-xs font-bold flex items-center gap-2">
              <Calendar size={14} /> Last 12 Months
            </button>
            <button className="px-4 py-2 bg-slate-800 rounded-xl text-slate-400 text-xs font-bold flex items-center gap-2 hover:bg-slate-700 transition-all">
              <Filter size={14} /> Filter Parameters
            </button>
          </div>
          <button className="px-6 py-2 bg-emerald-600/10 text-emerald-500 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2">
            <Download size={14} /> Intelligence Report
          </button>
        </div>

        {/* Top Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-morphism p-8 rounded-3xl border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">Temporal Trend Hub</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Monthly incident trajectory</p>
              </div>
              <TrendingUp className="text-indigo-500" size={24} />
            </div>
            <div className="h-[350px]">
              <Line data={trendData} options={chartOptions} />
            </div>
          </div>

          <div className="glass-morphism p-8 rounded-3xl border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">Crime Categorization</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Volume by classification</p>
              </div>
              <BarChart3 className="text-blue-500" size={24} />
            </div>
            <div className="h-[350px]">
              <Bar data={crimeData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Integrated AI Intelligence Matrix */}
          <div className="lg:col-span-2 glass-morphism rounded-3xl border-slate-800 overflow-hidden bg-slate-900/60 p-1">
            <div className="bg-gradient-to-r from-blue-600/10 to-transparent p-8 border-b border-slate-800/50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">AI CRIME ANALYTICS MATRIX</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Cross-jurisdictional pattern Matching & Behavioral reconstruction</p>
              </div>
              <ShieldAlert className="text-red-500 animate-pulse" size={24} />
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Consistency", value: "High", color: "text-blue-400", bg: "bg-blue-400/5" },
                { title: "Risk", value: "Escalating", color: "text-orange-400", bg: "bg-orange-400/5" },
                { title: "Profiling", value: "Selective", color: "text-purple-400", bg: "bg-purple-400/5" },
                { title: "Window", value: "20:00 - 23:00", color: "text-emerald-400", bg: "bg-emerald-400/5" }
              ].map((stat, i) => (
                <div key={i} className={`p-4 rounded-2xl border border-slate-800 ${stat.bg} hover:border-slate-700 transition-all group`}>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.title}</p>
                   <h4 className={`text-xl font-black italic ${stat.color}`}>{stat.value}</h4>
                </div>
              ))}
            </div>

            <div className="px-8 pb-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50 pb-2">Strategic Intelligence Insights</p>
                {[
                  { pattern: "Methodological Similarity: High-speed escape", confidence: 92, status: "Critical" },
                  { pattern: "Temporal Clustering: Late hour peaks", confidence: 85, status: "Notable" },
                  { pattern: "Target Profile: Isolated individuals", confidence: 78, status: "Emerging" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/20 border border-slate-800/40">
                    <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-blue-500 font-black border border-slate-700 text-[10px]">{i + 1}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-white text-[10px] font-black uppercase tracking-tight">{item.pattern}</p>
                        <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                          item.status === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>{item.status}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500/60" style={{ width: `${item.confidence}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribution Insight */}
          <div className="glass-morphism p-8 rounded-3xl border-slate-800">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">Structural Ratio</h3>
              <Layers className="text-purple-500" size={24} />
            </div>
            <div className="h-[250px] relative">
              <Pie 
                data={{
                  labels: data?.crimeTypeDistribution.slice(0, 5).map(item => item.type),
                  datasets: [{
                    data: data?.crimeTypeDistribution.slice(0, 5).map(item => item.count),
                    backgroundColor: ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'],
                    borderColor: '#1e293b',
                    borderWidth: 4,
                  }]
                }} 
                options={{
                  ...chartOptions,
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
            <div className="mt-10 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-800 pb-2">Top 5 Indicators</p>
              {data?.crimeTypeDistribution.slice(0, 5).map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'][i] }}></div>
                    <span className="text-slate-400 font-bold">{item.type}</span>
                  </div>
                  <span className="text-white font-black italic">{Math.round((item.count / data.totalFIRs) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
