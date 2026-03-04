import React from 'react';

interface OrderFormProps {
  apiUrl: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => Promise<void>;
  onBulkSubmit: (count: number) => Promise<void>;
  loading: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({ apiUrl, onUrlChange, onSubmit, onBulkSubmit, loading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="apiUrl" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
            API Endpoint Configuration
          </label>
          <input
            type="text"
            id="apiUrl"
            required
            value={apiUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-indigo-400 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden block w-full p-4 font-mono shadow-inner placeholder:text-slate-700 transition-all"
            placeholder="http://localhost:4566/restapis/..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`relative group h-14 bg-linear-to-r from-indigo-600 to-blue-600 text-white font-black rounded-xl text-sm transition-all hover:scale-[1.02] border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 shadow-lg shadow-indigo-500/20 disabled:opacity-50 overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <span className="relative flex items-center justify-center gap-3">
            {loading ? 'EXECUTANDO...' : '🚀 SIMULAR PEDIDO ÚNICO'}
          </span>
        </button>
      </form>

      <div className="space-y-4 pt-4 border-t border-slate-800/50">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
          Stress Test / Batch Processing
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onBulkSubmit(10)}
            disabled={loading}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group disabled:opacity-30"
          >
            <span className="text-xl group-hover:animate-bounce">⚡</span>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-400 uppercase tracking-widest">Simular x10</span>
          </button>

          <button
            onClick={() => onBulkSubmit(30)}
            disabled={loading}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-red-500/50 hover:bg-red-500/5 transition-all group disabled:opacity-30"
          >
            <span className="text-xl group-hover:rotate-12 transition-transform">🔥</span>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-red-400 uppercase tracking-widest">Simular x30</span>
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-600 italic">
          Veja a "Queue Backlog" subir e ser processada em tempo real no Dashboard.
        </p>
      </div>
    </div>
  );
};
