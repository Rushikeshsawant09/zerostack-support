import { NextResponse } from "next/server";
import { db } from "@/lib/dynamodb";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = "ZeroStackTickets";

// GET Endpoint: Fetches all tickets from your AWS cloud database
export async function GET() {
  try {
    const result = await db.send(new ScanCommand({ TableName: TABLE_NAME }));
    return NextResponse.json(result.Items || []);
  } catch (error) {
    console.error("Database fetch log:", error);
    return NextResponse.json({ error: "Cloud database communication failed" }, { status: 500 });
  }
}

// POST Endpoint: Safely saves a new ticket to your AWS cloud database
export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();
    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTicket = {
      ticketId: crypto.randomUUID(), // Automatically generates a unique tracking ID
      title,
      description,
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    await db.send(new PutCommand({ TableName: TABLE_NAME, Item: newTicket }));
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error("Database write log:", error);
    return NextResponse.json({ error: "Failed to write data to cloud storage" }, { status: 500 });
  }
}
