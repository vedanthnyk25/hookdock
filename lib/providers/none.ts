import { WebhookProvider } from "./types";

export class NoneProvider implements WebhookProvider {
  providerId = "none";

  async verify(body: any, headers: any): Promise<boolean> {
    return true; // Always trust (for manual testing)
  }
}
