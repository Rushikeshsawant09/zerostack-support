import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Prevents multiple client connections during local development reloads
const globalForDynamo = globalThis as unknown as { dbClient: DynamoDBClient | undefined };

const client = globalForDynamo.dbClient ?? new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

if (process.env.NODE_ENV !== "production") globalForDynamo.dbClient = client;

// DocumentClient automatically converts JavaScript types to DynamoDB formats
export const db = DynamoDBDocumentClient.from(client);
