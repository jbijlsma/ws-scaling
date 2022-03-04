(async () => {
  const process = require('process');
  const express = require('express');

  const pid = process.pid;

  const app = express();
  const PORT = 9000;
  
  const WebSocket = require("ws");
  const redis = require("redis");
  
  const subscriber = redis.createClient({ url: "redis://redis-service:6379" });
  const publisher = subscriber.duplicate();

  await subscriber.connect();
  await publisher.connect();
  
  const WS_CHANNEL = "ws:messages";
  
  const wss = new WebSocket.Server({ port: +process.argv[4] || 8080 });
  
  await subscriber.subscribe(WS_CHANNEL, (message) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  
  wss.on("connection", async ws => {
    ws.send(`connected to ws server with pid ${pid}`);
    
    ws.on("message", async data => {
      const msg = `${data} (from pid ${pid})`;
      await publisher.publish(WS_CHANNEL, msg);
    });
  });
  
  app.get('/', (req, res) => {
    res.send('Hi from ws-api');
  });
  
  app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
})();