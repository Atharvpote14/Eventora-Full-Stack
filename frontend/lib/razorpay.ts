const RAZORPAY_CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<unknown> | null = null;

export function loadRazorpayScript(): Promise<unknown> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${RAZORPAY_CHECKOUT_SRC}"]`,
    );
    if (existing) {
      resolve(existing);
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(script);
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load Razorpay checkout. Please try again."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export async function openRazorpay(options: RazorpayOptions): Promise<RazorpayInstance> {
  await loadRazorpayScript();
  if (!window.Razorpay) {
    throw new Error("Razorpay is unavailable. Please try again.");
  }
  return new window.Razorpay(options);
}