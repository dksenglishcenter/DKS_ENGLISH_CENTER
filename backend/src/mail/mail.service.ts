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
    // App password Gmail thường có khoảng trắng — bỏ hết trước khi auth
    const pass = process.env.SMTP_PASS?.replace(/\s+/g, '').trim();
    const notifyRaw = process.env.NOTIFY_EMAIL?.trim() ?? '';
    this.mailFrom =
      process.env.MAIL_FROM?.trim() ||
      (user ? `DKS English Center <${user}>` : '') ||
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

    if (!enabled || !host || !user || !pass) {
      this.transporter = null;
      this.logger.warn(
        'Mail tắt hoặc thiếu SMTP_HOST/USER/PASS. Form vẫn lưu DB bình thường.',
      );
      return;
    }

    if (this.notifyEmails.length === 0) {
      this.logger.warn(
        'NOTIFY_EMAIL trống — sẽ không gửi notify admin, vẫn gửi xác nhận cho người nộp form nếu có email.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number.isFinite(port) ? port : 587,
      secure,
      auth: { user, pass },
    });
  }

  isConfigured() {
    return this.transporter !== null;
  }

  /**
   * 1) Notify admin (NOTIFY_EMAIL)
   * 2) Xác nhận tới email người nộp form (nếu có)
   */
  async notifyContactSubmission(payload: ContactNotifyPayload) {
    if (!this.isConfigured() || !this.transporter) return;

    const adminRows = [
      ['Họ tên', payload.fullName],
      ['Điện thoại', payload.phone],
      ['Email', payload.email ?? '(không cung cấp)'],
      ['Khóa học quan tâm', payload.courseInterest],
      ['Nhu cầu học', payload.learningNeeds ?? '(không ghi)'],
      ['Thời gian', formatDateTime(payload.createdAt)],
      ['Mã đơn', payload.id],
    ] as const;

    if (this.notifyEmails.length > 0) {
      await this.sendSafe({
        to: this.notifyEmails.join(', '),
        subject: `[DKS] Liên hệ mới — ${payload.fullName}`,
        text: this.toText('Yêu cầu tư vấn mới từ form Liên hệ', adminRows),
        html: this.toHtml('Yêu cầu tư vấn mới từ form Liên hệ', adminRows),
      });
    }

    if (payload.email) {
      const confirmRows = [
        ['Họ tên', payload.fullName],
        ['Khóa học quan tâm', payload.courseInterest],
        ['Thời gian gửi', formatDateTime(payload.createdAt)],
      ] as const;

      await this.sendSafe({
        to: payload.email,
        subject: 'DKS đã nhận yêu cầu tư vấn của bạn',
        text: [
          `Xin chào ${payload.fullName},`,
          '',
          'DKS English Center đã nhận được yêu cầu tư vấn của bạn.',
          'Chúng tôi sẽ liên hệ sớm nhất có thể.',
          '',
          ...confirmRows.map(([label, value]) => `${label}: ${value}`),
          '',
          'Trân trọng,',
          'DKS English Center',
        ].join('\n'),
        html: `
          <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#4A2306">
            <p>Xin chào <strong>${escapeHtml(payload.fullName)}</strong>,</p>
            <p>DKS English Center đã nhận được yêu cầu tư vấn của bạn. Chúng tôi sẽ liên hệ sớm nhất có thể.</p>
            ${this.toHtmlTable(confirmRows)}
            <p style="margin-top:16px">Trân trọng,<br/>DKS English Center</p>
          </div>
        `,
      });
    }
  }

  async notifyCareerApplication(payload: CareerNotifyPayload) {
    if (!this.isConfigured() || !this.transporter) return;

    const adminRows = [
      ['Họ tên', payload.fullName],
      ['Email', payload.email],
      ['Điện thoại', payload.phone],
      ['Vị trí', payload.position],
      ['Giới thiệu', payload.introduction ?? '(không ghi)'],
      ['Thời gian', formatDateTime(payload.createdAt)],
      ['Mã đơn', payload.id],
    ] as const;

    if (this.notifyEmails.length > 0) {
      await this.sendSafe({
        to: this.notifyEmails.join(', '),
        subject: `[DKS] Ứng tuyển mới — ${payload.position} — ${payload.fullName}`,
        text: this.toText('Đơn ứng tuyển mới từ form Tuyển dụng', adminRows),
        html: this.toHtml('Đơn ứng tuyển mới từ form Tuyển dụng', adminRows),
      });
    }

    const confirmRows = [
      ['Họ tên', payload.fullName],
      ['Vị trí ứng tuyển', payload.position],
      ['Thời gian gửi', formatDateTime(payload.createdAt)],
    ] as const;

    await this.sendSafe({
      to: payload.email,
      subject: `DKS đã nhận đơn ứng tuyển — ${payload.position}`,
      text: [
        `Xin chào ${payload.fullName},`,
        '',
        `DKS English Center đã nhận đơn ứng tuyển vị trí "${payload.position}" của bạn.`,
        'Chúng tôi sẽ phản hồi khi có cập nhật.',
        '',
        ...confirmRows.map(([label, value]) => `${label}: ${value}`),
        '',
        'Trân trọng,',
        'DKS English Center',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#4A2306">
          <p>Xin chào <strong>${escapeHtml(payload.fullName)}</strong>,</p>
          <p>DKS English Center đã nhận đơn ứng tuyển vị trí <strong>${escapeHtml(payload.position)}</strong> của bạn. Chúng tôi sẽ phản hồi khi có cập nhật.</p>
          ${this.toHtmlTable(confirmRows)}
          <p style="margin-top:16px">Trân trọng,<br/>DKS English Center</p>
        </div>
      `,
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

  private toHtmlTable(rows: ReadonlyArray<readonly [string, string]>) {
    const body = rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#9B6B50;vertical-align:top;white-space:nowrap"><strong>${escapeHtml(label)}</strong></td><td style="padding:6px 0;color:#4A2306">${escapeHtml(value).replaceAll('\n', '<br/>')}</td></tr>`,
      )
      .join('');
    return `<table style="border-collapse:collapse">${body}</table>`;
  }

  private toHtml(
    title: string,
    rows: ReadonlyArray<readonly [string, string]>,
  ) {
    return `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#4A2306">
        <h2 style="margin:0 0 12px;color:#F16522">${escapeHtml(title)}</h2>
        ${this.toHtmlTable(rows)}
        <p style="margin:16px 0 0;color:#9B6B50;font-size:12px">Email tự động từ hệ thống DKS English Center.</p>
      </div>
    `;
  }

  private async sendSafe(options: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }) {
    try {
      await this.transporter!.sendMail({
        from: this.mailFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`Đã gửi mail → ${options.to}: ${options.subject}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Gửi email thất bại → ${options.to}: ${message}`,
      );
    }
  }
}
