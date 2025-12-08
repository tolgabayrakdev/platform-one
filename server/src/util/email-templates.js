export const BRAND_NAME = 'PlatformOne';

/**
 * Hoş geldin email template'i
 */
export function getWelcomeEmailTemplate(firstName) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .welcome { font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="welcome">Hoş Geldiniz!</div>
                <p>Merhaba ${firstName},</p>
                <p>${BRAND_NAME} platformuna kaydınız başarıyla oluşturuldu.</p>
                <p>Hesabınızı aktif etmek için giriş yaparak e-posta ve telefon doğrulamasını tamamlamanız gerekmektedir.</p>
                <p>Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin.</p>
                <p>Saygılarımızla,<br>${BRAND_NAME} Ekibi</p>
            </div>
        </body>
        </html>
    `;
}

/**
 * Email doğrulama kodu template'i
 */
export function getEmailVerificationTemplate(code) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .code { font-size: 32px; font-weight: bold; text-align: center; 
                        letter-spacing: 8px; color: #2563eb; padding: 20px; 
                        background: #f3f4f6; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>E-posta Doğrulama Kodu</h2>
                <p>Merhaba,</p>
                <p>E-posta adresinizi doğrulamak için aşağıdaki kodu kullanın:</p>
                <div class="code">${code}</div>
                <p>Bu kod 90 saniye geçerlidir.</p>
                <p>Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
                <p>Saygılarımızla,<br>${BRAND_NAME} Ekibi</p>
            </div>
        </body>
        </html>
    `;
}
