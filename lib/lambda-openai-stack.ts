import * as cdk from "aws-cdk-lib";
import {
  ApiKey,
  ApiKeySourceType,
  Cors,
  LambdaIntegration,
  Period,
  RestApi,
  UsagePlan,
} from "aws-cdk-lib/aws-apigateway";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

export class LambdaOpenaiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const apiKey = new ApiKey(this, "ApiKey");

    const api = new RestApi(this, "openai-lambda-api", {
      restApiName: "openai-lambda-api",
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    const sandboxUsagePlan = new UsagePlan(this, "SandboxUsagePlan", {
      name: "OpenAILambdaUsagePlan",
      throttle: {
        rateLimit: 10, // requests per second
        burstLimit: 20, // maximum concurrent requests
      },
      quota: {
        limit: 50, // total requests
        period: Period.DAY,
      },
      apiStages: [
        {
          api: api,
          stage: api.deploymentStage,
        },
      ],
    });

    sandboxUsagePlan.addApiKey(apiKey);

    const nodejsProps: NodejsFunctionProps = {
      depsLockFilePath: join(__dirname, "..", "package-lock.json"),
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
      },
    };

    const invokeOpenAILambda = new NodejsFunction(
      this,
      "invokeOpenAIFunction",
      {
        entry: join(__dirname, "./lambda", "openai.ts"),
        ...nodejsProps,
      }
    );

    // API Gateway Lambda integrations
    const invokeOpenAIIntegration = new LambdaIntegration(invokeOpenAILambda, {
      proxy: true,
    });

    // Create API Gateway /openai resource
    const openAIEndpoint = api.root.addResource("openai");

    // Methods for handling /openai requests
    openAIEndpoint.addMethod("POST", invokeOpenAIIntegration, {
      apiKeyRequired: true,
    });

    new cdk.CfnOutput(this, "apiUrl", { value: api.url });
    new cdk.CfnOutput(
      this,
      "sandboxapiKey - check API key with the following ID from AWS console:",
      { value: apiKey.keyId }
    );
  }
}
