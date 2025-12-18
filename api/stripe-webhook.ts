import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).send("Missing Stripe signature");
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // ✅ prima plată sau checkout completat
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email;

        if (email) {
          await activateUser(email);
        }
        break;
      }

      // 🔁 plată lunară reușită
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const email = invoice.customer_email;

        if (email) {
          await activateUser(email);
        }
        break;
      }

      // ❌ abonament anulat
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        );

        if (
          typeof customer !== "string" &&
          customer.email
        ) {
          await deactivateUser(customer.email);
        }
        break;
      }

      // ❌ plată eșuată
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const email = invoice.customer_email;

        if (email) {
          await deactivateUser(email);
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error", err);
    res.status(500).end();
  }
}

/* ===============================
   AICI legi cu BASE
   =============================== */

async function activateUser(email: string) {
  console.log("✅ Activating premium for", email);

  // TODO: AICI faci request către Base
  // ex:
  // await fetch("https://app.base44.com/api/...", { ... })
}

async function deactivateUser(email: string) {
  console.log("❌ Deactivating premium for", email);

  // TODO: AICI faci request către Base
}
