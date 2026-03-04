import React from 'react';

interface ResponseViewerProps {
  data: any;
  status: string;
  loading: boolean;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ data, status, loading }) => {
  if (!data && !loading) return null;

  const isError = status.includes('ERROR') || (status.split(' ')[0] && parseInt(status.split(' ')[0]) >= 400);
  const isPending = status === 'WAITING';

  return (
    <div className={`mt-8 transition-opacity duration-500 ${data || loading ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`flex w-3 h-3 rounded-full ${isPending ? 'bg-yellow-400 animate-pulse' : isError ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]'}`}></span>
        <h3 className="text-sm font-semibold text-slate-300">
          Retorno da AWS Lambda:
        </h3>
      </div>
      <div
        className="relative group rounded-xl overflow-hidden shadow-inner font-mono text-sm leading-relaxed"
        style={{ backgroundColor: "#1e293b", color: "#a5b4fc" }}
      >
        <div className="flex bg-slate-700 px-4 py-2 border-b border-slate-600 items-center justify-between">
          <div className="flex w-full gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-slate-400 font-sans tracking-wider">
            {status}
          </span>
        </div>
        <pre className="p-4 overflow-x-auto whitespace-pre-wrap word-break h-auto max-h-75">
          {loading ? "Aguardando resposta da Lambda Produtora...\nEnviando POST vazio..." : JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
