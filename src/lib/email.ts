import * as Brevo from "@getbrevo/brevo";

// ─── Brevo Client ────────────────────────────────────────────────────────────

function getBrevoClient() {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY!,
  );
  return apiInstance;
}

function getSender() {
  return {
    email: process.env.SENDER_EMAIL!,
    name: process.env.SENDER_NAME!,
  };
}

function getTeam() {
  return {
    email: process.env.TEAM_EMAIL!,
    name: process.env.TEAM_NAME!,
  };
}

// ─── HTML Template Builder ───────────────────────────────────────────────────

export function buildEmailHtml({
  tag,
  heading,
  body,
  footer,
}: {
  tag?: string;
  heading: string;
  body: string;
  footer?: string;
}) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
    <div style="max-width:580px;margin:0 auto;padding:40px 24px;">
      <div style="border:1px solid #333;border-radius:12px;padding:32px;background:#1a1a1a;">
        ${tag ? `<p style="color:#00b2ff;font-size:12px;letter-spacing:4px;margin:0 0 8px;">${tag}</p>` : ""}
        <h1 style="color:#ffffff;font-size:22px;margin:0 0 16px;">${heading}</h1>
        ${body}
        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #333;">
          <p style="color:#444;font-size:11px;margin:0;">${footer ?? "Dexta Synergy Services &middot; @hellodexta &middot; Port Harcourt, Nigeria"}</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

// ─── Generic Send ────────────────────────────────────────────────────────────

export async function sendEmail({
  to,
  subject,
  htmlContent,
  replyTo,
}: {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}) {
  const client = getBrevoClient();
  const email = new Brevo.SendSmtpEmail();
  email.subject = subject;
  email.sender = getSender();
  email.to = [to];
  email.htmlContent = htmlContent;
  if (replyTo) email.replyTo = replyTo;
  await client.sendTransacEmail(email);
}

// ─── Event-Specific Emails ───────────────────────────────────────────────────

interface EventInfo {
  title: string;
  dateTime: Date;
  timezone: string;
  location: string;
}

function formatEventDate(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(date);
}

export async function sendPendingEmail(
  registration: { name: string; email: string },
  event: EventInfo,
) {
  const firstName = registration.name.split(" ")[0];
  const team = getTeam();

  await sendEmail({
    to: { email: registration.email, name: registration.name },
    subject: `Registration received — ${event.title}`,
    htmlContent: buildEmailHtml({
      tag: "REGISTRATION RECEIVED",
      heading: `Thanks, ${firstName}!`,
      body: `
        <p style="color:#a0a0a0;font-size:14px;line-height:1.8;margin:0 0 24px;">
          We've received your registration for <strong style="color:#fff;">${event.title}</strong>.
          Your spot is being reviewed and we'll notify you once it's confirmed.
        </p>
        <div style="background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="color:#666;font-size:11px;letter-spacing:2px;margin:0 0 8px;">EVENT DETAILS</p>
          <p style="color:#fff;font-size:14px;margin:0 0 4px;">${event.title}</p>
          <p style="color:#a0a0a0;font-size:13px;margin:0 0 4px;">${formatEventDate(event.dateTime, event.timezone)}</p>
          <p style="color:#a0a0a0;font-size:13px;margin:0;">${event.location}</p>
        </div>
        <p style="color:#a0a0a0;font-size:13px;margin:0;">
          Questions? Reply to this email or reach us at
          <a href="mailto:${team.email}" style="color:#00b2ff;text-decoration:none;">${team.email}</a>
        </p>`,
    }),
  });
}

export async function sendAcceptanceEmail(
  registration: { name: string; email: string },
  event: EventInfo,
) {
  const firstName = registration.name.split(" ")[0];
  const team = getTeam();

  await sendEmail({
    to: { email: registration.email, name: registration.name },
    subject: `You're in — ${event.title}!`,
    htmlContent: buildEmailHtml({
      tag: "REGISTRATION CONFIRMED",
      heading: `You're in, ${firstName}!`,
      body: `
        <p style="color:#a0a0a0;font-size:14px;line-height:1.8;margin:0 0 24px;">
          Great news — your registration for <strong style="color:#fff;">${event.title}</strong> has been accepted!
        </p>
        <div style="background:#0a0a0a;border:1px solid #333;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="color:#666;font-size:11px;letter-spacing:2px;margin:0 0 8px;">EVENT DETAILS</p>
          <p style="color:#fff;font-size:14px;margin:0 0 4px;">${event.title}</p>
          <p style="color:#a0a0a0;font-size:13px;margin:0 0 4px;">${formatEventDate(event.dateTime, event.timezone)}</p>
          <p style="color:#a0a0a0;font-size:13px;margin:0;">${event.location}</p>
        </div>
        <p style="color:#a0a0a0;font-size:13px;margin:0 0 4px;">
          We'll send you the final details closer to the date. In the meantime, keep building great things.
        </p>
        <p style="color:#a0a0a0;font-size:13px;margin:0;">
          Questions? Reach us at
          <a href="mailto:${team.email}" style="color:#00b2ff;text-decoration:none;">${team.email}</a>
        </p>`,
    }),
  });
}

export async function sendDeclineEmail(
  registration: { name: string; email: string },
  event: EventInfo,
  reason?: string,
) {
  const firstName = registration.name.split(" ")[0];
  const team = getTeam();

  const reasonText = reason
    ? `<p style="color:#a0a0a0;font-size:13px;line-height:1.8;margin:0 0 16px;"><strong style="color:#fff;">Reason:</strong> ${reason}</p>`
    : "";

  await sendEmail({
    to: { email: registration.email, name: registration.name },
    subject: `Update on your registration — ${event.title}`,
    htmlContent: buildEmailHtml({
      tag: "REGISTRATION UPDATE",
      heading: `Hi ${firstName},`,
      body: `
        <p style="color:#a0a0a0;font-size:14px;line-height:1.8;margin:0 0 16px;">
          Thank you for your interest in <strong style="color:#fff;">${event.title}</strong>.
          Unfortunately, we're unable to confirm your registration at this time.
        </p>
        ${reasonText}
        <p style="color:#a0a0a0;font-size:14px;line-height:1.8;margin:0 0 24px;">
          We hope to see you at a future event. Keep an eye on our upcoming events!
        </p>
        <p style="color:#a0a0a0;font-size:13px;margin:0;">
          Questions? Reach us at
          <a href="mailto:${team.email}" style="color:#00b2ff;text-decoration:none;">${team.email}</a>
        </p>`,
    }),
  });
}

export async function sendEventFullEmail(
  registrations: { name: string; email: string }[],
  event: EventInfo,
) {
  for (const reg of registrations) {
    try {
      await sendDeclineEmail(reg, event, "Event capacity reached");
    } catch {
      console.error(`[Event Full Email] Failed for ${reg.email}`);
    }
  }
}

export async function sendTeamNotificationEmail(
  registration: {
    name: string;
    email: string;
    formData: Record<string, string>;
  },
  event: EventInfo,
) {
  const team = getTeam();

  const fieldsHtml = Object.entries(registration.formData)
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding:10px 0;color:#666;font-size:12px;letter-spacing:1px;width:140px;">${key.toUpperCase().replace(/_/g, " ")}</td>
          <td style="padding:10px 0;color:#fff;font-size:14px;">${value || "—"}</td>
        </tr>`,
    )
    .join("");

  await sendEmail({
    to: { email: team.email, name: team.name },
    subject: `New registration — ${event.title}: ${registration.name}`,
    replyTo: { email: registration.email, name: registration.name },
    htmlContent: buildEmailHtml({
      tag: event.title.toUpperCase(),
      heading: "New Registration",
      body: `
        <p style="color:#666;font-size:13px;margin:0 0 28px;">Someone just registered for ${event.title}.</p>
        <div style="border-top:1px solid #333;padding-top:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#666;font-size:12px;letter-spacing:1px;width:140px;">NAME</td>
              <td style="padding:10px 0;color:#fff;font-size:14px;">${registration.name}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#666;font-size:12px;letter-spacing:1px;">EMAIL</td>
              <td style="padding:10px 0;font-size:14px;">
                <a href="mailto:${registration.email}" style="color:#00b2ff;text-decoration:none;">${registration.email}</a>
              </td>
            </tr>
            ${fieldsHtml}
          </table>
        </div>`,
    }),
  });
}
