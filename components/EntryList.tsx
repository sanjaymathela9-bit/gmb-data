
import React, { useState, useEffect, useMemo } from 'react';
import { Entry, Status, Role, User, LeadOrigin } from '../types';
import FollowUpModal from './FollowUpModal';

interface EntryListProps {
  user: User;
  entries: Entry[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onClearAll: () => void;
  activeOrigin: LeadOrigin;
}

const EntryList: React.FC<EntryListProps> = ({ user, entries, onEdit, onDelete, onDeleteMultiple, onClearAll, activeOrigin }) => {
  const [followUpEntry, setFollowUpEntry] = useState<Entry | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Reset selection and page when entries change or tab switches
  useEffect(() => {
    setSelectedIds(new Set());
    setCurrentPage(1);
  }, [activeOrigin, entries.length]);

  const totalPages = Math.ceil(entries.length / itemsPerPage);
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return entries.slice(start, start + itemsPerPage);
  }, [entries, currentPage, itemsPerPage]);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.OPEN: return 'bg-blue-100 text-blue-800';
      case Status.WIP: return 'bg-amber-100 text-amber-800';
      case Status.CLOSED: return 'bg-emerald-100 text-emerald-800';
      case Status.SALE_LOST: return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedEntries.map(e => e.id)));
    }
  };

  const handleBulkDelete = () => {
    onDeleteMultiple(Array.from(selectedIds));
    setSelectedIds(new Set());
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
    <div className="space-y-4 relative">
      {/* Selection Action Bar (Desktop Floating) */}
      {selectedIds.size > 0 && user.role === Role.ADMIN && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-slide-up border border-slate-700">
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Selected</span>
            <span className="text-xl font-black">{selectedIds.size} <span className="text-sm text-slate-400 font-bold">Records</span></span>
          </div>
          <div className="w-px h-8 bg-slate-700 mx-2"></div>
          <button 
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 active:scale-95 flex items-center gap-2"
          >
            <i className="fas fa-trash-alt"></i> Delete Selected
          </button>
          <button 
            onClick={() => setSelectedIds(new Set())}
            className="text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {user.role === Role.ADMIN && (
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === paginatedEntries.length && paginatedEntries.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-6 py-4">Lead Information</th>
              <th className="px-6 py-4">Item Details</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right flex items-center justify-end gap-3">
                <span className="mr-4">Actions</span>
                {user.role === Role.ADMIN && (
                  <button 
                    onClick={onClearAll}
                    title={`Delete ALL ${activeOrigin} leads from database`}
                    className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border border-red-100"
                  >
                    <i className="fas fa-trash-sweep mr-1"></i> Wipe {activeOrigin}
                  </button>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedEntries.map(entry => (
              <tr 
                key={entry.id} 
                className={`transition-colors ${selectedIds.has(entry.id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}
              >
                {user.role === Role.ADMIN && (
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(entry.id)}
                      onChange={() => toggleSelect(entry.id)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="font-black text-slate-900">{entry.customerName}</div>
                  <div className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-2 mt-0.5">
                    <i className="fas fa-phone-alt scale-75"></i> {entry.mobileNumber}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold mt-1">
                    Added: {new Date(entry.date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[11px] font-black text-indigo-600 uppercase tracking-tight">{entry.sku || 'GENERAL'}</div>
                  <div className="text-[10px] font-bold text-slate-900 leading-tight mb-0.5">{entry.productDescription}</div>
                  <div className="text-[9px] font-bold text-slate-400 truncate max-w-[180px] italic">{entry.skuDescription || entry.description || 'No additional details'}</div>
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
                      <button onClick={() => setFollowUpEntry(entry)} title="Contact Customer" className="text-emerald-500 hover:text-emerald-700 p-2 rounded-lg hover:bg-emerald-50 transition-all">
                        <i className="fas fa-phone"></i>
                      </button>
                    )}
                    <button onClick={() => onEdit(entry)} title="Edit Record" className="text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-all">
                      <i className="fas fa-pen-nib"></i>
                    </button>
                    {user.role === Role.ADMIN && (
                      <button onClick={() => onDelete(entry.id)} title="Delete Single Record" className="text-red-300 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all">
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {user.role === Role.ADMIN && (
          <div className="flex justify-between items-center px-2">
             <button 
              onClick={toggleSelectAll}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"
            >
              <i className={`fas ${selectedIds.size === paginatedEntries.length ? 'fa-check-square' : 'fa-square'}`}></i>
              {selectedIds.size === paginatedEntries.length ? 'Deselect Page' : 'Select Page'}
            </button>
            <button onClick={onClearAll} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-trash-sweep"></i> Wipe {activeOrigin}
            </button>
          </div>
        )}
        {paginatedEntries.map(entry => (
          <div 
            key={entry.id} 
            onClick={() => user.role === Role.ADMIN && toggleSelect(entry.id)}
            className={`bg-white p-5 rounded-2xl shadow-sm border transition-all ${selectedIds.has(entry.id) ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-3">
                {user.role === Role.ADMIN && (
                   <input 
                    type="checkbox" 
                    checked={selectedIds.has(entry.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(entry.id); }}
                    className="w-5 h-5 mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                )}
                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight">{entry.customerName}</h4>
                  <p className="text-xs font-black text-indigo-600 tracking-widest uppercase mt-0.5">{entry.mobileNumber}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(entry.status)}`}>
                  {entry.status}
                </span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-xl mb-4 text-[11px]">
              <div className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">SKU: {entry.sku || 'N/A'}</div>
              <div className="font-black text-slate-900 mb-0.5">{entry.productDescription}</div>
              <div className="font-bold text-slate-500 italic">{entry.skuDescription || entry.description || 'No product details'}</div>
            </div>

            <div className="flex gap-2">
              {entry.status !== Status.CLOSED && entry.status !== Status.SALE_LOST && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setFollowUpEntry(entry); }} 
                  className="flex-1 bg-emerald-600 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95"
                >
                  Follow-up
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(entry); }} 
                className="flex-1 bg-indigo-600 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95"
              >
                Edit Lead
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Pagination Controller */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Show</label>
          <select 
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-slate-700 outline-none"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </select>
          <span className="text-xs font-bold text-slate-500">
            {Math.min(entries.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(entries.length, currentPage * itemsPerPage)} of {entries.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="flex items-center px-4 font-black text-sm text-slate-900">
            Page {currentPage} <span className="text-slate-300 mx-2 text-xs">/</span> {totalPages}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {followUpEntry && <FollowUpModal entry={followUpEntry} onClose={() => setFollowUpEntry(null)} />}
    </div>
  );
};

export default EntryList;
