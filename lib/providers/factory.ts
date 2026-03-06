import { WebhookProvider } from "./types";
import { NoneProvider } from "./none";
import { GitHubProvider } from "./github";
import { StripeProvider } from "./stripe";


const providers: Record<string, WebhookProvider> = {
  
  // List of available providers
  none: new NoneProvider(),

  github: new GitHubProvider(),

  stripe: new StripeProvider(),

};

export function getProvider(source: string): WebhookProvider {
  return providers[source] || providers["none"];
}

