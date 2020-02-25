# React Native + Action Cable + Authentication

Use Rails 5+ ActionCable securely with JWT/Token based authentication, and enjoy some realtime magic.

This framework integrates nicely with subscription-based client side libraries such as Apollo Client or Relay Modern.

## Installation

```bash
yarn add react-native-action-cable-jwt
```

## Features

- Apollo Client Support
- Relay Modern Support
- Standalone Support
- `devise_token_auth` support
- JWT support
- Typescript Support

## Usage

### Client Side (React Native)

#### Apollo Client

```js
import ActionCable from 'react-native-action-cable-jwt';
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink';

const url = 'http://URL';
const wsUri = `ws://${url}/cable`;

// Create a connection to the action cable server
const connection = ActionCable.createConnection({
  // Used to retrieve the auth token. Can either be async or
  // return a promise.
  tokenCallback: async () => {
    return AsyncStorage.getItem('@token');
  },
});

// Create a cable interface from the connection.
const cable = connection.createConsumer(wsUri);
const webSocketLink = new ActionCableLink({ cable });
```

#### Relay Modern

```js
import ActionCable from 'react-native-action-cable-jwt';
import createHandler from 'graphql-ruby-client/dist/subscriptions/createHandler';

const url = 'http://URL';
const wsUri = `ws://${url}/cable`;

const connection = ActionCable.createConnection({
  tokenCallback: async () => {
    return AsyncStorage.getItem('@token');
  },
});

const cable = connection.createConsumer(wsUri);
const subscriptionHandler = createHandler({
  cable,
});
```

#### Standalone

```js
import ActionCable from 'react-native-action-cable-jwt';

const connection = ActionCable.createConnection({
  tokenCallback: async () => {
    return AsyncStorage.getItem('@token');
  },
});

const cable = connection.createConsumer('http://localhost:3000');
cable.subscriptions.create(
  {
    channel: 'ChatChannel',
    channelId: 123,
  },
  {
    connected() {
      console.log('Connected');
    },
    received(payload) {
      console.log('Received', payload);
    },
  }
);
```

### Server Side (Rails 5+)

The only thing you are required to do is adjust the `:find_verified_user` to get the access token like so:

app/channels/application_cable/connection.rb

```ruby
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    protected

    def find_verified_user
      return nil if header_token.blank?

      # find the user using the header_token...
    end


    def header_token
      header_array = request.headers[:HTTP_SEC_WEBSOCKET_PROTOCOL].split(',')
      header_array[header_array.length - 1]
    end
  end
end
```

### Devise Token Auth Implementation

If you are using `devise_token_auth` as your authentication library, you will need to convert the authentication headers object into a string and parse that string on your rails server.

#### Client Side

```js
const connection = ActionCable.createConnection({
  tokenCallback: async () => {
    const authHeaders = await AsyncStorage.getItem('@authHeaders');
    return JSON.stringify(authHeaders);
  },
});
```

#### Server Side

app/channels/application_cable/connection.rb

```ruby
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    protected

    def find_verified_user
      return reject_unauthorized_connection if header_token.blank?

      # read from the auth_headers
      uid = auth_headers[:uid]
      access_token = auth_headers[:access_token]
      client = auth_headers[:client]

      user = User.find_by_uid(uid)

      if user && user.valid_token?(token, client)
        user
      else
        reject_unauthorized_connection
      end
    end


    def auth_headers
      header_array = request.headers[:HTTP_SEC_WEBSOCKET_PROTOCOL].split(',')
      header_array = header_array[header_array.length - 1]

      JSON.parse(header_array)
        .transform_keys { |key| key.to_s.underscore }
    end
  end
end
```

## Roadmap

- Redux support
- Unit testing
