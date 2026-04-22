import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  History, 
  Activity,
  ChevronRight,
  Info,
  Archive,
  BarChart3,
  Search,
  MessageSquare,
  CheckCircle2,
  XSquare,
  Download,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

const FIRDetails = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [fir, setFir] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [statusData, setStatusData] = useState({ status: '', note: '' });
  const [requestMsg, setRequestMsg] = useState('');

  const handlePDF = async (action = 'download') => {
    try {
      const response = await api.get(`/fir/generate-pdf/${id}`, {
        responseType: 'blob'
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      if (action === 'preview') {
        window.open(fileURL, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', `FIR_Report_${fir.firNumber.replace(/\//g, '_')}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate official PDF report. Please try again.");
    }
  };

  const fetchData = async () => {
    try {
      const [firRes, analysisRes] = await Promise.all([
        api.get(`/fir/${id}`),
        api.get(`/analysis/fir/${id}`)
      ]);
      
      if (firRes.data.success) {
        setFir(firRes.data.fir);
        setStatusData({ status: firRes.data.fir.status, note: '' });
      }
      if (analysisRes.data.success) setAnalysis(analysisRes.data.analysis);
    } catch (error) {
      console.error("Failed to fetch FIR details or analysis", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.put(`/fir/update/${id}`, statusData);
      if (response.data.success) {
        setFir(response.data.fir);
        setShowStatusModal(false);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Status update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post(`/fir/request-update/${id}`, { message: requestMsg });
      if (response.data.success) {
        alert("Update request sent to Officer Sharma");
        setShowRequestModal(false);
        setRequestMsg('');
        fetchData();
      }
    } catch (error) {
      alert("Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Case File Analysis">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Decrypting Evidence...</p>
        </div>
      </Layout>
    );
  }

  if (!fir) return <Layout title="Error">Case not found</Layout>;

  const isAssignedOfficer = currentUser?.id === (fir.assignedTo._id || fir.assignedTo);
  const isAdmin = currentUser?.role === 'admin';

  return (
    <Layout title={`Case ID: #${fir._id.substring(fir._id.length - 8).toUpperCase()}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: FIR Core Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-morphism rounded-3xl border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-900/40 to-transparent p-8 border-b border-slate-800 flex justify-between items-start">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-tighter">
                  Official Record
                </span>
                <h1 className="text-3xl font-bold text-white uppercase tracking-tight">{fir.title}</h1>
                <div className="flex flex-wrap gap-6 text-sm text-slate-400 font-medium">
                  <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-500" /> {fir.location}</span>
                  <span className="flex items-center gap-2"><Calendar size={16} className="text-blue-500" /> {format(new Date(fir.date), 'MMMM dd, yyyy')}</span>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className={`text-sm font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 border ${
                  fir.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                  fir.status === 'Investigating' ? 'bg-purple-500/10 text-purple-500 border-purple-500/30' :
                  'bg-orange-500/10 text-orange-500 border-orange-500/30'
                }`}>
                  <Activity size={16} />
                  {fir.status}
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mr-2">Current Status</p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePDF('preview')}
                    className="mt-4 flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700 group"
                    title="Preview in Browser"
                  >
                    <Eye size={14} className="group-hover:scale-110 transition-transform" />
                    View
                  </button>
                  <button 
                    onClick={() => handlePDF('download')}
                    className="mt-4 flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-blue-500/30 group"
                    title="Download PDF"
                  >
                    <Download size={14} className="group-hover:scale-110 transition-transform" />
                    PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-10">
              {/* Stakeholders Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/30 p-6 rounded-2xl border border-slate-800/50">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Created By</p>
                  <p className="text-white font-bold flex items-center gap-2">
                    <User size={14} className="text-blue-500" /> {fir.createdBy}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Assigned Officer</p>
                  <p className="text-white font-bold flex items-center gap-2">
                    <Shield size={14} className="text-emerald-500" /> {fir.assignedOfficerName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Complainant</p>
                  <p className="text-white font-bold flex items-center gap-2">
                    <User size={14} className="text-purple-500" /> {fir.complainantName}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest">Incident Narrative</h3>
                </div>
                <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-8 rounded-2xl border border-slate-800 italic">
                  "{fir.description}"
                </p>
              </div>

              {/* Status History Timeline */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest">Status History Timeline</h3>
                </div>
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-blue-500 before:to-slate-800">
                  {fir.statusHistory?.map((log, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-start md:odd:flex-row-reverse group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-950 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {log.status === 'Closed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-800 bg-slate-900/50 ml-6 md:ml-0 shadow-lg">
                        <div className="flex items-center justify-between mb-1">
                          <time className="text-[10px] font-black text-slate-500 uppercase">{format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}</time>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            log.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                          }`}>{log.status}</span>
                        </div>
                        <p className="text-white text-sm font-bold mb-1">{log.note}</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight">Updated by {log.updatedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-slate-800 flex flex-wrap gap-4">
                <p className="w-full text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Role-Based Control Terminal</p>
                
                {isAssignedOfficer && (
                  <>
                    <button 
                      onClick={() => setShowStatusModal(true)}
                      className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Activity size={16} /> Update Status
                    </button>
                    <button 
                      onClick={() => {
                        setStatusData({ status: 'Closed', note: 'Case investigation completed and verified.' });
                        setShowStatusModal(true);
                      }}
                      disabled={fir.status === 'Closed'}
                      className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      Complete & Close Case
                    </button>
                  </>
                )}

                {isAdmin && (
                  <button 
                    onClick={() => setShowRequestModal(true)}
                    className="px-6 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-900/20 hover:bg-orange-700 transition-all flex items-center gap-2"
                  >
                    <MessageSquare size={16} /> Request Case Update
                  </button>
                )}

                {!isAssignedOfficer && !isAdmin && (
                  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-500 text-xs font-bold italic">
                    Read-only access: Control limited to assigned officer.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admin Requests History (Visible to Admin and Assigned Officer) */}
          {(isAdmin || isAssignedOfficer) && fir.adminRequests?.length > 0 && (
            <div className="glass-morphism rounded-3xl border-slate-800 p-8">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3 italic">
                <MessageSquare className="text-orange-500" /> Administrative Directives
              </h3>
              <div className="space-y-4">
                {fir.adminRequests.map((req, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">{req.senderName} (Admin)</span>
                      <time className="text-[9px] text-slate-600 font-bold">{format(new Date(req.timestamp), 'MMM dd, HH:mm')}</time>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">"{req.message}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: SMART ANALYSIS PANEL */}
        <div className="space-y-8">
        {/* Right Column: AI CRIME ANALYSIS PANEL */}
        <div className="space-y-8">
          <div className="glass-morphism rounded-3xl border-slate-800 p-8 relative overflow-hidden bg-slate-900/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
            
            <div className="flex items-center gap-3 mb-10">
              <div className="p-2 bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <Shield className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-black text-white tracking-widest uppercase italic">AI Crime Analysis</h3>
            </div>

            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Similar Cases</p>
                  <p className="text-2xl font-black text-white italic">{analysis?.similarCases || 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Risk Level</p>
                  <p className={`text-2xl font-black italic ${
                    analysis?.riskLevel === 'High' ? 'text-red-500' : 
                    analysis?.riskLevel === 'Medium' ? 'text-orange-500' : 'text-emerald-500'
                  }`}>{analysis?.riskLevel || 'Low'}</p>
                </div>
              </div>

              {/* Pattern Insight */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                  <Search size={12} /> Behavioral Pattern
                </p>
                <div className="bg-blue-600/5 border border-blue-500/20 p-5 rounded-2xl">
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    "{analysis?.patternInsight || "No recurring pattern detected for this specific incident profile."}"
                  </p>
                </div>
              </div>

              {/* Execution Method */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} /> Execution Insight
                </p>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {analysis?.executionMethod || "Traditional approach with standard execution pattern."}
                  </p>
                </div>
              </div>

              {/* Timeline Prediction */}
              <div className="flex justify-between items-center bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-orange-500" />
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Predicted Time Range</p>
                    <p className="text-white font-black italic">{analysis?.predictedTime || "N/A"}</p>
                  </div>
                </div>
                <TrendingUp size={24} className="text-slate-700" />
              </div>

              {/* Investigation Hint */}
              <div className="p-5 rounded-2xl bg-emerald-600/10 border border-emerald-500/20">
                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Info size={12} /> Strategic Hint
                </h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {analysis?.investigationHint || "Continue standard investigative procedures and monitor for local tip-offs."}
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-800/50">
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center italic">
                AI Pattern Engine v2.4 • Analysis Encrypted
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowStatusModal(false)}></div>
          <div className="relative w-full max-w-lg glass-morphism rounded-3xl border-slate-800 p-8 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <Activity className="text-blue-500" /> Update Investigation Status
            </h3>
            <form onSubmit={handleStatusUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Status</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white font-bold"
                  value={statusData.status}
                  onChange={(e) => setStatusData({...statusData, status: e.target.value})}
                >
                  <option value="Pending">Pending</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Closed">Closed / Resolved</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Investigation Note</label>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm"
                  placeholder="Summarize the current progress or findings..."
                  rows="4"
                  required
                  value={statusData.note}
                  onChange={(e) => setStatusData({...statusData, note: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowStatusModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20">
                  {submitting ? "Processing..." : "Commit Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST UPDATE MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowRequestModal(false)}></div>
          <div className="relative w-full max-w-lg glass-morphism rounded-3xl border-slate-800 p-8 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3 italic">
              <MessageSquare className="text-orange-500" /> Dispatch Administrative Directive
            </h3>
            <p className="text-slate-400 text-xs mb-6 font-medium">Send a secure inquiry to Officer {fir.assignedOfficerName} regarding this case.</p>
            <form onSubmit={handleSendRequest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Directive Message</label>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm"
                  placeholder="Need immediate status on evidence collection..."
                  rows="4"
                  required
                  value={requestMsg}
                  onChange={(e) => setRequestMsg(e.target.value)}
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2">
                  <Activity size={16} /> Send Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FIRDetails;
