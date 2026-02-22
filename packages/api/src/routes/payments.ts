import { Router, type Request, type Response } from "express";
import { stripe } from "../config/stripe.js";
import { adminDb } from "../config/firebase.js";
import { authMiddleware, getUid } from "../middleware/auth.js";
import { CREDIT_PACKS } from "@resume-gen/shared";
import { FieldValue } from "firebase-admin/firestore";

export const paymentsRouter: Router = Router();

// Create checkout session
paymentsRouter.post("/checkout", authMiddleware, async (req: Request, res: Response) => {
  const uid = getUid(req);
  const { packId } = req.body;

  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) {
    res.status(400).json({ message: "Invalid pack ID" });
    return;
  }

  try {
    // Get or create Stripe customer
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();
    let stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userDoc.data()?.email,
        metadata: { firebaseUid: uid },
      });
      stripeCustomerId = customer.id;
      await userRef.update({ stripeCustomerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pack.name} - ${pack.credits} Credits`,
              description: `${pack.credits} resume generation credits`,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        uid,
        packId: pack.id,
        credits: pack.credits.toString(),
      },
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard?purchased=true`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/pricing`,
    });

    // Record pending purchase
    await adminDb.collection("purchases").add({
      userId: uid,
      stripeSessionId: session.id,
      packId: pack.id,
      credits: pack.credits,
      amount: pack.price,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
});

// Stripe webhook
paymentsRouter.post("/webhooks/stripe", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch {
    res.status(400).json({ message: "Invalid webhook signature" });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const uid = session.metadata?.uid;
    const credits = parseInt(session.metadata?.credits || "0", 10);

    if (uid && credits > 0) {
      try {
        // Add credits
        const userRef = adminDb.collection("users").doc(uid);
        await adminDb.runTransaction(async (tx) => {
          tx.update(userRef, {
            credits: FieldValue.increment(credits),
            updatedAt: FieldValue.serverTimestamp(),
          });
        });

        // Update purchase status
        const purchaseQuery = await adminDb
          .collection("purchases")
          .where("stripeSessionId", "==", session.id)
          .limit(1)
          .get();

        if (!purchaseQuery.empty) {
          await purchaseQuery.docs[0].ref.update({ status: "completed" });
        }
      } catch (error) {
        console.error("Webhook processing error:", error);
      }
    }
  }

  res.json({ received: true });
});
