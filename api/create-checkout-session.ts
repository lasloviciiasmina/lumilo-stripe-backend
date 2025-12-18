import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export default async function handler(req: any, res: any) {
  // === CORS fix complet ===
  const allowedOrigin = "https://lumiloai.com"; // domeniul tău
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Răspunde imediat la preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, coupon } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        { price: "price_1SeZeWD7k1ynQsVYYXRHIqLB", quantity: 1 }
      ],
      discounts: coupon ? [{ coupon }] : [],
      success_url: "https://lumiloai.com/success",
      cancel_url: "https://lumiloai.com/cancel",
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Failed to create checkout session: " + err.message });
  }
}
