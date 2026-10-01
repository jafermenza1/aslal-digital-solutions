export type PayoutProvider = "MANUAL" | "TELEBIRR" | "MPESA";

export type PayoutRequest = {
  payoutId: string;
  amount: string;
  currency: string;
  accountName?: string | null;
  accountNumber?: string | null;
  mobileWallet?: string | null;
  country?: string | null;
  idempotencyKey: string;
};

export type PayoutProviderResult =
  | { status: "SUBMITTED"; providerTransactionId: string; raw?: unknown }
  | { status: "CONFIRMED"; providerTransactionId: string; raw?: unknown }
  | { status: "FAILED"; failureCode?: string; failureReason: string; raw?: unknown }
  | { status: "REQUIRES_MANUAL_REVIEW"; failureCode?: string; failureReason: string; raw?: unknown };

export interface PayoutProviderAdapter {
  readonly provider: PayoutProvider;
  validate(request: PayoutRequest): Promise<void>;
  submit(request: PayoutRequest): Promise<PayoutProviderResult>;
  verify(providerTransactionId: string, request: PayoutRequest): Promise<PayoutProviderResult>;
}

/**
 * Deliberately disabled until the official provider API contract and credentials
 * are configured. This prevents pretending that an API integration exists.
 */
export class UnconfiguredPayoutProvider implements PayoutProviderAdapter {
  constructor(public readonly provider: PayoutProvider) {}
  async validate(_request: PayoutRequest) {
    if (this.provider !== "MANUAL") throw new Error(`${this.provider} payout integration is not configured.`);
  }
  async submit(_request: PayoutRequest): Promise<PayoutProviderResult> {
    return { status: "REQUIRES_MANUAL_REVIEW", failureCode: "PROVIDER_NOT_CONFIGURED", failureReason: "Provider API credentials and contract are not configured." };
  }
  async verify(_providerTransactionId: string, _request: PayoutRequest): Promise<PayoutProviderResult> {
    return { status: "REQUIRES_MANUAL_REVIEW", failureCode: "PROVIDER_NOT_CONFIGURED", failureReason: "Provider API credentials and contract are not configured." };
  }
}

export function getPayoutProviderAdapter(provider: PayoutProvider): PayoutProviderAdapter {
  // Future adapters must implement the exact interface above; no provider-specific
  // assumptions are made here until the official APIs are supplied.
  return new UnconfiguredPayoutProvider(provider);
}
