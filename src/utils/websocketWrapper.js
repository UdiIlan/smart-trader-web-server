import WebSocket from 'ws';


class WebSocketWrapper {
  constructor() {
    this.wss = new WebSocket.Server({ port: 8080 });

    this.wss.on('connection', function connection(ws) {
      ws.on('message', function incoming(message) {
        console.log('received: %s', message);
      });
      ws.send('something');

    });
  }

  broadcast(data) {
    this.wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}



let webSocketWrapper = null;

const getWebsocketWrapper = () => {
  if (!webSocketWrapper) {
    webSocketWrapper = new WebSocketWrapper();
  }
  return webSocketWrapper;
};

module.exports = getWebsocketWrapper;