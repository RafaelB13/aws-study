import { useEffect, useState } from 'react';

export interface Stats {
  sqs: {
    visible: number;
    inFlight: number;
    delayed: number;
  };
  s3Count: number;
  orders: any[];
  logs: any[];
}

export const useAwsStats = (apiUrl: string) => {
  const [stats, setStats] = useState<Stats>({ 
    sqs: { visible: 0, inFlight: 0, delayed: 0 }, 
    s3Count: 0, 
    orders: [],
    logs: []
  });

  useEffect(() => {
    if (!apiUrl) return;

    const updateDashboard = async () => {
      try {
        const response = await fetch(apiUrl, { method: 'GET' });
        const data = await response.json();
        setStats({
          sqs: data.sqs || { visible: 0, inFlight: 0, delayed: 0 },
          s3Count: data.s3Count || 0,
          orders: data.orders || [],
          logs: data.logs || []
        });
      } catch (err) {
        // Silent error
      }
    };

    updateDashboard();
    const interval = setInterval(updateDashboard, 2000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  return stats;
};
