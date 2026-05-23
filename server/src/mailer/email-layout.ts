import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const LOGO_CID = 'myunits-logo';

const LOGO_CANDIDATE_PATHS = [
  join(process.cwd(), 'Assets', 'logo.png'),
  join(__dirname, '..', '..', 'Assets', 'logo.png'),
];

export function resolveLogoPath(): string | null {
  return LOGO_CANDIDATE_PATHS.find((path) => existsSync(path)) ?? null;
}

export function getLogoAttachment() {
  const logoPath = resolveLogoPath();
  if (!logoPath) {
    return null;
  }

  return {
    filename: 'logo.png',
    path: logoPath,
    cid: LOGO_CID,
  };
}

const EMAIL_STYLES = `
  body { font-family: Arial, sans-serif; color: #333; background: #f9f9f9; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { color: white;  text-align: center; }
  .logo { width: 320px; max-width: 90%; height: auto; display: block; margin: 0 auto 20px; }
  .header-title { margin: 0; font-size: 22px; font-weight: 600; }
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
  includeLogo: boolean;
}): string {
  const logoBlock = options.includeLogo
    ? `<img src="cid:${LOGO_CID}" alt="MyUnits" class="logo" />`
    : '';

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
          ${logoBlock}
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
