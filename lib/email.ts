import nodemailer from 'nodemailer';

// Konfigurasi transporter Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // App-specific password, bukan password biasa
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

// Template untuk reset password
export function getResetPasswordTemplate(resetLink: string, name: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Password</h1>
          </div>
          <div class="content">
            <p>Halo ${name},</p>
            <p>Kami menerima permintaan untuk mereset password akun admin Anda. Klik tombol di bawah untuk melanjutkan:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p style="margin-top: 20px; color: #666;">Link ini berlaku selama 1 jam.</p>
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Admin Dashboard. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Template untuk password berhasil direset
export function getPasswordResetSuccessTemplate(name: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Successfully</h1>
          </div>
          <div class="content">
            <p>Halo ${name},</p>
            <p>Password Anda telah berhasil direset. Anda sekarang dapat login dengan password baru Anda.</p>
            <div class="success-badge">✓ Password Updated</div>
            <p style="margin-top: 20px; color: #666;">Jika Anda tidak mereset password, segera ubah password Anda dan hubungi administrator.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Admin Dashboard. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Template untuk invoice
export function getInvoiceTemplate(
  invoiceId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  domainName: string,
  packageName: string,
  templateName: string,
  subtotal: number,
  discount: number,
  total: number,
  isUpgrade: boolean = false,
  priceDifference: number = 0,
  oldPrice: number = 0,
  newPrice: number = 0
) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .invoice-meta { padding: 20px; border-bottom: 2px solid #f0f0f0; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .meta-label { font-weight: bold; color: #666; }
          .meta-value { color: #333; }
          .section { padding: 20px; border-bottom: 1px solid #f0f0f0; }
          .section-title { font-weight: bold; font-size: 14px; color: #667eea; margin-bottom: 15px; text-transform: uppercase; }
          .info-table { width: 100%; border-collapse: collapse; }
          .info-table td { padding: 8px 0; }
          .info-label { color: #666; width: 30%; }
          .pricing-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .pricing-table th { background: #f9f9f9; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold; }
          .pricing-table td { padding: 12px 10px; border-bottom: 1px solid #eee; }
          .pricing-table .amount { text-align: right; font-weight: bold; }
          .total-row { background: #f9f9f9; font-weight: bold; }
          .total-row td { padding: 15px 10px; }
          .highlight-row { background: #e8f4f8; }
          .upgrade-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
          .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #f0f0f0; font-size: 12px; color: #666; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 INVOICE</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Pesan Jasa Website</p>
          </div>

          <div class="invoice-meta">
            <div class="meta-row">
              <span class="meta-label">Invoice ID:</span>
              <span class="meta-value">#${invoiceId}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Tanggal:</span>
              <span class="meta-value">${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            ${isUpgrade ? `<div class="meta-row">
              <span class="meta-label">Status:</span>
              <span><span class="upgrade-badge">✓ UPGRADE PACKAGE</span></span>
            </div>` : ''}
          </div>

          <div class="section">
            <div class="section-title">📍 Informasi Pelanggan</div>
            <table class="info-table">
              <tr>
                <td class="info-label">Nama:</td>
                <td>${customerName}</td>
              </tr>
              <tr>
                <td class="info-label">Email:</td>
                <td>${customerEmail}</td>
              </tr>
              <tr>
                <td class="info-label">Telepon:</td>
                <td>${customerPhone}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">🌐 Layanan & Paket</div>
            <table class="info-table">
              <tr>
                <td class="info-label">Domain:</td>
                <td>${domainName}</td>
              </tr>
              <tr>
                <td class="info-label">Template:</td>
                <td>${templateName}</td>
              </tr>
              <tr>
                <td class="info-label">Paket:</td>
                <td>${packageName}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">💰 Detail Pembayaran</div>
            <table class="pricing-table">
              <thead>
                <tr>
                  <th>Deskripsi</th>
                  <th class="amount">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                ${isUpgrade ? `
                  <tr>
                    <td>Harga Paket Sebelumnya</td>
                    <td class="amount">${formatCurrency(oldPrice)}</td>
                  </tr>
                  <tr class="highlight-row">
                    <td>Harga Paket Baru</td>
                    <td class="amount">${formatCurrency(newPrice)}</td>
                  </tr>
                  <tr>
                    <td><strong>Biaya Tambahan (Upgrade)</strong></td>
                    <td class="amount" style="color: ${priceDifference > 0 ? '#dc2626' : '#10b981'}"><strong>${priceDifference > 0 ? '+' : ''}${formatCurrency(priceDifference)}</strong></td>
                  </tr>
                ` : `
                  <tr>
                    <td>Subtotal</td>
                    <td class="amount">${formatCurrency(subtotal)}</td>
                  </tr>
                  ${discount > 0 ? `
                    <tr>
                      <td>Diskon</td>
                      <td class="amount" style="color: #10b981;">-${formatCurrency(discount)}</td>
                    </tr>
                  ` : ''}
                `}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td>TOTAL PEMBAYARAN</td>
                  <td class="amount">${formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="section">
            <p style="text-align: center; color: #666; margin: 20px 0;">
              ${isUpgrade ? 'Paket Anda telah berhasil di-upgrade!' : 'Terima kasih atas pesanan Anda!'}
            </p>
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://pesanjasa.com'}/client/dashboard/invoices" class="button">Lihat Invoice Lengkap</a>
            </p>
          </div>

          <div class="footer">
            <p style="margin: 10px 0;">📧 Hubungi kami: support@pesanjasa.com</p>
            <p style="margin: 10px 0;">&copy; 2026 Pesan Jasa Website. All rights reserved.</p>
            <p style="margin: 10px 0; color: #999; font-size: 11px;">Invoice ini telah digenerate secara otomatis. Simpan email ini untuk referensi Anda.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
