
import React, { useState } from 'react';
import { Entry, Status, Role, User, LeadOrigin } from '../types';
import FollowUpModal from './FollowUpModal';

interface EntryListProps {
  user: User;
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  activeOrigin: LeadOrigin;
}

const EntryList: React.FC<EntryListProps> = ({ user, entries, onEdit, onDelete, onClearAll, activeOrigin }) => {
  const [followUpEntry, setFollowUpEntry] = useState<Entry | null>(null);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.OPEN: return 'bg-blue-100 text-blue-800';
      case Status.WIP: return 'bg-amber-100 text-amber-800';
      case Status.CLOSED: return 'bg-emerald-100 text-emerald-800';
      case Status.SALE_LOST: return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-20 text-center border border-slate-200">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
          <i className={`fas ${activeOrigin === 'Bulk' ? 'fa-cloud' : 'fa-user-tag'} text-3xl`}></i>
        </div>
        <h3 className="text-xl font-black text-slate-900">Zero {activeOrigin} Leads Found</h3>
        <p className="text-slate-500 font-bold text-sm mt-2">Start by adding leads or importing data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4">Lead Information</th>
              <th className="px-6 py-4">Item Details</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right flex items-center justify-end gap-3">
                <span>Actions</span>
                {user.role === Role.ADMIN && (
                  <button 
                    onClick={onClearAll}
                    title={`Delete all ${activeOrigin} leads`}
                    className="text-red-400 hover:text-red-600 transition-colors p-1 bg-red-50 rounded"
                  >
                    <i className="fas fa-trash-sweep"></i>
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map(entry => (
              <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-black text-slate-900">{entry.customerName}</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-2 mt-0.5">
                    <i className="fas fa-phone-alt scale-75"></i> {entry.mobileNumber}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[11px] font-black text-indigo-600 uppercase tracking-tight">{entry.sku || 'GENERAL'}</div>
                  <div className="text-[10px] font-bold text-slate-500 truncate max-w-[180px]">{entry.description || 'No description'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded">{entry.group}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                    {entry.status === Status.SALE_LOST && entry.reasonLost && (
                      <span className="text-[8px] font-bold text-rose-500 uppercase tracking-tighter">
                        {entry.reasonLost}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    {entry.status !== Status.CLOSED && entry.status !== Status.SALE_LOST && (
                      <button onClick={() => setFollowUpEntry(entry)} className="text-emerald-500 hover:text-emerald-700 p-2 rounded-lg hover:bg-emerald-50 transition-all">
                        <i className="fas fa-phone"></i>
                      </button>
                    )}
                    <button onClick={() => onEdit(entry)} className="text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-all">
                      <i className="fas fa-pen-nib"></i>
                    </button>
                    {user.role === Role.ADMIN && (
                      <button onClick={() => onDelete(entry.id)} className="text-red-300 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all">
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {user.role === Role.ADMIN && (
          <div className="px-2 flex justify-end">
            <button onClick={onClearAll} className="text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-trash-sweep"></i> Clear All {activeOrigin} Leads
            </button>
          </div>
        )}
        {entries.map(entry => (
          <div key={entry.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-black text-slate-900 text-lg leading-tight">{entry.customerName}</h4>
                <p className="text-xs font-black text-indigo-600 tracking-widest uppercase mt-0.5">{entry.mobileNumber}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(entry.status)}`}>
                  {entry.status}
                </span>
                {entry.status === Status.SALE_LOST && entry.reasonLost && (
                   <span className="text-[9px] font-bold text-rose-500 uppercase">{entry.reasonLost}</span>
                )}
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-xl mb-4">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Product Details</div>
              <div className="text-xs font-bold text-slate-700">{entry.sku || 'N/A'} - {entry.description}</div>
            </div>

            <div className="flex gap-2">
              {entry.status !== Status.CLOSED && entry.status !== Status.SALE_LOST && (
                <button onClick={() => setFollowUpEntry(entry)} className="flex-1 bg-emerald-600 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100">
                  Follow-up
                </button>
              )}
              <button onClick={() => onEdit(entry)} className="flex-1 bg-indigo-600 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100">
                Edit Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      {followUpEntry && <FollowUpModal entry={followUpEntry} onClose={() => setFollowUpEntry(null)} />}
    </div>
  );
};

export default EntryList;
