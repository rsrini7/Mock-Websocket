import { useState, useEffect, useCallback } from 'react';
import { StockData } from '../types';
import { WS_URL } from '../constants';

export const useWebSocket = (): StockData[] => {
  const [data, setData] = useState<StockData[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connect = useCallback(() => {
    const websocket = new WebSocket(WS_URL);
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    websocket.onmessage = (event: MessageEvent) => {
      try {
        const stockData: StockData[] = JSON.parse(event.data);
        setData(stockData);
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = (event) => {
      console.log('WebSocket disconnected. Attempting to reconnect...', event.code, event.reason);
      setWs(null);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        connect();
      }, 3000);
    };

    setWs(websocket);
    return websocket;
  }, []);

  useEffect(() => {
    const websocket = connect();
    
    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [connect]);

  return data;
};
