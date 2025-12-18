import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
});

export async function checkSubscription(email: string) {
  // Caută customer-ul Stripe după email
  const customers = await stripe.customers.list({ email });
  if (customers.data.length === 0) return false;

  const customerId = customers.data[0].id;

  // Verifică abonamentele active
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
  });

  if (subscriptions.data.length === 0) return false;

  // Verifică dacă perioada curentă e valabilă
  const now = Math.floor(Date.now() / 1000);
  const activeSub = subscriptions.data.find(sub => sub.current_period_end >= now);

  return !!activeSub; // true dacă abonament activ, false dacă nu
}
