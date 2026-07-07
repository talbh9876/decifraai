import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// Base price for lawyer review in ILS (agorot - 1 ILS = 100 agorot)
const BASE_PRICE = 20000; // 200 ILS

// Discount rates per plan
const PLAN_DISCOUNTS = {
  free: 0,
  beginner: 0.10,
  pro: 0.20,
  business: 0.30
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await req.json();

    if (!documentId) {
      return Response.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Get user's plan from Users entity
    const Users = base44.entities.Users;
    const userRecords = await Users.filter({ authId: user.id });
    const userRecord = userRecords[0];
    const plan = userRecord?.plan || 'free';

    // Calculate price with discount
    const discount = PLAN_DISCOUNTS[plan] || 0;
    const finalPrice = Math.round(BASE_PRICE * (1 - discount));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ils',
            product_data: {
              name: 'בדיקת עורך דין',
              description: `בדיקה משפטית מקצועית של המסמך שלך (חבילת ${plan})`,
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/lawyer-dashboard?session_id={CHECKOUT_SESSION_ID}&document_id=${documentId}`,
      cancel_url: `${req.headers.get('origin')}/lawyer-dashboard?canceled=true`,
      metadata: {
        documentId,
        userId: user.id,
        userEmail: user.email,
        plan
      },
    });

    return Response.json({
      sessionId: session.id,
      url: session.url,
      originalPrice: BASE_PRICE,
      discount: discount * 100,
      finalPrice,
      plan
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});