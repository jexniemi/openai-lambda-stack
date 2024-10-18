# openai-lambda-stack

Invoke OpenAI with Lambda through API Gateway (with rate limit and API key).

## Requirements

You need to create OpenAI API access key at the [OpenAI dashboard](https://platform.openai.com/chat-completions), and set credit on your account.

## Deployments

To deploy the application, run `$ OPENAI_API_KEY=<YOUR_OPENAI_ACCESS_KEY_HERE> npx cdk deploy`.

## Testing your deployment

A simple way to test the deployment is to install VSCode extension REST Client.

Create `/requests` directory and place `/requests/test.http` file with the following contents:

```
POST <YOUR_API_URL>/openai
Content-Type: application/json
x-api-key: <YOUR_API_KEY>

{ "message": "whales" }
```

YOUR_API_URL is printed on the console when you deploy the application through command line. You can retrieve YOUR_API_KEY from AWS console after deployment.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

##
