
import React, { useState, useEffect, useMemo } from 'react';
import { User, Entry, Role, FilterOptions, Status, LeadOrigin } from '../types';
import EntryForm from './EntryForm';
import EntryList from './EntryList';
import AdminDashboard from './AdminDashboard';
import BulkUpload from './BulkUpload';
import ExportView from './ExportView';
import { STATUSES } from '../constants';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [view, setView] = useState<'manual-list' | 'bulk-list' | 'manual-add' | 'bulk-import' | 'analytics' | 'export'>('manual-list');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    employeeName: '',
    group: '',
    status: '',
    search: '',
  });

  // REAL-TIME SYNC LOGIC
  // Load data and listen for changes from other tabs
  useEffect(() => {
    const loadEntries = () => {
      const stored = localStorage.getItem('cp_entries');
      if (stored) {
        try {
          setEntries(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse entries", e);
        }
      }
    };

    loadEntries();

    // Sync across tabs in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cp_entries') {
        loadEntries();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const saveEntries = (newEntries: Entry[]) => {
    setEntries(newEntries);
    localStorage.setItem('cp_entries', JSON.stringify(newEntries));
    // Manual trigger for same-tab updates if needed, 
    // though state handles it locally.
  };

  const handleClearDatabase = () => {
    if (confirm('DANGER: This will permanently delete ALL entries from the system. Continue?')) {
      saveEntries([]);
    }
  };

  const handleClearOriginEntries = (origin: LeadOrigin) => {
    if (confirm(`Are you sure you want to delete ALL ${origin} leads? This cannot be undone.`)) {
      const remaining = entries.filter(e => e.origin !== origin);
      saveEntries(remaining);
    }
  };

  const handleAddEntry = (entry: Omit<Entry, 'id' | 'createdAt' | 'employeeId' | 'origin'>) => {
    const newEntry: Entry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      employeeId: user.id,
      origin: 'Manual'
    };
    saveEntries([newEntry, ...entries]);
    setView('manual-list');
  };

  const handleBulkUpload = (newEntriesData: Omit<Entry, 'id' | 'createdAt' | 'employeeId' | 'employeeName' | 'origin'>[]) => {
    const now = Date.now();
    const preparedEntries: Entry[] = newEntriesData.map((data, index) => ({
      ...data,
      id: Math.random().toString(36).substr(2, 9) + index,
      createdAt: now + index,
      employeeId: user.id,
      employeeName: (data as any).employeeName || user.name,
      origin: 'Bulk'
    }));
    
    saveEntries([...preparedEntries, ...entries]);
    alert(`Successfully imported ${preparedEntries.length} bulk leads!`);
    setView('bulk-list');
  };

  const handleUpdateEntry = (updatedEntry: Entry) => {
    const newEntries = entries.map(e => e.id === updatedEntry.id ? updatedEntry : e);
    saveEntries(newEntries);
    setEditingEntry(null);
    setView(updatedEntry.origin === 'Bulk' ? 'bulk-list' : 'manual-list');
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      saveEntries(entries.filter(e => e.id !== id));
    }
  };

  const activeOrigin: LeadOrigin = (view === 'bulk-list' || view === 'bulk-import') ? 'Bulk' : 'Manual';

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Direct division of lead data by tab view
      if (view === 'manual-list' && entry.origin !== 'Manual') return false;
      if (view === 'bulk-list' && entry.origin !== 'Bulk') return false;

      // Access control: Employees see their own or non-closed leads for collaboration
      const canSee = user.role === Role.ADMIN || 
                    entry.employeeId === user.id || 
                    (entry.status !== Status.CLOSED && entry.status !== Status.SALE_LOST);
      
      if (!canSee) return false;

      const searchMatch = !filters.search || 
                         entry.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         entry.mobileNumber.includes(filters.search) ||
                         entry.sku.toLowerCase().includes(filters.search.toLowerCase());
      const statusMatch = !filters.status || entry.status === filters.status;

      return searchMatch && statusMatch;
    });
  }, [entries, filters, user, view]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 relative">
              <i className="fas fa-sync-alt text-xs absolute -top-1 -right-1 animate-spin-slow opacity-50"></i>
              <i className="fas fa-layer-group"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">Conversion Pro</h1>
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {user.role === Role.ADMIN ? 'System Administrator' : `Associate: ${user.name}`}
              </p>
            </div>
          </div>
          
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-600 font-black text-xs transition-all rounded-lg hover:bg-red-50">
            <i className="fas fa-power-off"></i>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 px-6 sticky top-[73px] z-40 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-x-2 sm:gap-x-8 whitespace-nowrap">
          <button 
            onClick={() => { setView('manual-list'); setEditingEntry(null); }}
            className={`py-5 px-1 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 ${view === 'manual-list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            <i className="fas fa-user-tag"></i> MANUAL DATABASE
          </button>
          <button 
            onClick={() => { setView('bulk-list'); setEditingEntry(null); }}
            className={`py-5 px-1 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 ${view === 'bulk-list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            <i className="fas fa-server"></i> BULK DATABASE
          </button>
          <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
          <button 
            onClick={() => { setView('manual-add'); setEditingEntry(null); }}
            className={`py-5 px-1 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 ${view === 'manual-add' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
          >
            <i className="fas fa-edit"></i> MANUAL ADD
          </button>
          {user.role === Role.ADMIN && (
            <>
              <button 
                onClick={() => { setView('analytics'); setEditingEntry(null); }}
                className={`py-5 px-1 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 ${view === 'analytics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
              >
                <i className="fas fa-chart-pie"></i> ANALYTICS
              </button>
              <div className="ml-auto flex gap-4">
                <button 
                  onClick={() => setView('bulk-import')}
                  className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all flex items-center gap-2 ${view === 'bulk-import' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                >
                  <i className="fas fa-upload"></i> BULK IMPORT
                </button>
                <button 
                  onClick={() => setView('export')}
                  className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all flex items-center gap-2 ${view === 'export' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                >
                  <i className="fas fa-file-excel"></i> EXPORT
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <div className="animate-fade-in transition-all duration-300">
          {(view === 'manual-list' || view === 'bulk-list') && !editingEntry && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    {view === 'manual-list' ? 'Manual Lead Center' : 'Bulk Lead Repository'}
                    <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full">
                      {filteredEntries.length} Records
                    </span>
                  </h2>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                   <select 
                    className="flex-1 sm:flex-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 outline-none shadow-sm focus:ring-2 focus:ring-indigo-500"
                    value={filters.status}
                    onChange={e => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">All Lead Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="text" 
                    placeholder={`Search by name, mobile, or SKU in ${activeOrigin.toLowerCase()} database...`}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={filters.search}
                    onChange={e => setFilters({...filters, search: e.target.value})}
                  />
                </div>
              </div>

              <EntryList 
                user={user}
                entries={filteredEntries} 
                onEdit={(e) => { setEditingEntry(e); setView('manual-add'); }}
                onDelete={handleDeleteEntry}
                onClearAll={() => handleClearOriginEntries(activeOrigin)}
                activeOrigin={activeOrigin}
              />
            </div>
          )}

          {view === 'manual-add' && (
            <EntryForm 
              user={user}
              entry={editingEntry} 
              onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry} 
              onCancel={() => { setView(editingEntry?.origin === 'Bulk' ? 'bulk-list' : 'manual-list'); setEditingEntry(null); }}
            />
          )}

          {view === 'bulk-import' && user.role === Role.ADMIN && (
            <BulkUpload 
              user={user} 
              onUpload={handleBulkUpload} 
              onClearDatabase={handleClearDatabase}
              onCancel={() => setView('bulk-list')} 
            />
          )}

          {view === 'analytics' && user.role === Role.ADMIN && (
            <AdminDashboard entries={entries} />
          )}

          {view === 'export' && user.role === Role.ADMIN && (
            <ExportView entries={entries} />
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>&copy; 2024 Conversion Pro</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Real-time Database Active
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
