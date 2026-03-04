import { useState } from 'react';

export const useOrderAction = (apiUrl: string) => {
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState('201 OK');
  const [loading, setLoading] = useState(false);

  const simulateOrder = async () => {
    setLoading(true);
    setResponse(null);
    setStatus('WAITING');

    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await resp.json();
      setResponse(data);
      setStatus(`${resp.status} ${resp.statusText}`);
    } catch (error: any) {
      setResponse({
        error: "Erro de Conexão ou CORS!",
        message: "A requisição não chegou na AWS e falhou no navegador.",
        details: error.message
      });
      setStatus("NETWORK ERROR");
    } finally {
      setLoading(false);
    }
  };

  return { response, status, loading, simulateOrder };
};
