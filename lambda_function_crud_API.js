import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = "http-crud-tutorial-items";

const successResponse = (body) => {
  return {
    statusCode: 200,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };
};

const errorResponse = (statusCode, message) => {
  return {
    statusCode,
    body: JSON.stringify({ error: message }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};

export const handler = async (event) => {
  try {
    switch (event.routeKey) {
      case "DELETE /items/{id}":
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        return successResponse(`Deleted item ${event.pathParameters.id}`);

      case "GET /items/{id}":
        const getResponse = await dynamo.send(
          new GetCommand({
            TableName: tableName,
            Key: {
              id: event.pathParameters.id,
            },
          })
        );
        return successResponse(getResponse.Item);

      case "GET /items":
        const scanResponse = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        return successResponse(scanResponse.Items);

      case "PUT /items":
        const requestJSON = JSON.parse(event.body);
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              id: requestJSON.id,
              price: requestJSON.price,
              name: requestJSON.name,
            },
          })
        );
        return successResponse(`Put item ${requestJSON.id}`);

      default:
        return errorResponse(400, `Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    return errorResponse(500, err.message);
  }
};
