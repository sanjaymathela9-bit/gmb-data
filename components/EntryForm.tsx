
import React, { useState } from 'react';
import { Entry, Status, ProductGroup, Role, User } from '../types';
import { GROUPS, STATUSES, LOST_REASONS } from '../constants';

interface EntryFormProps {
  user: User;
  entry: Entry | null;
  onSubmit: (entry: any) => void;
  onCancel: () => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ user, entry, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    date: entry?.date || new Date().toISOString().split('T')[0],
    employeeName: entry?.employeeName || (user.role === Role.ADMIN ? '' : user.name),
    customerName: entry?.customerName || '',
    mobileNumber: entry?.mobileNumber || '',
    group: entry?.group || ProductGroup.APPLE,
    description: entry?.description || '',
    productDescription: entry?.productDescription || '',
    sku: entry?.sku || '',
    skuDescription: entry?.skuDescription || '',
    status: entry?.status || Status.OPEN,
    billNumber: entry?.billNumber || '',
    reasonLost: entry?.reasonLost || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName) newErrors.customerName = 'Customer name is required';
    if (!formData.employeeName) newErrors.employeeName = 'Assigned employee is required';
    if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = '10-digit mobile is required';
    
    if (formData.status === Status.CLOSED && !formData.billNumber) {
      newErrors.billNumber = 'Bill number mandatory for closed leads';
    }

    if (formData.status === Status.SALE_LOST && !formData.reasonLost) {
      newErrors.reasonLost = 'Please provide a reason for the lost sale';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(entry ? { ...entry, ...formData } : formData);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in">
      <div className="bg-indigo-600 px-8 py-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black">{entry ? 'Update Existing Lead' : 'Register New Lead'}</h2>
          <p className="text-xs text-indigo-100 font-bold uppercase tracking-widest mt-1">Fill in the customer and product details</p>
        </div>
        <button type="button" onClick={onCancel} className="bg-white/10 w-10 h-10 rounded-full hover:bg-white/20 transition-colors">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filing Date</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Person Name</label>
            <input 
              type="text" 
              placeholder="Enter associate name..."
              value={formData.employeeName}
              onChange={e => setFormData({...formData, employeeName: e.target.value})}
              className={`w-full bg-slate-50 border ${errors.employeeName ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            />
            {errors.employeeName && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.employeeName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              className={`w-full bg-slate-50 border ${errors.customerName ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</label>
            <input 
              type="tel" 
              placeholder="10 Digits"
              value={formData.mobileNumber}
              onChange={e => setFormData({...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})}
              className={`w-full bg-slate-50 border ${errors.mobileNumber ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
            />
          </div>
        </div>

        <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Product Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Category</label>
              <select 
                value={formData.group}
                onChange={e => setFormData({...formData, group: e.target.value as ProductGroup})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU ID</label>
              <input 
                type="text" 
                placeholder="N/A if unknown"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Description</label>
              <input 
                type="text" 
                placeholder="Specific model details..."
                value={formData.skuDescription}
                onChange={e => setFormData({...formData, skuDescription: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Description</label>
              <input 
                type="text" 
                placeholder="Broad product info..."
                value={formData.productDescription}
                onChange={e => setFormData({...formData, productDescription: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Notes</label>
            <textarea 
              rows={2}
              placeholder="Any other specific requirements..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Status</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as Status})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          
          {formData.status === Status.CLOSED && (
            <div className="space-y-2 animate-slide-down">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Final Bill Number</label>
              <input 
                type="text" 
                placeholder="Enter invoice ID"
                value={formData.billNumber}
                onChange={e => setFormData({...formData, billNumber: e.target.value})}
                className={`w-full bg-slate-50 border ${errors.billNumber ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              />
              {errors.billNumber && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.billNumber}</p>}
            </div>
          )}

          {formData.status === Status.SALE_LOST && (
            <div className="space-y-2 animate-slide-down">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Loss</label>
              <select 
                value={formData.reasonLost}
                onChange={e => setFormData({...formData, reasonLost: e.target.value})}
                className={`w-full bg-slate-50 border ${errors.reasonLost ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
              >
                <option value="">Select Reason...</option>
                {LOST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.reasonLost && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.reasonLost}</p>}
            </div>
          )}
        </div>

        <div className="pt-6 flex gap-4">
          <button type="submit" className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest text-xs">
            {entry ? 'Update Record' : 'Commit Lead Entry'}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;
