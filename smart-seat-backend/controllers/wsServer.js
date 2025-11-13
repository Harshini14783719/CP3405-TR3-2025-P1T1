const WebSocket = require('ws');
const cameraDetector = require('./cameraDetector');

const initWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server, path: '/ws/canteen/1' });

  wss.on('connection', (ws) => {
    console.log('Client connected to canteen 1 WebSocket');

    ws.on('message', async (buffer) => {
      try {
        const hasPerson = await cameraDetector.detectFromFrame(buffer);
        ws.send(JSON.stringify({ type: 'detection', hasPerson }));
      } catch (err) {
        console.error('Frame processing error:', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from canteen 1 WebSocket');
    });

    ws.on('error', (err) => {
      console.error('WebSocket connection error:', err);
    });
  });

  cameraDetector.loadModel().catch(err => {
    console.error('Model initialization failed:', err);
  });

  return wss;
};

module.exports = initWebSocketServer;