import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, documentId } = await req.json();

    if (!sessionId || !documentId) {
      return Response.json({ error: 'Session ID and Document ID are required' }, { status: 400 });
    }

    // Verify the payment session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return Response.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // Create lawyer case
    const LawyerCase = base44.entities.LawyerCase;
    const Document = base44.entities.Document;
    const Users = base44.entities.Users;
    
    const doc = await Document.filter({ id: documentId });
    if (!doc || doc.length === 0) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    const lawyerCase = await LawyerCase.create({
      documentId,
      clientUserId: user.id,
      client_name: user.full_name || user.email,
      client_email: user.email,
      client_summary: doc[0].ai_analysis?.executive_summary || 'לא זמין',
      urgency: 'medium',
      status: 'pending',
      paymentSessionId: sessionId,
      amountPaid: session.amount_total
    });

    // Update document status
    await Document.update(documentId, {
      status: 'lawyer_requested'
    });

    // Send email notification to lawyers
    try {
      const lawyers = await Users.filter({ role: 'lawyer' });
      
      for (const lawyer of lawyers) {
        await base44.integrations.Core.SendEmail({
          to: lawyer.email,
          subject: 'מסמך חדש לבדיקה ב-Decifra.ai',
          body: `שלום ${lawyer.name || 'עורך דין'},\n\nהוקצה לך מסמך חדש לבדיקה במערכת Decifra.ai.\n\nפרטי המסמך:\n- שם המסמך: ${doc[0].title}\n- לקוח: ${user.full_name || user.email}\n- תאריך: ${new Date().toLocaleDateString('he-IL')}\n\nכנס לדשבורד עורכי הדין לצפייה ובדיקה:\n${Deno.env.get("APP_URL") || "https://app.decifra.ai"}/lawyer-dashboard\n\nצוות Decifra.ai`
        });
      }
    } catch (emailError) {
      console.error('Error sending email to lawyers:', emailError);
    }

    return Response.json({
      success: true,
      caseId: lawyerCase.id,
      message: 'התשלום עבר בהצלחה והמסמך נשלח לעורך דין'
    });

  } catch (error) {
    console.error('Payment completion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});