/* eslint-disable comma-dangle */
import { Platform } from 'react-native';
import ActionCable from 'actioncable';

const ActionCableJwt = {
  createConnection: ({ tokenCallback }) => {
    ActionCable.getConfig = () => null;
    ActionCable.createWebSocketURL = url => url.replace(/^http/, 'ws');

    ActionCable.Connection.prototype.open = async function open() {
      if (this.isActive()) {
        ActionCable.log(
          `Attempted to open WebSocket, but existing socket is ${this.getState()}`
        );
        return false;
      }

      tokenCallback().then(token => {
        if (token) {
          ActionCable.log(
            `Opening WebSocket, current state is + ${this.getState()}, subprotocols: ${ActionCable.INTERNAL.protocols.concat(
              token
            )}`
          );
          if (this.webSocket != null) this.uninstallEventHandlers();
          this.webSocket = new ActionCable.WebSocket(
            this.consumer.url,
            ActionCable.INTERNAL.protocols.concat(token)
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
      // eslint-disable-next-line no-underscore-dangle
      global.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ = '';
    }

    return ActionCable;
  },
};

export default ActionCableJwt;
