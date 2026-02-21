import prisma from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

const DESTINATION_URL = 'https://webhook.site/a989e004-829f-47ae-97bd-20f8019b52a4'; 

export async function POST(request: NextRequest) {
  try {
  
    const body = await request.json();
    const { eventId } = body;

    if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    // Database Lookup: Get the payload
    const webhookEvent = await prisma.webhookEvent.findUnique({
      where: { id: eventId },
    });

    if (!webhookEvent) {
      return NextResponse.json({ error: 'Webhook event not found' }, { status: 404 });
    }

    // Execution: Send the webhook to the destination
    const start = Date.now();
    let responseStatus = 0;
    let responseBody = '';

    try {
      const res = await fetch(DESTINATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event-ID': webhookEvent.id, // Custom header for tracing
        },
        body: JSON.stringify(webhookEvent.payload),
      });

      responseStatus = res.status;
      responseBody = await res.text();
      console.log(`Delivery attempt to ${DESTINATION_URL} responded with status ${responseStatus}`);

    } catch (error) {
      // Network failures (DNS, Timeout, etc.)
      console.error('Error delivering webhook event:', error);
      responseStatus = 500;
      responseBody = String(error);
    }

    const duration = Date.now() - start;

    // Logging: Record the attempt
    await prisma.deliveryAttempt.create({
      data: {
        webhookEventId: webhookEvent.id,
        responseStatus: responseStatus,
        responseBody: responseBody.slice(0, 2000), // Truncate long error messages
      }
    });

    // Update Status: Mark as DELIVERED or FAILED
    const isSuccess = responseStatus >= 200 && responseStatus < 300;

    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { status: isSuccess ? 'DELIVERED' : 'FAILED' },
    });

    // Response to QStash
    if (isSuccess) {
      console.log(`Webhook event ${webhookEvent.id} delivered successfully in ${duration}ms`);
      return NextResponse.json({ message: 'Webhook event delivered successfully' }, { status: 200 });
    } else {
      console.log(`Webhook event ${webhookEvent.id} delivery failed with status ${responseStatus}`);
      // Return 500 to trigger QStash retry
      return NextResponse.json({ error: 'Webhook event delivery failed' }, { status: 500 });
    }

  } catch (error) {
    // Catch unexpected errors (Database down, Bad JSON, etc.)
    console.error('Unexpected error in webhook worker:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
