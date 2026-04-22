import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

const FIRDocument = ({ fir }) => {
  if (!fir) return null;

  return (
    <div id="fir-document" className="p-12 bg-white text-slate-900 font-serif relative overflow-hidden" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
        <h1 className="text-[120px] font-black uppercase -rotate-45 border-8 border-slate-900 p-8">Official Copy</h1>
      </div>

      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-1">Police Department</h1>
        <h2 className="text-lg font-bold uppercase tracking-widest text-slate-600 mb-2">Government of Tamil Nadu</h2>
        <div className="flex justify-between items-center px-4 mt-4 text-xs font-bold uppercase">
          <p>Station: {fir.policeStation}</p>
          <p>District: {fir.district}</p>
          <p>State: Tamil Nadu</p>
        </div>
      </div>

      {/* FIR Summary Bar */}
      <div className="bg-slate-100 p-4 rounded-lg mb-8 flex justify-between items-center border border-slate-200">
        <div>
          <p className="text-[10px] font-black uppercase text-slate-500 mb-1">First Information Report No.</p>
          <p className="text-xl font-black tracking-tighter text-blue-900">{fir.firNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Date of Registration</p>
          <p className="text-sm font-bold">{format(new Date(fir.createdAt), 'dd MMMM yyyy, HH:mm')}</p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-sm leading-relaxed">
        {/* 1. Complainant */}
        <section>
          <h3 className="font-black uppercase border-b border-slate-200 pb-1 mb-4 flex justify-between items-center text-xs tracking-widest">
            <span>I. Details of Complainant / Informant</span>
          </h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div><p className="text-[10px] font-black uppercase text-slate-500">Name</p><p className="font-bold">{fir.complainantName}</p></div>
            <div><p className="text-[10px] font-black uppercase text-slate-500">Age</p><p className="font-bold">{fir.complainantAge} Years</p></div>
            <div><p className="text-[10px] font-black uppercase text-slate-500">Contact</p><p className="font-bold">{fir.complainantContact}</p></div>
            <div><p className="text-[10px] font-black uppercase text-slate-500">Occupation</p><p className="font-bold">Not Specified</p></div>
            <div className="col-span-2"><p className="text-[10px] font-black uppercase text-slate-500">Permanent Address</p><p className="font-bold">{fir.complainantAddress}</p></div>
          </div>
        </section>

        {/* 2. Incident */}
        <section>
          <h3 className="font-black uppercase border-b border-slate-200 pb-1 mb-4 text-xs tracking-widest">II. Details of Occurrence</h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div><p className="text-[10px] font-black uppercase text-slate-500">Date of Incident</p><p className="font-bold">{format(new Date(fir.date), 'dd/MM/yyyy')}</p></div>
            <div><p className="text-[10px] font-black uppercase text-slate-500">Time of Incident</p><p className="font-bold">{fir.incidentTime}</p></div>
            <div className="col-span-2"><p className="text-[10px] font-black uppercase text-slate-500">Place of Occurrence</p><p className="font-bold">{fir.location}, {fir.district}</p></div>
          </div>
        </section>

        {/* 3. Offence */}
        <section>
          <h3 className="font-black uppercase border-b border-slate-200 pb-1 mb-4 text-xs tracking-widest">III. Nature of Offence</h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div><p className="text-[10px] font-black uppercase text-slate-500">Crime Category</p><p className="font-bold">{fir.crimeType}</p></div>
            <div><p className="text-[10px] font-black uppercase text-slate-500">Accused Details</p><p className="font-bold text-red-700">{fir.accusedDetails || 'Unknown'}</p></div>
            <div className="col-span-2"><p className="text-[10px] font-black uppercase text-slate-500">Description of Complaint</p><div className="bg-slate-50 p-4 rounded border border-slate-200 italic font-medium mt-1">{fir.description}</div></div>
          </div>
        </section>

        {/* 4. Investigation */}
        <section>
          <h3 className="font-black uppercase border-b border-slate-200 pb-1 mb-4 text-xs tracking-widest">IV. Investigating Officer</h3>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500">Assigned Officer</p>
              <p className="font-bold">{fir.assignedOfficerName}</p>
              <p className="text-[10px] text-slate-500 italic mt-1">Designation: Inspector of Police</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-16 border-b border-dashed border-slate-400 mb-2 flex items-end justify-center">
                <span className="text-[10px] italic text-slate-400 uppercase tracking-widest font-black">Digital Signature</span>
              </div>
              <p className="text-[10px] font-black uppercase">Official Seal</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer / QR Code */}
      <div className="mt-auto pt-12 flex justify-between items-end border-t border-slate-100">
        <div>
          <div className="p-2 bg-white border border-slate-200 rounded">
            <QRCodeSVG value={`https://police.tn.gov.in/verify/${fir.firNumber}`} size={80} />
          </div>
          <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Scan for official verification</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Electronically Generated Copy</p>
          <p className="text-[8px] text-slate-400">Timestamp: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
};

export default FIRDocument;
