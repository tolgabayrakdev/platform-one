import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { BRAND_NAME } from "./email-templates.js";
import logger from "../config/logger.js";

dotenv.config();

/**
 * Profesyonel Email Gönderme Servisi
 * Tüm email'ler bu servis üzerinden gönderilir
 */
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    /**
     * Genel email gönderme metodu
     * @param {string} to - Alıcı e-posta adresi
     * @param {string} subject - E-posta konusu
     * @param {string} html - HTML içerik (template'den gelir)
     * @param {object} options - Ek seçenekler (cc, bcc, attachments, vb.)
     */
    async sendEmail(to, subject, html, options = {}) {
        const mailOptions = {
            from: {
                name: BRAND_NAME,
                address: process.env.EMAIL_USER,
            },
            replyTo: process.env.EMAIL_USER || process.env.EMAIL_REPLY_TO,
            to: Array.isArray(to) ? to.join(", ") : to,
            subject,
            html,
            headers: {
                'X-Entity-Ref-ID': 'diyetka',
                'X-Mailer': `${BRAND_NAME} Email Service`,
                'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
            ...options,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            logger.info("📩 Email sent successfully:", {
                to: Array.isArray(to) ? to.join(", ") : to,
                subject,
                messageId: info.messageId,
            });
            return info;
        } catch (error) {
            logger.error("❌ Failed to send email:", {
                to: Array.isArray(to) ? to.join(", ") : to,
                subject,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Email göndermeyi doğrula (test için)
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger.info("✅ Email server connection verified");
            return true;
        } catch (error) {
            logger.error("❌ Email server connection failed:", error);
            return false;
        }
    }
}

// Singleton instance
const emailService = new EmailService();

/**
 * Backward compatibility için eski fonksiyon
 * Yeni kodlar doğrudan emailService kullanmalı
 */
export async function sendEmail(to, subject, html, options) {
    return emailService.sendEmail(to, subject, html, options);
}

// EmailService'i de export et
export { emailService };
export default emailService;