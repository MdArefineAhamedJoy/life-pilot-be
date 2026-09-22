import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import nodemailer from "nodemailer";

type SmtpConfiguration = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
};

function smtpConfiguration(): SmtpConfiguration | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  const from = process.env.SMTP_FROM?.trim() || user;
  const parsedPort = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);

  if (!host || !user || !password || !from || !Number.isInteger(parsedPort)) {
    return null;
  }

  return { host, port: parsedPort, user, password, from };
}

@Injectable()
export class EmailService {
  ensureConfigured() {
    if (!smtpConfiguration()) {
      throw new ServiceUnavailableException(
        "Email delivery is not configured. Add SMTP settings before requesting a password reset."
      );
    }
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const config = smtpConfiguration();
    if (!config) {
      this.ensureConfigured();
      return;
    }

    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.password },
    });

    await transport.sendMail({
      from: config.from,
      to,
      subject: "Reset your Life Pilot password",
      text: [
        "We received a request to reset your Life Pilot password.",
        "",
        `Reset your password: ${resetUrl}`,
        "",
        "This link expires in 60 minutes. If you did not request this, you can ignore this email.",
      ].join("\n"),
      html: `<p>We received a request to reset your Life Pilot password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 60 minutes. If you did not request this, you can ignore this email.</p>`,
    });
  }
}
