import React from 'react';

interface OrderFormProps {
  apiUrl: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({ apiUrl, onUrlChange, onSubmit, loading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="apiUrl" className="text-sm font-medium text-slate-300">
          URL do API Gateway (LocalStack)
        </label>
        <input
          type="text"
          id="apiUrl"
          required
          value={apiUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="bg-slate-900/50 border border-slate-700 text-slate-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 font-mono"
          placeholder="http://localhost:4566/restapis/XXXXXXXX/dev/_user_request_/hello"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`text-white bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 focus:ring-4 focus:outline-none focus:ring-emerald-800 font-medium rounded-lg text-sm w-full sm:w-auto px-6 py-3 text-center transition-all shadow-lg flex items-center justify-center gap-2 group mt-2 ${loading ? 'opacity-70' : ''}`}
      >
        <span>{loading ? 'Enviando...' : 'Simular Compra de E-commerce na Fila'}</span>
        {!loading && (
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        )}
      </button>
    </form>
  );
};
