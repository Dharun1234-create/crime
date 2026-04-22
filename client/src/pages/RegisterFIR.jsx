import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FilePlus, ShieldCheck, MapPin, Calendar, User, Search, FileText, CheckCircle2, Download, Activity, Clock } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import FIRDocument from '../components/FIRDocument';

const RegisterFIR = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredFIR, setRegisteredFIR] = useState(null);
  const [error, setError] = useState('');
  const [officers, setOfficers] = useState([]);
  
  // AI Analysis States
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    crimeType: 'Theft',
    complainantName: '',
    complainantAge: '',
    complainantAddress: '',
    complainantContact: '',
    accusedDetails: 'Unknown',
    location: '',
    district: user?.assignedDistrict || 'Chennai',
    incidentTime: '',
    policeStation: 'Central Police Station',
    date: new Date().toISOString().substring(0, 10),
    description: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        district: user.assignedDistrict || 'Chennai'
      }));
    }

    const fetchOfficers = async () => {
      if (user?.role === 'admin') {
        try {
          const response = await api.get('/auth/users');
          const filtered = response.data.users.filter(u => u.role === 'inspector');
          setOfficers(filtered);
          if (filtered.length > 0) {
            setFormData(prev => ({ ...prev, assignedTo: filtered[0]._id }));
          }
        } catch (err) {
          console.error("Failed to fetch officers", err);
        }
      }
    };
    fetchOfficers();
  }, [user]);

  const crimeTypes = [
    'Theft', 'Robbery', 'Assault', 'Murder', 'Fraud', 'Cybercrime', 
    'Drug Trafficking', 'Kidnapping', 'Domestic Violence', 'Vandalism', 'Burglary', 'Other'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePDF = async () => {
    try {
      const response = await api.get(`/fir/generate-pdf/${registeredFIR._id}`, {
        responseType: 'blob'
      });
      
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `FIR_Report_${registeredFIR.firNumber.replace(/\//g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate official PDF report.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/fir/create', formData);
      if (response.data.success) {
        setRegisteredFIR(response.data.fir);
        setSuccess(true);
        triggerAIAnalysis(response.data.fir);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register FIR');
    } finally {
      setLoading(false);
    }
  };

  const triggerAIAnalysis = async (fir) => {
    setAiLoading(true);
    setAiStep(1);
    
    // Animation timer for steps
    const steps = [
      "Scanning past records...",
      "Analyzing crime patterns...",
      "Reconstructing possible scenario...",
      "Predicting timeline..."
    ];

    for (let i = 1; i <= 4; i++) {
      setAiStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    try {
      const response = await api.post('/analysis/ai-crime-analysis', {
        crimeType: fir.crimeType,
        location: fir.location,
        district: fir.district,
        description: fir.description,
        date: fir.date,
        firId: fir._id
      });
      
      if (response.data.success) {
        setAiAnalysis(response.data.analysis);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setAiLoading(false);
    }
  };

  if (success) {
    const aiSteps = [
      "Scanning past records...",
      "Analyzing crime patterns...",
      "Reconstructing possible scenario...",
      "Predicting timeline..."
    ];

    return (
      <Layout title="Registration & AI Analysis">
        <div className="flex flex-col items-center py-12 px-4 max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic text-center">Registration Complete</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-12">Case ID: {registeredFIR?._id.toUpperCase()}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* AI Analysis Progress/Result */}
            <div className="glass-morphism rounded-3xl border-slate-800 p-8 bg-slate-900/40 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck size={120} className="text-blue-500" />
               </div>
               
               <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  AI Crime Analysis
               </h3>

               {aiLoading || aiStep < 4 && !aiAnalysis ? (
                 <div className="space-y-8">
                    {aiSteps.map((step, idx) => (
                      <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${aiStep > idx ? 'opacity-100' : 'opacity-20'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                          aiStep > idx + 1 ? 'bg-blue-600 border-blue-600' : 
                          aiStep === idx + 1 ? 'border-blue-500 animate-pulse' : 'border-slate-700'
                        }`}>
                          {aiStep > idx + 1 ? <CheckCircle2 size={12} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-widest ${aiStep === idx + 1 ? 'text-blue-400' : 'text-slate-500'}`}>
                          {step}
                        </p>
                      </div>
                    ))}
                    <div className="pt-4">
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(aiStep / 4) * 100}%` }}></div>
                      </div>
                    </div>
                 </div>
               ) : aiAnalysis ? (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Similar Cases</p>
                        <p className="text-2xl font-black text-white italic">{aiAnalysis.similarCases}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Risk Level</p>
                        <p className={`text-2xl font-black italic ${
                          aiAnalysis.riskLevel === 'High' ? 'text-red-500' : 
                          aiAnalysis.riskLevel === 'Medium' ? 'text-orange-500' : 'text-emerald-500'
                        }`}>{aiAnalysis.riskLevel}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Search size={12} /> Pattern Insight
                        </p>
                        <p className="text-slate-300 text-sm leading-relaxed bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
                          {aiAnalysis.patternInsight}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Activity size={12} /> Execution Method
                        </p>
                        <p className="text-slate-300 text-xs leading-relaxed italic">
                          "{aiAnalysis.executionMethod}"
                        </p>
                      </div>

                      <div className="flex justify-between items-center bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-orange-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Predicted Timeline</span>
                        </div>
                        <span className="text-white font-black italic text-sm">{aiAnalysis.predictedTime}</span>
                      </div>

                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Investigation Hint</p>
                        <p className="text-slate-300 text-xs">{aiAnalysis.investigationHint}</p>
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-12 text-slate-600 uppercase text-[10px] font-black">
                    Analysis Engine Error
                 </div>
               )}
            </div>

            {/* Actions Card */}
            <div className="space-y-6 flex flex-col justify-center">
              <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl space-y-6">
                <h4 className="text-sm font-black text-white uppercase italic tracking-widest">Available Operations</h4>
                
                <button 
                  onClick={handlePDF}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-3"
                >
                  <Download size={18} /> Download FIR PDF
                </button>

                <button 
                  onClick={() => navigate(`/fir/${registeredFIR._id}`)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-blue-900/40"
                >
                  Internal Case Dashboard
                </button>

                <button 
                  onClick={() => navigate('/records')}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all border border-slate-700"
                >
                  Return to Registry
                </button>
              </div>
              
              <div className="p-6 rounded-2xl border border-blue-500/10 bg-blue-500/5">
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Automated Report</p>
                <p className="text-slate-500 text-xs italic leading-relaxed">
                  The AI-generated insights above are based on historical crime patterns and are intended for investigational assistance only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Register New FIR">
      <div className="max-w-4xl mx-auto">
        <div className="glass-morphism rounded-3xl border-slate-800 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600/20 to-transparent p-8 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <FilePlus className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Legal Case Entry</h3>
                <p className="text-slate-400 text-sm">Official documentation of crime report</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-8 mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-10 space-y-10">
            {/* 1. Station & Jurisdiction */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest border-l-4 border-blue-500 pl-4">I. Station & Jurisdiction</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Police Station Name</label>
                  <input type="text" name="policeStation" value={formData.policeStation} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">District</label>
                  <select name="district" value={formData.district} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none cursor-pointer" required>
                    {['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirunelveli', 'Thanjavur', 'Vellore', 'Erode', 'Dharmapuri', 'Thoothukudi', 'Virudhunagar', 'Tenkasi', 'Kanniyakumari'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Complainant Details */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-emerald-500 uppercase tracking-widest border-l-4 border-emerald-500 pl-4">II. Complainant Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2 lg:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                  <input type="text" name="complainantName" value={formData.complainantName} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Age</label>
                  <input type="number" name="complainantAge" value={formData.complainantAge} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none" placeholder="25" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Number</label>
                  <input type="text" name="complainantContact" value={formData.complainantContact} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none" placeholder="+91 9876543210" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Residential Address</label>
                <textarea name="complainantAddress" value={formData.complainantAddress} onChange={handleChange} rows="2" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none" placeholder="Enter full address..." required></textarea>
              </div>
            </div>

            {/* 3. Incident Details */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-orange-500 uppercase tracking-widest border-l-4 border-orange-500 pl-4">III. Incident & Case Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Case Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Crime Category</label>
                  <select name="crimeType" value={formData.crimeType} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none cursor-pointer" required>
                    {crimeTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date of Incident</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time of Incident</label>
                  <input type="time" name="incidentTime" value={formData.incidentTime} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none" required />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Incident Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none" placeholder="Specific area or street address" required />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Accused Details (if known)</label>
                  <input type="text" name="accusedDetails" value={formData.accusedDetails} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none" placeholder="Description or name of accused..." />
                </div>
              </div>
            </div>

            {/* 4. Assignment */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-purple-500 uppercase tracking-widest border-l-4 border-purple-500 pl-4">IV. Identification & Assignment</h4>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" /> Investigating Officer
                </label>
                {user?.role === 'admin' ? (
                  <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none cursor-pointer" required>
                    <option value="">Select an Officer</option>
                    {officers.map(off => <option key={off._id} value={off._id}>{off.name}</option>)}
                  </select>
                ) : (
                  <div className="w-full bg-slate-900/50 border border-slate-800/50 rounded-xl py-3 px-4 text-slate-400 font-bold flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    {user?.name} (Self-assigned)
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FileText size={14} className="text-blue-500" /> Incident Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700 font-medium leading-relaxed"
                placeholder="Provide detailed information about the incident..."
                required
              ></textarea>
            </div>

            <div className="pt-8 flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/records')}
                className="px-8 py-4 rounded-xl border border-slate-800 text-slate-400 font-bold hover:bg-slate-900 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Complete Registration & Trigger Analysis'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterFIR;
