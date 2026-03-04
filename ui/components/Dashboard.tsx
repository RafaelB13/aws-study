import { useAwsStats } from '@ui/hooks/useAwsStats';
import React from 'react';

interface DashboardProps {
  apiUrl: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ apiUrl }) => {
  const stats = useAwsStats(apiUrl);

  return (
    <div className="mt-8 pt-8 border-t border-slate-700/50">
      <h2 className="text-xl font-bold mb-4 text-slate-200">
        📊 Monitoramento do LocalStack Ao Vivo
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-700/50 bg-slate-900/50 p-4 rounded-xl">
        {/* SQS BOX */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-lg shadow border border-emerald-900/50 group hover:border-emerald-500 transition-colors">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-2">
            Fila SQS (Em espera)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{stats.sqsCount}</span>
            <span className="text-sm text-slate-400">itens</span>
          </div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div className={`bg-emerald-500 h-1.5 rounded-full animate-pulse transition-all duration-500`} style={{ width: stats.sqsCount > 0 ? '100%' : '15%' }}></div>
          </div>
        </div>

        {/* S3 BOX */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-lg shadow border border-blue-900/50 group hover:border-blue-500 transition-colors">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
            Pedidos Físicos (S3)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{stats.s3Count}</span>
            <span className="text-sm text-slate-400">notas JSON salvas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
