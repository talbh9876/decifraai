import { base44 } from "@/api/base44Client";

const Notification = base44.entities.Notification;
const SendEmail = base44.integrations.Core.SendEmail;

export async function sendNotification({ userEmail, type, title, message, documentId, sendEmailNotification = true }) {
  try {
    // Create notification in database
    await Notification.create({
      user_email: userEmail,
      type: type,
      title: title,
      message: message,
      document_id: documentId,
      is_read: false,
      sent_email: false
    });

    // Send email notification if enabled
    if (sendEmailNotification) {
      try {
        await SendEmail({
          to: userEmail,
          subject: title,
          body: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1C3D5A; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">DECIFRA<span style="color: #3B82C4">.AI</span></h1>
              </div>
              <div style="padding: 30px; background: #F5F6F7;">
                <h2 style="color: #0F1E2E; margin-top: 0;">${title}</h2>
                <p style="color: #5A6B7D; line-height: 1.6;">${message}</p>
                <a href="https://app.base44.com" style="display: inline-block; background: #1C3D5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">
                  צפה בפרטים
                </a>
              </div>
              <div style="padding: 20px; text-align: center; color: #8A9AAD; font-size: 12px;">
                © 2024 Decifra.ai - ניתוח מסמכים משפטיים
              </div>
            </div>
          `
        });

        // Update notification that email was sent
        const notifs = await Notification.filter({ user_email: userEmail, document_id: documentId }, "-created_date", 1);
        if (notifs.length > 0) {
          await Notification.update(notifs[0].id, { sent_email: true });
        }
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    }

    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

export function getNotificationMessages(language) {
  return {
    he: {
      statusChange: {
        analyzing: { title: "המסמך בניתוח", message: "המסמך שלך נמצא כעת בתהליך ניתוח AI" },
        analyzed: { title: "הניתוח הושלם", message: "ניתוח ה-AI של המסמך הושלם בהצלחה" },
        lawyer_requested: { title: "נשלח לעורך דין", message: "המסמך נשלח לבדיקת עורך דין מקצועי" },
        lawyer_reviewing: { title: "בבדיקת עורך דין", message: "עורך הדין בודק כעת את המסמך שלך" },
        completed: { title: "הושלם!", message: "חוות הדעת המשפטית מוכנה לצפייה" }
      },
      lawyerOpinion: { title: "חוות דעת חדשה", message: "התקבלה חוות דעת משפטית למסמך שלך" },
      pendingReminder: { title: "תזכורת: תיק ממתין", message: "תיק זה ממתין לטיפולך כבר יותר מ-24 שעות" }
    },
    en: {
      statusChange: {
        analyzing: { title: "Document Analyzing", message: "Your document is currently being analyzed by AI" },
        analyzed: { title: "Analysis Complete", message: "AI analysis of your document is complete" },
        lawyer_requested: { title: "Sent to Lawyer", message: "Your document was sent to a professional lawyer" },
        lawyer_reviewing: { title: "Under Review", message: "A lawyer is currently reviewing your document" },
        completed: { title: "Completed!", message: "The legal opinion is ready for viewing" }
      },
      lawyerOpinion: { title: "New Opinion", message: "A legal opinion has been received for your document" },
      pendingReminder: { title: "Reminder: Pending Case", message: "This case has been pending for over 24 hours" }
    }
  }[language] || {};
}