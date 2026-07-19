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
      service: 'gmail',
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
    ] as const;

    if (this.notifyEmails.length > 0) {
      await this.sendSafe({
        to: this.notifyEmails.join(', '),
        subject: `[DKS] Liên hệ mới — ${payload.fullName}`,
        text: this.toAdminText('Yêu cầu tư vấn mới từ form Liên hệ', adminRows),
        html: this.toAdminHtml('Yêu cầu tư vấn mới từ form Liên hệ', adminRows),
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
          'Cảm ơn bạn đã quan tâm. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.',
          '',
          ...confirmRows.map(([label, value]) => `${label}: ${value}`),
          '',
          'Trân trọng,',
          'DKS English Center',
        ].join('\n'),
        html: `
          <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#000000">
            <p style="color:#000000">Xin chào <strong>${escapeHtml(payload.fullName)}</strong>,</p>
            <p style="color:#000000">DKS English Center đã nhận được yêu cầu tư vấn của bạn.</p>
            ${this.toHtmlTable(confirmRows)}
            <p style="margin:16px 0 0;color:#000000">Cảm ơn bạn đã quan tâm. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.</p>
            <p style="margin-top:16px;color:#000000">Trân trọng,<br/>DKS English Center</p>
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
    ] as const;

    if (this.notifyEmails.length > 0) {
      await this.sendSafe({
        to: this.notifyEmails.join(', '),
        subject: `[DKS] Ứng tuyển mới — ${payload.position} — ${payload.fullName}`,
        text: this.toAdminText('Đơn ứng tuyển mới từ form Tuyển dụng', adminRows),
        html: this.toAdminHtml('Đơn ứng tuyển mới từ form Tuyển dụng', adminRows),
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
        'Cảm ơn bạn đã quan tâm. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.',
        '',
        ...confirmRows.map(([label, value]) => `${label}: ${value}`),
        '',
        'Trân trọng,',
        'DKS English Center',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#000000">
          <p style="color:#000000">Xin chào <strong>${escapeHtml(payload.fullName)}</strong>,</p>
          <p style="color:#000000">DKS English Center đã nhận đơn ứng tuyển vị trí <strong>${escapeHtml(payload.position)}</strong> của bạn.</p>
          ${this.toHtmlTable(confirmRows)}
          <p style="margin:16px 0 0;color:#000000">Cảm ơn bạn đã quan tâm. Chúng tôi sẽ liên hệ trong thời gian sớm nhất.</p>
          <p style="margin-top:16px;color:#000000">Trân trọng,<br/>DKS English Center</p>
        </div>
      `,
    });
  }

  private toAdminText(
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

  private toAdminHtml(
    title: string,
    rows: ReadonlyArray<readonly [string, string]>,
  ) {
    return `
      <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#000000">
        <h2 style="margin:0 0 12px;color:#000000">${escapeHtml(title)}</h2>
        ${this.toHtmlTable(rows)}
      </div>
    `;
  }

  private toHtmlTable(rows: ReadonlyArray<readonly [string, string]>) {
    const body = rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#000000;vertical-align:top;white-space:nowrap"><strong>${escapeHtml(label)}</strong></td><td style="padding:6px 0;color:#000000">${escapeHtml(value).replaceAll('\n', '<br/>')}</td></tr>`,
      )
      .join('');
    return `<table style="border-collapse:collapse">${body}</table>`;
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

  /** Hướng dẫn quên mật khẩu: liên hệ Zalo trung tâm để được cấp lại. */
  async sendForgotPasswordHelp(to: string, fullName?: string | null) {
    if (!this.isConfigured() || !this.transporter) return;

    const zaloUrl =
      process.env.ZALO_CONTACT_URL?.trim() || 'https://zalo.me/0834513456';
    const zaloPhone =
      process.env.ZALO_CONTACT_PHONE?.trim() || '0834513456';
    const name = fullName?.trim() || 'bạn';

    await this.sendSafe({
      to,
      subject: 'DKS — Hướng dẫn lấy lại mật khẩu',
      text: [
        `Xin chào ${name},`,
        '',
        'Bạn (hoặc ai đó) vừa yêu cầu lấy lại mật khẩu tài khoản DKS English Center.',
        '',
        'Để được cấp lại mật khẩu, vui lòng liên hệ Zalo trung tâm:',
        `- Zalo: DKS English Center`,
        `- SĐT / Zalo: ${zaloPhone}`,
        `- Link: ${zaloUrl}`,
        '',
        'Nhắn tin kèm email tài khoản của bạn để được hỗ trợ.',
        '',
        'Nếu bạn không yêu cầu, hãy bỏ qua email này.',
        '',
        'Trân trọng,',
        'DKS English Center',
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#000000">
          <p style="color:#000000">Xin chào <strong>${escapeHtml(name)}</strong>,</p>
          <p style="color:#000000">Bạn (hoặc ai đó) vừa yêu cầu lấy lại mật khẩu tài khoản DKS English Center.</p>
          <p style="color:#000000"><strong>Để được cấp lại mật khẩu, vui lòng liên hệ Zalo trung tâm:</strong></p>
          <ul style="color:#000000">
            <li>Zalo: <strong>DKS English Center</strong></li>
            <li>SĐT / Zalo: <strong>${escapeHtml(zaloPhone)}</strong></li>
            <li>Link: <a href="${escapeHtml(zaloUrl)}" style="color:#000000">${escapeHtml(zaloUrl)}</a></li>
          </ul>
          <p style="color:#000000">Nhắn tin kèm <strong>email tài khoản</strong> của bạn để được hỗ trợ.</p>
          <p style="color:#000000">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
          <p style="color:#000000">Trân trọng,<br/>DKS English Center</p>
        </div>
      `,
    });
  }
}
