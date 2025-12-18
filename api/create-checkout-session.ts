import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export default async function handler(req: any, res: any) {
  // CORS headers corecte pentru Base / site-ul tău
  res.setHeader("Access-Control-Allow-Origin", "https://lumiloai.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight request (OPTIONS)
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "prod_TbnFozJaYoh6k5", // Price ID-ul tău
          quantity: 1,
        },
      ],
      success_url: "https://lumiloai.com/success",
      cancel_url: "https://lumiloai.com/cancel",
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

