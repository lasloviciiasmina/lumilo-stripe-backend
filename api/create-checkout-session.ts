import Stripe from "stripe";

// Initialize Stripe cu cheia din Vercel
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export default async function handler(req: any, res: any) {
  // CORS pentru Base + site-ul tău
  res.setHeader("Access-Control-Allow-Origin", "https://lumiloai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request
  if (req.method === "OPTIONS") return res.status(200).end();

  // Acceptăm doar POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Creează sesiunea Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer_email: email, // Stripe creează automat clientul dacă nu există
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1SeZeWD7k1ynQsVYYXRHIqLB", // <-- înlocuiește cu Price ID-ul tău Stripe 4,99 EUR
          quantity: 1,
        },
      ],
      success_url: "https://lumiloai.com/success",
      cancel_url: "https://lumiloai.com/cancel",
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to create checkout session. " + err.message });
  }
}
