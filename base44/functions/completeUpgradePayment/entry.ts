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

    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    const plan = url.searchParams.get('plan');
    const billingPeriod = url.searchParams.get('billing');

    if (!sessionId || !plan || !billingPeriod) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Verify the payment session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Update user's plan
    const currentUser = await base44.entities.Users.filter({ authId: user.id });
    const userRecord = currentUser[0];

    if (!userRecord) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    await base44.asServiceRole.entities.Users.update(userRecord.id, {
      plan: plan,
      scansUsed: 0
    });

    return Response.json({ 
      success: true, 
      message: 'Plan upgraded successfully',
      plan: plan 
    });
  } catch (error) {
    console.error('Error completing upgrade payment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});