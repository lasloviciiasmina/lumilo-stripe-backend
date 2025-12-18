import { checkSubscription } from "./check-subscription";

export default async function chatAccessHandler(req: any, res: any) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const hasAccess = await checkSubscription(email);

  res.status(200).json({ chatAccess: hasAccess });
}
