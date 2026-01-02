
import React, { useState, useRef } from 'react';
import { Entry, Status, ProductGroup, Role, User } from '../types';
import { GROUPS } from '../constants';

interface BulkUploadProps {
  user: User;
  onUpload: (newEntries: Omit<Entry, 'id' | 'createdAt' | 'employeeId' | 'employeeName' | 'origin'>[]) => void;
  onClearDatabase: () => void;
  onCancel: () => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ user, onUpload, onClearDatabase, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{data: any[], errors: string[]} | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>(Status.OPEN);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split(/\r?\n/).filter(row => row.trim());
      if (rows.length < 2) return;
      
      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      const parsedData: any[] = [];
      const errors: string[] = [];

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim());
        const entry: any = {
          date: new Date().toISOString().split('T')[0],
          status: defaultStatus,
          sku: '',
          skuDescription: '',
          productDescription: '',
          description: '',
          customerName: '',
          mobileNumber: '',
          group: ProductGroup.APPLE
        };
        
        let rowStatusFound = false;
        let detectedStatus: Status | null = null;

        headers.forEach((header, index) => {
          const val = values[index] || '';
          
          // Customer Name
          if (header.includes('name') || header === 'customer') {
            entry.customerName = val;
          }
          
          // Mobile No
          if (header.includes('mobile') || header === 'phone' || header.includes('contact') || header.includes('no')) {
            entry.mobileNumber = val;
          }
          
          // Date
          if (header.includes('date')) {
            entry.date = val || entry.date;
          }
          
          // Group
          if (header.includes('group') || header.includes('category')) {
            const foundGroup = GROUPS.find(g => g.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(g.toLowerCase()));
            if (foundGroup) entry.group = foundGroup;
          }
          
          // SKU
          if (header === 'sku' || header.includes('product id') || header.includes('model')) {
            entry.sku = val;
          }
          
          // SKU Description
          if (header.includes('sku description') || header.includes('sku_description')) {
            entry.skuDescription = val;
          }
          
          // Product Description
          if (header.includes('product description') || header.includes('prod_desc')) {
            entry.productDescription = val;
          } else if (header.includes('description') || header === 'details') {
            // Fallback for general description
            entry.description = val;
            if (!entry.productDescription) entry.productDescription = val;
          }

          // Status detection (STRICT: ONLY OPEN OR WIP)
          if (header.includes('status')) {
            const lowerVal = val.toLowerCase();
            if (lowerVal === 'wip') {
              detectedStatus = Status.WIP;
              rowStatusFound = true;
            } else if (lowerVal === 'open') {
              detectedStatus = Status.OPEN;
              rowStatusFound = true;
            } else {
              rowStatusFound = true; 
              detectedStatus = null; 
            }
          }
        });

        if (detectedStatus) {
          entry.status = detectedStatus;
        }

        let rowError = '';
        const sanitizedMobile = entry.mobileNumber.replace(/\D/g, '');
        
        if (!entry.customerName) {
          rowError = `Row ${i}: Missing Customer Name`;
        } else if (sanitizedMobile.length !== 10) {
          rowError = `Row ${i}: Mobile must be 10 digits`;
        } else if (!GROUPS.includes(entry.group as ProductGroup)) {
          rowError = `Row ${i}: Invalid Group "${entry.group}"`;
        } else if (rowStatusFound && !detectedStatus) {
          rowError = `Row ${i}: Status must be "WIP" or "Open" (skipped other)`;
        }

        if (rowError) {
          errors.push(rowError);
        } else {
          entry.mobileNumber = sanitizedMobile;
          parsedData.push(entry);
        }
      }
      setPreview({ data: parsedData, errors });
    };
    reader.readAsText(file);
  };

  const handleUpdateAllStatuses = (status: Status) => {
    setDefaultStatus(status);
    if (preview) {
      const newData = preview.data.map(item => ({ ...item, status }));
      setPreview({ ...preview, data: newData });
    }
  };

  const handleDeleteRow = (index: number) => {
    if (!preview) return;
    const newData = [...preview.data];
    newData.splice(index, 1);
    setPreview({ ...preview, data: newData });
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.OPEN: return 'bg-blue-100 text-blue-800';
      case Status.WIP: return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-6xl mx-auto animate-fade-in">
      <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black">Bulk Data Processing</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Import Policy: <span className="text-emerald-400">Capturing only "WIP" & "Open" leads</span>
          </p>
        </div>
        <button 
          onClick={onClearDatabase}
          className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-600/20"
        >
          <i className="fas fa-trash-alt mr-2"></i> Wipe All Entries
        </button>
      </div>

      <div className="p-10 space-y-8">
        {!preview ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-slate-200 rounded-3xl p-16 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
            <div className="bg-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <i className="fas fa-file-csv text-indigo-600 text-4xl"></i>
            </div>
            <h3 className="text-xl font-black text-slate-900">Choose CSV Lead Sheet</h3>
            <p className="text-slate-500 font-bold mt-2 mb-4">
              Columns: <span className="text-indigo-600 font-black">Name, Mobile, Date, Group, SKU, SKU Description, Product Description, Status</span>
            </p>
            <div className="inline-block px-4 py-2 bg-rose-50 rounded-lg text-[10px] font-black text-rose-500 uppercase tracking-widest">
              Note: Only "Open" or "WIP" rows will be captured
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Valid Leads Found: {preview.data.length}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initial status for items without status in file:</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdateAllStatuses(Status.OPEN)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${defaultStatus === Status.OPEN ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-blue-600 border border-blue-200'}`}
                >
                  Set Default to OPEN
                </button>
                <button 
                  onClick={() => handleUpdateAllStatuses(Status.WIP)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${defaultStatus === Status.WIP ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-amber-600 border border-amber-200'}`}
                >
                  Set Default to WIP
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Mobile</th>
                      <th className="px-6 py-4">Group</th>
                      <th className="px-6 py-4">SKU / Prod Description</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.data.map((row, idx) => (
                      <tr key={idx} className="text-sm font-bold">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-900">
                          {row.customerName}
                          <div className="text-[10px] text-slate-400">{row.date}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono">{row.mobileNumber}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black bg-slate-50 px-2 py-1 rounded border border-slate-100">{row.group}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-indigo-600 text-[11px] font-black">{row.sku || 'N/A'}</div>
                          <div className="text-[10px] text-slate-900 font-bold truncate max-w-[150px]">{row.productDescription || 'No Product Desc'}</div>
                          <div className="text-[9px] text-slate-400 truncate max-w-[150px] italic">{row.skuDescription}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteRow(idx)} className="text-red-300 hover:text-red-600 p-2">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {preview.errors.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <i className="fas fa-info-circle"></i> Filtered/Invalid Rows ({preview.errors.length}):
                </h4>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {preview.errors.map((err, i) => (
                    <p key={i} className="text-[9px] font-bold text-slate-400 italic">{err}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => onUpload(preview.data)}
                disabled={preview.data.length === 0}
                className={`flex-[2] font-black py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs ${preview.data.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}
              >
                Sync {preview.data.length} Filtered Leads
              </button>
              <button onClick={() => setPreview(null)} className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
                Upload New File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
