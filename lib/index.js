import { Platform } from 'react-native';
import ActionCable from 'actioncable';

const ActionCableJwt = {
  createConnection: (jwtCallback) => {
    ActionCable.getConfig = () => null;
    ActionCable.createWebSocketURL = url => url.replace(/^http/, 'ws');

    ActionCable.Connection.prototype.open = async function open() {
      if (this.isActive()) {
        ActionCable.log(`Attempted to open WebSocket, but existing socket is ${(this.getState())}`);
        return false;
      }
      
      jwtCallback().then((jwt) => {
        if (jwt) {
          ActionCable.log(`Opening WebSocket, current state is + ${(this.getState())}, subprotocols: ${ActionCable.INTERNAL.protocols.concat(jwt)}`);
          if (this.webSocket != null) this.uninstallEventHandlers();
          this.webSocket = new ActionCable.WebSocket(
            this.consumer.url, ActionCable.INTERNAL.protocols.concat(jwt),
          );
          this.webSocket.protocol = 'actioncable-v1-json';
          this.installEventHandlers();
          this.monitor.start();
        }
      });
      return true;
    };

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      global.document = {
        addEventListener() {},
        removeEventListener() {},
      };
      global.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ = '';
    }
    return ActionCable;
  },
};

export default ActionCableJwt;