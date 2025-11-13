    import { useEffect, useRef } from 'react';

    const Canteen1 = () => {
      const videoRef = useRef(null);
      const canvasRef = useRef(null);
      const wsRef = useRef(null);
      const mediaStreamRef = useRef(null);
      const isCameraStartedRef = useRef(false);
      const reconnectTimeoutRef = useRef(null);
      const lastDetectionRef = useRef(null);

      useEffect(() => {
        const connectWebSocket = () => {
          if (wsRef.current) wsRef.current.close();
          const wsBaseUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
          const wsUrl = `${wsBaseUrl}/ws/canteen/1`;
          console.log('Connecting to WebSocket:', wsUrl);
          wsRef.current = new WebSocket(wsUrl);

          wsRef.current.onopen = () => {
            console.log('WebSocket connected');
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          };

          wsRef.current.onmessage = (msg) => {
            if (typeof msg.data === 'string') {
              try {
                const data = JSON.parse(msg.data);
                if (data.type === 'detection') {
                  const result = data.hasPerson ? 'occupied' : 'available';
                  if (data.hasPerson !== lastDetectionRef.current) {
                    console.log(result);
                    lastDetectionRef.current = data.hasPerson;
                  }
                } else {
                  console.log('Message from server:', msg.data);
                }
              } catch (e) {
                console.log('Message from server:', msg.data);
              }
            }
          };

          wsRef.current.onerror = (err) => {
            console.error('WebSocket error:', err.message || err);
          };

          wsRef.current.onclose = () => {
            console.warn('WebSocket closed. Reconnecting in 3s...');
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
          };
        };

        const startCamera = async () => {
          if (isCameraStartedRef.current) return;
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { width: 640, height: 480, facingMode: 'environment' },
              audio: false
            });
            mediaStreamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.addEventListener('loadedmetadata', async () => {
                await videoRef.current.play();
                isCameraStartedRef.current = true;
                console.log('📸 Camera started');
              }, { once: true });
            }
          } catch (err) {
            console.error('Camera access failed:', err);
          }
        };

        const init = async () => {
          await startCamera();
          setTimeout(connectWebSocket, 1000);
        };

        init();

        const captureInterval = setInterval(() => {
          if (videoRef.current && canvasRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
            const canvas = canvasRef.current;
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(blob);
              }
            }, 'image/jpeg', 0.8);
          }
        }, 10000);

        return () => {
          clearInterval(captureInterval);
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
          }
          if (wsRef.current) wsRef.current.close();
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          isCameraStartedRef.current = false;
        };
      }, []);

      return (
        <div style={{ textAlign: 'center' }}>
          <h2>Canteen Seat 1 Monitoring</h2>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '640px', height: '480px', border: '1px solid #ccc' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      );
    };

    export default Canteen1;
