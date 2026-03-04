import { Order } from '@src/domain/entities';
import { useAwsStats } from '@ui/hooks/useAwsStats';
import React, { useState } from 'react';

interface DashboardProps {
  apiUrl: string;
}

const ITEMS_PER_PAGE = 8;

export const Dashboard: React.FC<DashboardProps> = ({ apiUrl }) => {
  const stats = useAwsStats(apiUrl);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'logs'>('events');

  const sortedOrders = [...stats.orders].sort((a: any, b: any) => {
    const dateA = new Date(a.orderDate || a.processedAt || a.dataPedido || 0).getTime();
    const dateB = new Date(b.orderDate || b.processedAt || b.dataPedido || 0).getTime();
    return dateB - dateA;
  });

  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = sortedOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const totalSqs = stats.sqs.visible + stats.sqs.inFlight + stats.sqs.delayed;
  const isCongested = totalSqs > 50;
  const isProcessing = stats.sqs.inFlight > 0;

  return (
    <div className="w-full space-y-10 selection:bg-indigo-500/30">
      {/* 🔮 QUEUE OBSERVABILITY CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-8 rounded-3xl shadow-2xl ring-1 ring-white/5 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-600/10 blur-3xl rounded-full group-hover:bg-indigo-600/20 transition-all"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl">📥</div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">SQS Queue Observability</h3>
              </div>
              <div className="flex items-end gap-6 mb-8">
                 <div className="flex flex-col">
                    <span className="text-6xl font-black text-white tracking-tighter leading-none">{stats.sqs.visible}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase mt-2 tracking-widest pl-1">Backlog Messages</span>
                 </div>
                 <div className="flex flex-col border-l border-slate-800 pl-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white leading-none">{stats.sqs.inFlight}</span>
                      <span className="text-emerald-500 animate-pulse">●</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-widest">In-Flight</span>
                 </div>
                 <div className="flex flex-col border-l border-slate-800 pl-6">
                    <span className="text-2xl font-bold text-slate-400 leading-none">{stats.sqs.delayed}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Delayed</span>
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black">
                    <span className="text-slate-500 uppercase tracking-widest">Queue Pressure Level</span>
                    <span className={isCongested ? 'text-red-400 animate-bounce' : 'text-emerald-400'}>
                      {isCongested ? 'CONGESTION ALERT' : isProcessing ? 'ACTIVE PROCESSING' : 'HEALTHY / IDLE'}
                    </span>
                 </div>
                 <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className={`h-full transition-all duration-700 ${isCongested ? 'bg-red-500' : 'bg-linear-to-r from-emerald-500 to-indigo-500'}`} style={{ width: `${Math.min(100, (totalSqs / 50) * 100)}%` }}></div>
                 </div>
              </div>
           </div>
        </div>
        <StatCard title="Compute Nodes" value={2} unit="LAMBDAS" icon="⚡" color="indigo" subtitle="Producer & Consumer" />
        <StatCard title="Storage Archive" value={stats.s3Count} unit="OBJECTS" icon="🗄️" color="emerald" subtitle="S3 Persistence" />
      </div>

      {/* TABS SELECTOR */}
      <div className="flex gap-4 border-b border-slate-800 pb-px">
        <button 
          onClick={() => setActiveTab('events')}
          className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'events' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          📦 Event History (S3)
          {activeTab === 'events' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'logs' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          📜 CloudWatch Logs (Consumer)
          {activeTab === 'logs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
        </button>
      </div>

      {activeTab === 'events' ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">Repository (S3)</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Page {currentPage}/{totalPages || 1}</span>
              <div className="flex gap-1 ml-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 rounded-lg text-white transition-all">←</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-1 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 rounded-lg text-white transition-all">→</button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase border-b border-slate-800">Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase border-b border-slate-800">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase border-b border-slate-800">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase border-b border-slate-800">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase border-b border-slate-800 text-right">Raw</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {currentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic text-sm">No data in S3...</td></tr>
                ) : (
                  currentOrders.map((order: any) => {
                    const id = order.orderId || order.pedidoId || 'N/A';
                    const prod = order.product || order.produto || 'N/A';
                    const date = order.orderDate || order.dataPedido || order.processedAt;
                    return (
                      <tr key={id} className="hover:bg-indigo-500/5 transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-indigo-400 font-bold">{id}</td>
                        <td className="px-6 py-4 text-xs text-slate-400">{date ? new Date(date).toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4 text-xs text-slate-300">{prod}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-md text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-tighter">PROCESSED</span></td>
                        <td className="px-6 py-4 text-right"><button onClick={() => setSelectedOrder(order)} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase underline">Details</button></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="p-6 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Real-time CloudWatch Stream</h3>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                 <span className="text-[9px] font-bold text-slate-500 uppercase">Live Tail Active</span>
              </div>
           </div>
           <div className="p-4 font-mono text-xs overflow-y-auto max-h-[600px] custom-scrollbar bg-slate-950 selection:bg-indigo-500/50">
              {stats.logs.length === 0 ? (
                <p className="text-slate-600 italic p-4 text-center">No logs detected yet. Dispatch some orders to trigger the consumer!</p>
              ) : (
                stats.logs.map((log, i) => (
                  <div key={i} className="py-1 border-l-2 border-slate-800 pl-4 hover:border-indigo-500 hover:bg-white/5 transition-all group">
                    <span className="text-slate-600 mr-4 text-[10px] tabular-nums font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`text-slate-300 break-words ${log.message.includes('ERROR') ? 'text-red-400 font-bold' : log.message.includes('INFO') ? 'text-blue-300' : ''}`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {/* JSON MODAL-LIKE DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-3xl overflow-hidden ring-1 ring-white/10 scale-in-center">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Raw Data: {selectedOrder.orderId}</h2>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors">✕</button>
            </div>
            <pre className="p-8 text-xs font-mono text-emerald-400 overflow-y-auto max-h-[60vh] bg-slate-950/50 custom-scrollbar">{JSON.stringify(selectedOrder, null, 2)}</pre>
            <div className="p-6 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 font-mono italic text-right">Stored as {selectedOrder.orderId}.json on S3</div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; unit: string; icon: string; color: string; subtitle: string }> = ({ title, value, unit, icon, color, subtitle }) => {
  const colorMap: Record<string, string> = { blue: "text-blue-400", emerald: "text-emerald-400", indigo: "text-indigo-400" };
  return (
    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg ring-1 ring-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><span className="text-4xl">{icon}</span></div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2"><span className="text-4xl font-black text-white leading-none tracking-tighter">{value}</span><span className={`text-[10px] font-black uppercase tracking-tighter ${colorMap[color]}`}>{unit}</span></div>
      <p className="text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-wide">{subtitle}</p>
    </div>
  );
};
