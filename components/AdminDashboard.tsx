
import React from 'react';
import { Entry, Status, ProductGroup } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { GROUPS } from '../constants';

interface AdminDashboardProps {
  entries: Entry[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ entries }) => {
  const totalEntries = entries.length;
  const closedEntries = entries.filter(e => e.status === Status.CLOSED).length;
  const wipEntries = entries.filter(e => e.status === Status.WIP).length;
  const openEntries = entries.filter(e => e.status === Status.OPEN).length;
  const lostEntries = entries.filter(e => e.status === Status.SALE_LOST).length;
  
  const conversionRate = totalEntries > 0 ? (closedEntries / totalEntries * 100).toFixed(1) : '0';

  const groupData = GROUPS.map(group => {
    const groupEntries = entries.filter(e => e.group === group);
    const groupClosed = groupEntries.filter(e => e.status === Status.CLOSED).length;
    const rate = groupEntries.length > 0 ? (groupClosed / groupEntries.length * 100).toFixed(0) : 0;
    return {
      name: group,
      count: groupEntries.length,
      closed: groupClosed,
      rate: Number(rate)
    };
  }).filter(d => d.count > 0);

  const statusPieData = [
    { name: 'Closed', value: closedEntries, color: '#10B981' },
    { name: 'WIP', value: wipEntries, color: '#F59E0B' },
    { name: 'Open', value: openEntries, color: '#3B82F6' },
    { name: 'Lost', value: lostEntries, color: '#E11D48' },
  ];

  const COLORS = ['#6366F1', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h2>
        <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Global Sales Performance</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Conversion</p>
          <span className="text-4xl font-black text-indigo-600">{conversionRate}%</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total</p>
          <span className="text-4xl font-black text-slate-900">{totalEntries}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Wins</p>
          <span className="text-4xl font-black text-emerald-600">{closedEntries}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">WIP</p>
          <span className="text-4xl font-black text-amber-500">{wipEntries}</span>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
          <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Lost</p>
          <span className="text-4xl font-black text-rose-500">{lostEntries}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center uppercase tracking-tight">
            <i className="fas fa-chart-bar mr-3 text-indigo-500"></i>
            Conversion by Group
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={10} width={120} fontWeight="bold" />
                <Tooltip />
                <Bar dataKey="rate" radius={[0, 8, 8, 0]} barSize={24}>
                  {groupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center uppercase tracking-tight">
            <i className="fas fa-chart-pie mr-3 text-emerald-500"></i>
            Lead Pipeline Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
