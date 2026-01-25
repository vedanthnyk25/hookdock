import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import {Client} from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

// We define a named export for the HTTP method we want to support (POST)
export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming JSON body
    const body = await req.json();

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const headers= Object.fromEntries(req.headers.entries());

    // Store the webhook event in the database
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        source: body.source || "unknown",
        payload: body,
        headers: headers,
        status: "PENDING", 
      }
    });

    await qstash.publishJSON({
      url: `https://${req.headers.get("host")}/api/worker`,
      body: {
        eventId: webhookEvent.id
      }
    })

    console.log("Enqueued webhook event for processing:", webhookEvent.id);
    
    console.log("Received webhook:", body); 

    return NextResponse.json({ status: "accepted", id: webhookEvent.id }, { status: 200 });

  } catch (error) {
    // Handle JSON parsing errors or DB failures
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
