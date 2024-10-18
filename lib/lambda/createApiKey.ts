import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";

const apiGateway = new AWS.APIGateway();

export const handler: APIGatewayProxyHandler = async (event) => {
  const usagePlanId = process.env.USAGE_PLAN_ID;

  if (!usagePlanId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Usage plan ID is not configured." }),
    };
  }

  try {
    // Create a new API key
    const apiKeyResponse = await apiGateway
      .createApiKey({
        enabled: true,
        generateDistinctId: true,
        name: `ApiKey-${Date.now()}`,
      })
      .promise();

    // Associate the API key with the usage plan
    await apiGateway
      .createUsagePlanKey({
        keyId: apiKeyResponse.id!,
        keyType: "API_KEY",
        usagePlanId: usagePlanId,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ apiKey: apiKeyResponse.value }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error" }),
    };
  }
};
