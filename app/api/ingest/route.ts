import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import {Client} from "@upstash/qstash";
import { getProvider } from "@/lib/providers/factory";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    
    const body = await req.json();

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const searchParams= req.nextUrl.searchParams
    const source= searchParams.get("source") || "none";

    const provider= getProvider(source);
    const headers= Object.fromEntries(req.headers.entries());

    const isValid= await provider.verify(body, headers);

    if (!isValid) {
      console.warn(`Blocked unauthorized request from source: ${source}`);
      return NextResponse.json({ error: "Unauthorized: Invalid Signature" }, { status: 401 });
    }

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
