declare module 'react-native-action-cable-jwt' {
  import { Cable } from 'actioncable';

  export interface ConnectionOptions {
    tokenCallback: () => Promise<string | null | undefined>;
  }

  export interface Connection {
    createConsumer(): Cable;
    createConsumer(url: string): Cable;
  }

  class ActionCable {
    static createConnection(connectionOptions: ConnectionOptions): Connection;
  }

  export default ActionCable;
}
