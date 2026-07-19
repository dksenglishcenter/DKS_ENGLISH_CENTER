import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';

export type ContactNotifyPayload = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  courseInterest: string;
  learningNeeds: string | null;
  createdAt: Date;
};

export type CareerNotifyPayload = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  position: string;
  introduction: string | null;
  createdAt: Date;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(value);
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly notifyEmails: string[];
  private readonly mailFrom: string;

  constructor() {
    const host = process.env.SMTP_HOST?.trim();
    const port = Number(process.env.SMTP_PORT ?? '587');
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    const notifyRaw = process.env.NOTIFY_EMAIL?.trim() ?? '';
    this.mailFrom =
      process.env.MAIL_FROM?.trim() ||
      user ||
      'DKS English Center <noreply@dks.local>';
    this.notifyEmails = notifyRaw
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    const enabled = process.env.MAIL_ENABLED !== 'false';
    const secure =
      process.env.SMTP_SECURE === 'true' ||
      process.env.SMTP_SECURE === '1' ||
      port === 465;

    if (!enabled || !host || !user || !pass || this.notifyEmails.length === 0) {
      this.transporter = null;
      this.logger.warn(
        'Mail notify tắt hoặc thiếu cấu hình (SMTP_HOST/USER/PASS, NOTIFY_EMAIL). Form vẫn lưu DB bình thường.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number.isFinite(port) ? port : 587,
      secure,
      auth: { user, pass },
    });
  }

  isConfigured() {
    return this.transporter !== null && this.notifyEmails.length > 0;
  }

  /** Gửi notify; lỗi mail không làm fail API submit. */
  async notifyContactSubmission(payload: ContactNotifyPayload) {
    if (!this.isConfigured() || !this.transporter) return;

    const subject = `[DKS] Liên hệ mới — ${payload.fullName}`;
    const rows = [
      ['Họ tên', payload.fullName],
      ['Điện thoại', payload.phone],
      ['Email', payload.email ?? '(không cung cấp)'],
      ['Khóa học quan tâm', payload.courseInterest],
      ['Nhu cầu học', payload.learningNeeds ?? '(không ghi)'],
      ['Thời gian', formatDateTime(payload.createdAt)],
      ['Mã đơn', payload.id],
    ] as const;

    await this.sendSafe({
      subject,
      text: this.toText('Yêu cầu tư vấn mới từ form Liên hệ', rows),
      html: this.toHtml('Yêu cầu tư vấn mới từ form Liên hệ', rows),
    });
  }

  async notifyCareerApplication(payload: CareerNotifyPayload) {
    if (!this.isConfigured() || !this.transporter) return;

    const subject = `[DKS] Ứng tuyển mới — ${payload.position} — ${payload.fullName}`;
    const rows = [
      ['Họ tên', payload.fullName],
      ['Email', payload.email],
      ['Điện thoại', payload.phone],
      ['Vị trí', payload.position],
      ['Giới thiệu', payload.introduction ?? '(không ghi)'],
      ['Thời gian', formatDateTime(payload.createdAt)],
      ['Mã đơn', payload.id],
    ] as const;

    await this.sendSafe({
      subject,
      text: this.toText('Đơn ứng tuyển mới từ form Tuyển dụng', rows),
      html: this.toHtml('Đơn ứng tuyển mới từ form Tuyển dụng', rows),
    });
  }

  private toText(
    title: string,
    rows: ReadonlyArray<readonly [string, string]>,
  ) {
    return [
      title,
      '',
      ...rows.map(([label, value]) => `${label}: ${value}`),
      '',
      '— DKS English Center',
    ].join('\n');
  }

  private toHtml(
    title: string,
    rows: ReadonlyArray<readonly [string, string]>,
  ) {
    const body = rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#9B6B50;vertical-align:top;white-space:nowrap"><strong>${escapeHtml(label)}</strong></td><td style="padding:6px 0;color:#4A2306">${escapeHtml(value).replaceAll('\n', '<br/>')}</td></tr>`,
      )
      .join('');

    return `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#4A2306">
        <h2 style="margin:0 0 12px;color:#F16522">${escapeHtml(title)}</h2>
        <table style="border-collapse:collapse">${body}</table>
        <p style="margin:16px 0 0;color:#9B6B50;font-size:12px">Email tự động từ hệ thống DKS English Center.</p>
      </div>
    `;
  }

  private async sendSafe(options: {
    subject: string;
    text: string;
    html: string;
  }) {
    try {
      await this.transporter!.sendMail({
        from: this.mailFrom,
        to: this.notifyEmails.join(', '),
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`Đã gửi notify: ${options.subject}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Gửi email notify thất bại: ${message}`);
    }
  }
}
