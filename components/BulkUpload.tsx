
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
          status: Status.OPEN,
          sku: '',
          skuDescription: '',
          description: '',
          customerName: '',
          mobileNumber: '',
          group: ProductGroup.APPLE
        };
        
        headers.forEach((header, index) => {
          const val = values[index] || '';
          if (header.includes('name') || header === 'customer') entry.customerName = val;
          if (header.includes('mobile') || header === 'phone' || header.includes('contact')) entry.mobileNumber = val;
          if (header.includes('group') || header.includes('category')) entry.group = val;
          if (header === 'sku' || header.includes('product id')) entry.sku = val;
          if (header.includes('sku description')) entry.skuDescription = val;
          // Robust mapping for Product Description
          if (header.includes('product description') || header === 'description' || header.includes('details')) entry.description = val;
          if (header.includes('date')) entry.date = val || entry.date;
        });

        let rowError = '';
        if (!entry.customerName) rowError = `Row ${i}: Missing Name`;
        else if (!/^\d{10}$/.test(entry.mobileNumber.replace(/\s/g, ''))) rowError = `Row ${i}: Mobile must be 10 digits`;
        else if (!GROUPS.includes(entry.group as ProductGroup)) rowError = `Row ${i}: Invalid Group "${entry.group}"`;

        if (rowError) errors.push(rowError);
        else parsedData.push(entry);
      }
      setPreview({ data: parsedData, errors });
    };
    reader.readAsText(file);
  };

  const handleDeleteRow = (index: number) => {
    if (!preview) return;
    const newData = [...preview.data];
    newData.splice(index, 1);
    setPreview({ ...preview, data: newData });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-6xl mx-auto animate-fade-in">
      <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black">Bulk Data Processing</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Import mass leads into the Bulk Database</p>
        </div>
        <button 
          onClick={onClearDatabase}
          className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-600/20"
        >
          <i className="fas fa-trash-alt mr-2"></i> Wipe Database
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
            <p className="text-slate-500 font-bold mt-2">Required Columns: Name, Mobile, Group, Product Description, SKU</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">Import Preview ({preview.data.length} Leads)</h3>
              <button onClick={() => setPreview(null)} className="text-indigo-600 font-black text-xs hover:underline uppercase">Switch File</button>
            </div>

            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 sticky top-0">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Customer Name</th>
                      <th className="px-6 py-4">Mobile</th>
                      <th className="px-6 py-4">SKU / Description</th>
                      <th className="px-6 py-4">Group</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.data.map((row, idx) => (
                      <tr key={idx} className="text-sm font-bold">
                        <td className="px-6 py-4 text-slate-900">{row.customerName}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono">{row.mobileNumber}</td>
                        <td className="px-6 py-4">
                          <div className="text-indigo-600 text-xs font-black">{row.sku}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{row.description}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{row.group}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteRow(idx)} className="text-red-400 hover:text-red-600 p-2">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => onUpload(preview.data)}
                className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                Complete Import to Bulk Database
              </button>
              <button onClick={onCancel} className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
