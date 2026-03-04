import { useState } from 'react';

export const useOrderAction = (apiUrl: string) => {
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState('201 OK');
  const [loading, setLoading] = useState(false);

  const sendOrder = async (isBulk = false): Promise<any> => {
    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await resp.json();
      if (!isBulk) {
        setResponse(data);
        setStatus(`${resp.status} ${resp.statusText}`);
      }
      return { status: resp.status, data };
    } catch (error: any) {
      if (!isBulk) {
        setResponse({
          error: "Erro de Conexão ou CORS!",
          message: "A requisição não chegou na AWS.",
          details: error.message
        });
        setStatus("NETWORK ERROR");
      }
      throw error;
    }
  };

  const simulateOrder = async () => {
    setLoading(true);
    setResponse(null);
    setStatus('WAITING');
    await sendOrder();
    setLoading(false);
  };

  const bulkSimulation = async (count: number) => {
    setLoading(true);
    setResponse({ message: `Iniciando disparo em lote de ${count} pedidos...` });
    setStatus('BULK PROCESSING');

    try {
      const promises = Array.from({ length: count }).map(() => sendOrder(true));
      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      setResponse({
        message: `Simulação de Lote Concluída!`,
        stats: {
          total: count,
          success: successCount,
          failed: failCount
        }
      });
      setStatus('200 BATCH DONE');
    } catch (error) {
      console.error('Bulk error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { response, status, loading, simulateOrder, bulkSimulation };
};
