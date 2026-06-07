import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  from?: string;
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ from, to, subject, html }: SendEmailOptions) {
  try {
    await resend.emails.send({
      from: from || "contact@energy-i.ai",
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
