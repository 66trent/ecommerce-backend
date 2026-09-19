import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private ConfigService: ConfigService,
    @InjectPinoLogger(EmailService.name) private readonly Logger: PinoLogger,
  ) {
    this.createTransporter();
  }

  private createTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.ConfigService.get<string>('SMTP_USER'),
        pass: this.ConfigService.get<string>('SMTP_PASS'),
      },
    });

    //Chay o nen, bo qua ket qua de kiem tra ket noi k lam service bi cham.
    void this.verifyConnection();
  }

  //Kiem tra ket noi
  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.Logger.info({ msg: 'email.smtp.connected' });
    } catch (error) {
      this.Logger.error({
        msg: 'email.smtp.connectionFailed',
        error: (error as Error).message,
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || this.ConfigService.get<string>('SMTP_FROM'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = (await this.transporter.sendMail(
        mailOptions,
      )) as unknown as { messageId: string };

      this.Logger.info({
        msg: 'email.sent',
        messageId: info.messageId,
        subject: options.subject,
      });
    } catch (error) {
      this.Logger.error({
        msg: 'email.sendFailed',
        subject: options.subject,
        error: (error as Error).message,
      });
      return false;
    }
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    url: string,
  ): Promise<boolean> {
    const subject = 'Xác thực email';
    const html = `
      <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
          <a href="${url}"
            style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Xác thực email
          </a>
        </div>

        <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>

        <p>Trân trọng,<br>Đội ngũ Ecommerce Store</p>
      </div>
    `;
    return this.sendEmail({
      to,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    url: string,
  ): Promise<boolean> {
    const subject = 'Đặt lại mật khẩu';
    const html = `
        <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center;">
          <a href="${url}"
            style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Đặt lại mật khẩu
          </a>
        </div>

        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <p><strong>Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ.</p>

        <p>Trân trọng,<br>Đội ngũ Ecommerce Store</p>
      </div>
    `;
    return this.sendEmail({
      to,
      subject,
      html,
    });
  }
}
