import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getCurrentUser } = await import("npm:@base44/sdk@0.8.4/helpers");
    const currentUser = await base44.entities.Users.filter({ authId: user.id });
    const userRecord = currentUser[0];

    if (!userRecord) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { plan, billingPeriod } = body;

    if (!plan || !billingPeriod) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Define plan prices
    const planPrices = {
      beginner: {
        monthly: 39,
        yearly: 400
      },
      pro: {
        monthly: 59,
        yearly: 650
      },
      business: {
        monthly: 159,
        yearly: 1500
      }
    };

    const planConfig = planPrices[plan];
    if (!planConfig) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const amount = planConfig[billingPeriod];
    const planName = plan === 'beginner' ? 'Beginner' : plan === 'pro' ? 'Pro' : 'Business';
    const periodLabel = billingPeriod === 'monthly' ? 'חודשי' : 'שנתי';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'ils',
            product_data: {
              name: `שדרוג לחבילת ${planName}`,
              description: `תשלום ${periodLabel} עבור חבילת ${planName}`,
            },
            unit_amount: amount * 100, // Stripe expects amount in agorot
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/complete-upgrade-payment?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&billing=${billingPeriod}`,
      cancel_url: `${req.headers.get('origin')}/Upgrade`,
      metadata: {
        userId: userRecord.id,
        userAuthId: user.id,
        plan: plan,
        billingPeriod: billingPeriod
      }
    });

    return Response.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating upgrade payment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});