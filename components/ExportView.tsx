
import React from 'react';
import { Entry } from '../types';

interface ExportViewProps {
  entries: Entry[];
}

const ExportView: React.FC<ExportViewProps> = ({ entries }) => {
  const handleExport = () => {
    if (entries.length === 0) return alert('No data to export');
    
    const headers = ['Date', 'Employee', 'Customer', 'Mobile', 'Group', 'Description', 'Status', 'Bill Number'];
    const rows = entries.map(e => [
      e.date,
      e.employeeName,
      e.customerName,
      e.mobileNumber,
      e.group,
      e.description.replace(/,/g, ' '),
      e.status,
      e.billNumber || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-4xl mx-auto p-8 animate-fade-in text-center">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-file-excel text-indigo-600 text-3xl"></i>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Sales Data</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        Download a complete report of all customer leads and conversions in CSV format for Excel or Google Sheets.
      </p>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 inline-block w-full max-w-sm">
        <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
          <span>Records Ready:</span>
          <span className="text-indigo-600 text-lg font-bold">{entries.length}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <button 
          onClick={handleExport}
          className="bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
        >
          <i className="fas fa-download"></i> Generate CSV Report
        </button>
      </div>
      
      <p className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
        Reports are processed in real-time
      </p>
    </div>
  );
};

export default ExportView;
