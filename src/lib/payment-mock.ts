// src/lib/payment-mock.ts
/**
 * Mock payment gateway.
 * Nanti ganti dengan integrasi Midtrans / Xendit beneran.
 */

export type PaymentMethod = "bank_transfer" | "qris" | "virtual_account" | "credit_card";

export const paymentMethods: {
  key: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    key: "bank_transfer",
    label: "Transfer Bank",
    description: "BCA, Mandiri, BNI, BRI",
    icon: "🏦",
  },
  {
    key: "qris",
    label: "QRIS",
    description: "Scan pakai e-wallet apa saja",
    icon: "📱",
  },
  {
    key: "virtual_account",
    label: "Virtual Account",
    description: "Bayar via ATM/mobile banking",
    icon: "💳",
  },
  {
    key: "credit_card",
    label: "Kartu Kredit",
    description: "Visa, Mastercard, JCB",
    icon: "💳",
  },
];

/**
 * Simulasi API call ke payment gateway.
 * Selalu return success setelah 1.5 detik.
 */
export async function simulatePayment(params: {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}): Promise<{
  success: boolean;
  gatewayStatus: string;
  paymentRef: string;
}> {
  // Simulasi delay
  await new Promise((r) => setTimeout(r, 1500));

  // Generate fake payment reference
  const ref = `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  return {
    success: true,
    gatewayStatus: "settlement",
    paymentRef: ref,
  };
}