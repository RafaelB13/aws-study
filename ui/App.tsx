import { Dashboard } from '@ui/components/Dashboard';
import { OrderForm } from '@ui/components/OrderForm';
import { ResponseViewer } from '@ui/components/ResponseViewer';
import { useLocalStorage } from '@ui/hooks/useLocalStorage';
import { useOrderAction } from '@ui/hooks/useOrderAction';
import React from 'react';

export const App: React.FC = () => {
  const [apiUrl, setApiUrl] = useLocalStorage<string>(
    'localstack_api_url', 
    import.meta.env.VITE_API_URL || ''
  );
  const { response, status, loading, simulateOrder } = useOrderAction(apiUrl);

  return (
    <div className="w-full max-w-2xl px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 bg-linear-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
          SQS Fila Uploader (Serverless)
        </h1>
        <p className="text-slate-400 text-lg">
          Envie arquivos passando Assincronamente por{' '}
          <span className="text-emerald-400 font-semibold border-b border-emerald-400/30">
            Fila (SQS) e S3
          </span>{' '}
          no LocalStack
        </p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        <OrderForm 
          apiUrl={apiUrl} 
          onUrlChange={setApiUrl} 
          onSubmit={simulateOrder} 
          loading={loading} 
        />
        
        <Dashboard apiUrl={apiUrl} />
        
        <ResponseViewer data={response} status={status} loading={loading} />
      </div>

      <p className="text-center text-xs text-slate-500 mt-8 mb-4">
        Powered by Vite, React & Tailwind CSS. Conectado ao LocalStack.
      </p>
    </div>
  );
};
