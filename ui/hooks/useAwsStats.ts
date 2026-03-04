import { useEffect, useState } from 'react';

export interface Stats {
  sqsCount: number;
  s3Count: number;
  orders: any[];
}

export const useAwsStats = (apiUrl: string) => {
  const [stats, setStats] = useState<Stats>({ sqsCount: 0, s3Count: 0, orders: [] });

  useEffect(() => {
    if (!apiUrl) return;

    const updateDashboard = async () => {
      try {
        const response = await fetch(apiUrl, { method: 'GET' });
        const data = await response.json();
        setStats({
          sqsCount: data.sqsCount || 0,
          s3Count: data.s3Count || 0,
          orders: data.orders || []
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
