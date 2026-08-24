interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

let loaded: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  if (!loaded) {
    loaded = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
      document.head.appendChild(script);
    });
  }
  return loaded;
}

export function openRazorpay(options: RazorpayOptions): void {
  if (!window.Razorpay) {
    throw new Error("Razorpay is not loaded.");
  }
  new window.Razorpay(options).open();
}
