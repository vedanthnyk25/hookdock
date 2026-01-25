// lib/providers/types.ts

// The contract every provider must satisfy
export interface WebhookProvider {
  /**
   * Unique identifier (e.g., 'stripe', 'github')
   */
  providerId: string;

  /**
   * Validates the incoming request (HMAC signature check)
   * Returns true if valid, false if forged.
   */
  verify(body: any, headers: any): Promise<boolean>;
}

