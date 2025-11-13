import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import {
  EmailMessage,
  EmailSendResult,
  EmailTemplate,
} from './interfaces/email.interface';
import { requireEnv, requireEnvInt } from '../common/utils/env.util';

/**
 * Email Service
 * Handles sending emails using Nodemailer + Handlebars templates
 *
 * Features:
 * - SMTP configuration from env vars
 * - Handlebars template rendering
 * - HTML email support
 * - Attachment support
 * - Error handling and logging
 *
 * Standards (CLAUDE.md):
 * - Max 40 lines per method
 * - No fallback defaults for env vars
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private templateCache: Map<EmailTemplate, HandlebarsTemplateDelegate>;

  // Environment variables cached as class properties (validated once at startup)
  private readonly smtpHost: string;
  private readonly smtpPort: number;
  private readonly smtpSecure: boolean;
  private readonly smtpUser: string;
  private readonly smtpPassword: string;
  private readonly smtpFromEmail: string;
  private readonly smtpFromName: string;

  constructor() {
    // Load and validate env vars once at startup
    this.smtpHost = requireEnv('SMTP_HOST');
    this.smtpPort = requireEnvInt('SMTP_PORT');
    this.smtpSecure = process.env.SMTP_SECURE === 'true'; // Optional boolean
    this.smtpUser = requireEnv('SMTP_USER');
    this.smtpPassword = requireEnv('SMTP_PASSWORD');
    this.smtpFromEmail = requireEnv('SMTP_FROM_EMAIL');
    this.smtpFromName = requireEnv('SMTP_FROM_NAME');

    this.transporter = this.createTransporter();
    this.templateCache = new Map();
  }

  /**
   * Create Nodemailer transporter using validated class properties
   */
  private createTransporter(): Transporter {
    return nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpSecure, // true for 465, false for 587
      auth: {
        user: this.smtpUser,
        pass: this.smtpPassword,
      },
    });
  }

  /**
   * Send email using template
   * @param message Email message with template and context
   * @returns Send result with success status
   */
  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    try {
      const html = await this.renderTemplate(message.template, message.context);

      const mailOptions = {
        from: message.from || this.getDefaultFrom(),
        to: message.to,
        subject: message.subject,
        html,
        cc: message.cc,
        bcc: message.bcc,
        attachments: message.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Email sent successfully: ${message.template} to ${message.to}`,
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send email: ${message.template} to ${message.to}`,
        error,
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Render Handlebars template with context
   */
  private async renderTemplate(
    templateName: EmailTemplate,
    context: Record<string, any>,
  ): Promise<string> {
    const template = await this.getTemplate(templateName);
    return template(context);
  }

  /**
   * Get compiled Handlebars template (with caching)
   */
  private async getTemplate(
    templateName: EmailTemplate,
  ): Promise<HandlebarsTemplateDelegate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    // Load and compile template
    const templatePath = this.getTemplatePath(templateName);
    const templateSource = await fs.promises.readFile(templatePath, 'utf-8');
    const compiled = handlebars.compile(templateSource);

    // Cache for future use
    this.templateCache.set(templateName, compiled);

    return compiled;
  }

  /**
   * Get template file path
   */
  private getTemplatePath(templateName: EmailTemplate): string {
    return path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );
  }

  /**
   * Get default 'from' address from validated class properties
   */
  private getDefaultFrom(): string {
    return `${this.smtpFromName} <${this.smtpFromEmail}>`;
  }

  /**
   * Verify SMTP connection (useful for health checks)
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection failed', error);
      return false;
    }
  }
}
