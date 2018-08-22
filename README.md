# react-native-action-cable-jwt
Compatible 100% Rails 5 + GRAPHQL RUBY CLIENT

Make your mobile application safer by avoiding to send tokens via url. Submit your jwt token from your application via the Action Cable header. 
Why not send JWT tokens via URL? read more: https://bit.ly/2nZ4GbS

## INSTALL

```
npm install --save react-native-action-cable-jwt
```

## USAGE
```
import ActionCableJwt from 'react-native-action-cable-jwt';
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink';

const url = '192.168.25.152';
const token = await AsyncStorage.getItem('token');  

const wsUri = `ws://${url}/cable`;
const actionCableJwt = ActionCableJwt.createConnection(() => {
  const jwt = token;
  return jwt;
});
const cable = actionCableJwt.createConsumer(wsUri);
const webSocketLink = new ActionCableLink({ cable });

```
