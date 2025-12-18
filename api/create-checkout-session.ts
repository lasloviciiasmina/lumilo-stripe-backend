import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

// Functia handler
export default async function handler(req: any, res: any) {
  // CORS headers (permite Base + site-ul tău)
  res.setHeader("Access-Control-Allow-Origin", "https://lumiloai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, coupon } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Verifica dacă clientul există deja în Stripe
    let customers = await stripe.customers.list({ email });
    let customer = customers.data[0];

    if (!customer) {
      customer = await stripe.customers.create({ email });
    }

    // Verifică abonamente active existente (inclusiv vechi)
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
    });

    if (subscriptions.data.length > 0) {
      return res.status(200).json({ message: "You already have an active subscription" });
    }

    // Creează sesiunea de Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1SeZeWD7k1ynQsVYYXRHIqLB", // înlocuiește cu Price ID-ul tău 4,99 EUR
          quantity: 1,
        },
      ],
      discounts: coupon ? [{ coupon }] : [],
      success_url: "https://lumiloai.com/success",
      cancel_url: "https://lumiloai.com/cancel",
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to create checkout session. " + err.message });
  }
}

