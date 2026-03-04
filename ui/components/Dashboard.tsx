import { useAwsStats } from '@ui/hooks/useAwsStats';
import React from 'react';

interface DashboardProps {
  apiUrl: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ apiUrl }) => {
  const stats = useAwsStats(apiUrl);

  return (
    <div className="w-full space-y-12">
      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-4xl text-blue-400">📥</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Queue Backlog</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{stats.sqsCount}</span>
            <span className="text-xs text-blue-400 font-bold">MESSAGES</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Pendente no SQS</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-4xl text-emerald-400">🗄️</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Archived Data</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{stats.s3Count}</span>
            <span className="text-xs text-emerald-400 font-bold">OBJECTS</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Persistido no S3 Bucket</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-4xl text-indigo-400">⚡</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Compute Nodes</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">2</span>
            <span className="text-xs text-indigo-400 font-bold">LAMBDAS</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Producer & Consumer Activos</p>
        </div>
      </div>

      {/* FEED DE EVENTOS EM TEMPO REAL */}
      <div className="grow">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Event Pipeline (S3 History)
        </h3>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
          {stats.orders.length === 0 && (
            <div className="col-span-full bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl py-12 text-center">
              <p className="text-slate-500 text-sm italic">Nenhum evento registrado ainda via SQS → Lambda...</p>
            </div>
          )}
          
          {[...stats.orders].reverse().map((order) => (
            <div key={order.orderId} className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  📦
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-100 truncate">{order.orderId}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {order.orderDate ? new Date(order.orderDate).toLocaleTimeString() : 'N/A'} • {order.product}
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-tighter uppercase">
                  Processed
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
