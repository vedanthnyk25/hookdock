import { WebhookProvider } from "./types";
import { NoneProvider } from "./none";
import { GitHubProvider } from "./github";


const providers: Record<string, WebhookProvider> = {
  
  // List of available providers
  none: new NoneProvider(),

  github: new GitHubProvider()

};

export function getProvider(source: string): WebhookProvider {
  return providers[source] || providers["none"];
}

