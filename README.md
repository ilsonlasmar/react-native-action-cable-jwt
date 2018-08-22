# react-native-action-cable-jwt
Compatible 100% Rails 5 + GRAPHQL RUBY CLIENT

Make your mobile application safer by avoiding to send tokens via url. Submit your jwt token from your application via the Action Cable header. 
Why not send JWT tokens via URL? read more: https://bit.ly/2nZ4GbS

## INSTALL

```
npm install --save react-native-action-cable-jwt
```

## USAGE
```jsx
import ActionCableJwt from 'react-native-action-cable-jwt';
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink';

const url = 'http://YOUR_URL';
const token = await AsyncStorage.getItem('token');  

const wsUri = `ws://${url}/cable`;
const actionCableJwt = ActionCableJwt.createConnection(() => {
  const jwt = token;
  return jwt;
});
const cable = actionCableJwt.createConsumer(wsUri);
const webSocketLink = new ActionCableLink({ cable });

```

#### CHANGE GRAPHQL CHANNEL
```ruby
class GraphqlChannel < ApplicationCable::Channel
  def subscribed    
    @subscription_ids = []
  end

  def execute(data)
    query = data['query']
    variables = ensure_hash(data['variables'])
    operation_name = data['operationName']
    context = {
      current_user: current_user,
      channel: self,
    }

    result = YOURSCHEMA.execute(query: query,
      context: context,
      variables: variables,
      operation_name: operation_name)

    payload = {
      result: result.subscription? ? {data: nil} : result.to_h,
      more: result.subscription?
    }

    if result.context[:subscription_id]
      @subscription_ids << context[:subscription_id]
    end

    transmit(payload)
  end

  def unsubscribed
    @subscription_ids.each { |sid|
      YOURSCHEMA.subscriptions.delete_subscription(sid)
    }
  end

  private

  def ensure_hash(ambiguous_param)
    case ambiguous_param
    when String
      ambiguous_param.present? ? ensure_hash(JSON.parse(ambiguous_param)) : {}
    when Hash, ActionController::Parameters
      ambiguous_param
    when nil
      {}
    else
      raise ArgumentError, "Unexpected parameter: #{ambiguous_param}"
    end
  end  
end

```
