import { WebSocket, WebSocketServer } from 'ws';
import { StockData } from './src/types';

const wss = new WebSocketServer({ port: 8080 });

const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'FB'];

function generateStockData(): StockData[] {
  return symbols.map(symbol => ({
    symbol,
    price: Math.random() * 1000,
    change: Math.random() * 10 - 5,
    volume: Math.floor(Math.random() * 1000000)
  }));
}

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  // Send initial data immediately
  const initialData = generateStockData();
  ws.send(JSON.stringify(initialData));

  const interval = setInterval(() => {
    // Check if connection is still open before sending
    if (ws.readyState === WebSocket.OPEN) {
      const data = generateStockData();
      ws.send(JSON.stringify(data));
    }
  }, 1000);

  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
    clearInterval(interval);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

// Error handling for the server
wss.on('error', (error: Error) => {
  console.error('WebSocket server error:', error);
});

console.log('WebSocket server is running on port 8080');
