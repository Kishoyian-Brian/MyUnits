const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
  </defs>
  <rect x="4" y="12" width="56" height="56" rx="12" fill="url(#g)"/>
  <path d="M20 48 L32 28 L44 48" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <line x1="26" y1="40" x2="38" y2="40" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
  <text x="72" y="52" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="#1e293b">
    My<tspan fill="#1d4ed8">Units</tspan>
  </text>
</svg>`;

const EMAIL_STYLES = `
  body { font-family: Arial, sans-serif; color: #333; background: #f9f9f9; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { color: white; text-align: center; padding: 24px 20px 12px; }
  .header-title { margin: 12px 0 0; font-size: 22px; font-weight: 600; color: #1e293b; }
  .content { padding: 30px; line-height: 1.6; }
  .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; background: #f8f9fa; }
  .otp-box { background: #f0f4ff; border: 2px dashed #1d4ed8; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center; }
  .otp-code { font-size: 36px; font-weight: bold; color: #1d4ed8; letter-spacing: 8px; font-family: monospace; }
  .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
  a { color: #1d4ed8; }
`;

export function buildEmailHtml(options: {
  title: string;
  body: string;
}): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${EMAIL_STYLES}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${LOGO_SVG}
          <h1 class="header-title">${options.title}</h1>
        </div>
        <div class="content">
          ${options.body}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MyUnits. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
