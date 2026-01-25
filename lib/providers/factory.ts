import { WebhookProvider } from "./types";
import { NoneProvider } from "./none";


const providers: Record<string, WebhookProvider> = {
  
  // List of available providers
  none: new NoneProvider(),

};

export function getProvider(source: string): WebhookProvider {
  return providers[source] || providers["none"];
}

