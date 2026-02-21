import { WebhookProvider } from "./types";

import crypto from "crypto";

export class GitHubProvider implements WebhookProvider {

  providerId = "github";

  async verify(body: any, headers: any): Promise<boolean> {
    
    const signature= headers["x-hub-signature-256"];

    if(!signature) return false;

    const WEBHOOK_SECRET= process.env.WEBHOOK_SECRET || "";

    const hmac= crypto.createHmac("sha256", WEBHOOK_SECRET);
    hmac.update(JSON.stringify(body));

    const calculated = `sha256=${hmac.digest("hex")}`;

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculated)
    );
  }
}
