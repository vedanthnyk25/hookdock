import { WebhookProvider } from "./types";
import crypto from 'crypto';

export class StripeProvider implements WebhookProvider {
  providerId = "stripe";

  async verify(body: any, headers: any, secret: string): Promise<boolean> {
    const signatureHeader= headers["stripe-signature"];
    if(!signatureHeader || typeof signatureHeader !== "string") return false;

    const [timeStampPart, signaturePart] = signatureHeader.split(",");
    const timeStamp = timeStampPart.split("=")[1];
    const signature = signaturePart.split("=")[1];

    const timeStampNum= parseInt(timeStamp, 10);
    const currentTime= Math.floor(Date.now() / 1000);

    const timeDifference= Math.abs(currentTime - timeStampNum);

    if (timeDifference > 300) {
      console.warn("Stripe webhook timestamp is too old or too far in the future.");
      return false;
    }

    const signedPayload= `${timeStamp}.${JSON.stringify(body)}`;

    const hmac= crypto.createHmac("sha256", secret);
    hmac.update(signedPayload);

    const calculatedSignature= hmac.digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  }
}
