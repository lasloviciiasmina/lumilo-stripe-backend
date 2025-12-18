import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export default async function handler(req: any, res: any) {
  // Set CORS headers corecte
  res.setHeader("Access-Control-Allow-Origin", "*"); // sau domeniul tău Base
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Răspuns la preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Acceptăm doar POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // sau "payment" dacă e plată unică
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "ron",
            product_data: { name: "Lumilo Premium" },
            unit_amount: 999, // 9.99 RON
            recurring: { interval: "month" }, // pentru abonament lunar
          },
          quantity: 1,
        },
      ],
      success_url: "https://SITE-UL-TAU.ro/success",
      cancel_url: "https://SITE-UL-TAU.ro/cancel",
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

