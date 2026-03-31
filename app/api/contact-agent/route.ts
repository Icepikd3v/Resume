import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  website?: string;
  formStartedAt?: number;
};

function isEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function escapeHtml(input: string) {
  return input.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export async function POST(req: Request) {
  const body = (await req.json()) as ContactPayload;
  const ip = getClientIp(req);

  const perWindow = Number(process.env.CONTACT_AGENT_RATE_LIMIT_PER_WINDOW || 5);
  const windowMs = Number(process.env.CONTACT_AGENT_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
  const limit = await checkRateLimit(`contact:${ip}`, perWindow, windowMs);

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many contact requests. Please wait and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000))
        }
      }
    );
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const website = String(body.website || "").trim();
  const formStartedAt = Number(body.formStartedAt || 0);

  if (website) {
    return NextResponse.json({ ok: true, message: "Message submitted." });
  }

  const minFillMs = Number(process.env.CONTACT_AGENT_MIN_FILL_MS || 3000);
  const elapsedMs = formStartedAt > 0 ? Date.now() - formStartedAt : Number.POSITIVE_INFINITY;
  if (elapsedMs < minFillMs) {
    return NextResponse.json({ ok: false, error: "Please review your message and try again." }, { status: 400 });
  }

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ ok: false, error: "All fields are required." }, { status: 400 });
  }

  if (name.length > 120 || email.length > 160 || subject.length > 180 || message.length > 6000) {
    return NextResponse.json({ ok: false, error: "One or more fields are too long." }, { status: 400 });
  }

  if (!isEmail(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  const urlCount = (message.match(/https?:\/\//gi) || []).length;
  if (urlCount > 3) {
    return NextResponse.json({ ok: false, error: "Message has too many links." }, { status: 400 });
  }

  const toEmail = process.env.CONTACT_AGENT_TO_EMAIL || "sam.d3v.35@gmail.com";
  const smtpUser = process.env.CONTACT_AGENT_SMTP_USER;
  const smtpPass = process.env.CONTACT_AGENT_SMTP_PASS;
  const smtpHost = process.env.CONTACT_AGENT_SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.CONTACT_AGENT_SMTP_PORT || 465);
  const smtpSecure = process.env.CONTACT_AGENT_SMTP_SECURE === "false" ? false : smtpPort === 465;
  const fromEmail = process.env.CONTACT_AGENT_FROM_EMAIL || smtpUser || toEmail;

  if (!smtpUser || !smtpPass) {
    return NextResponse.json(
      {
        ok: false,
        error: "Contact agent is not configured. Missing SMTP credentials in environment variables."
      },
      { status: 500 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const sentAt = new Date().toISOString();

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      replyTo: `${name} <${email}>`,
      subject: `[Resume Contact Agent] ${subject}`,
      text: [
        "New resume-site contact request",
        `Submitted at: ${sentAt}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        `IP: ${ip}`,
        "",
        "Message:",
        message
      ].join("\n"),
      html: `
        <h2>New resume-site contact request</h2>
        <p><strong>Submitted at:</strong> ${sentAt}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>IP:</strong> ${ip}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(message)}</pre>
      `
    });

    return NextResponse.json({ ok: true, message: "Message sent successfully." });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Message could not be sent right now. Please try again later."
      },
      { status: 500 }
    );
  }
}
