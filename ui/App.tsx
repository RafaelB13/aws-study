import { Dashboard } from '@ui/components/Dashboard';
import { OrderForm } from '@ui/components/OrderForm';
import { ResponseViewer } from '@ui/components/ResponseViewer';
import { useLocalStorage } from '@ui/hooks/useLocalStorage';
import { useOrderAction } from '@ui/hooks/useOrderAction';
import React from 'react';

export const App: React.FC = () => {
  const defaultUrl = import.meta.env.VITE_API_URL || 'http://localhost:4566/restapis/XXXXXXXX/dev/_user_request_/hello';
  const [apiUrl, setApiUrl] = useLocalStorage('apiUrl', defaultUrl);
  const { response, status, loading, simulateOrder, bulkSimulation } = useOrderAction(apiUrl);

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* HEADER BAR */}
      <header className="w-full h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 via-blue-500 to-emerald-500 flex items-center justify-center p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-xl">
              ☁️
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter bg-linear-to-r from-white to-slate-400 text-transparent bg-clip-text">
              AWS LOCALSTACK <span className="text-indigo-400 font-normal ml-1">DASHBOARD</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              CLUSTER HEALTHY
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold tracking-wide uppercase">
              LOCALSTACK @ 4566
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: ACTION PANEL */}
        <aside className="w-112.5 border-r border-slate-800 bg-slate-900/20 backdrop-blur-md flex flex-col p-8 overflow-y-auto space-y-10 custom-scrollbar shadow-[20px_0_40px_-20px_rgba(0,0,0,0.5)]">
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-1">Configuration & Control</h2>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl ring-1 ring-white/5">
              <OrderForm 
                apiUrl={apiUrl} 
                onUrlChange={setApiUrl} 
                onSubmit={simulateOrder} 
                onBulkSubmit={bulkSimulation}
                loading={loading} 
              />
            </div>
          </div>
          
          <div className="grow space-y-2">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest pl-1">API Lifecycle</h2>
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl ring-1 ring-white/5">
              <ResponseViewer data={response} status={status} loading={loading} />
            </div>
          </div>

          <div className="pt-4 opacity-40 hover:opacity-100 transition-opacity flex-none">
            <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-[0.2em] px-4 py-3 border border-slate-800 rounded-full bg-slate-900/40">
              VITE • REACT 18 • TAILWIND 4
            </p>
          </div>
        </aside>

        {/* MAIN PANEL: MONITORING & EVENTS */}
        <section className="grow overflow-y-auto p-12 bg-slate-950/50 custom-scrollbar relative min-w-0">
          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <Dashboard apiUrl={apiUrl} />
          </div>
          
          {/* Background Gradient Orbs */}
          <div className="absolute top-0 right-0 w-150 h-150 bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-150 h-150 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
        </section>
      </main>
    </div>
  );
};
