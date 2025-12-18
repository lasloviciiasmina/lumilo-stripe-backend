import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // sau domeniul Base
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Răspuns la preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // abonament lunar
      payment_method_types: ["card"],
      line_items: [
        {
          price: "prod_TbnFozJaYoh6k5", // Price ID-ul tău
          quantity: 1,
        },
      ],
      discounts: req.body.coupon ? [{ coupon: req.body.coupon }] : [],
      success_url: "https://SITE-UL-TAU.ro/success",
      cancel_url: "https://SITE-UL-TAU.ro/cancel",
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
