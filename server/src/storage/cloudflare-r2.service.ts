import { extname } from 'node:path';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CloudflareR2Service {
  private readonly logger = new Logger(CloudflareR2Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    this.bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? '';
    this.publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL ?? '').replace(
      /\/$/,
      '',
    );

    if (
      !accountId ||
      !accessKeyId ||
      !secretAccessKey ||
      !this.bucket ||
      !this.publicUrl
    ) {
      this.logger.warn(
        'Cloudflare R2 is not fully configured. Property image uploads will fail until env vars are set.',
      );
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId ?? '',
        secretAccessKey: secretAccessKey ?? '',
      },
    });
  }

  buildUniqueFilename(originalName: string): string {
    const extension = extname(originalName).toLowerCase() || '.jpg';
    return `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  }

  buildPropertyImageKey(propertyId: string, filename: string): string {
    return `properties/${propertyId}/${filename}`;
  }

  buildPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  getObjectKeyFromUrl(url: string): string | null {
    if (!url.startsWith(`${this.publicUrl}/`)) {
      return null;
    }
    return url.slice(this.publicUrl.length + 1);
  }

  async uploadObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    this.logger.log(`Uploaded object to R2: ${key}`);
    return this.buildPublicUrl(key);
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    this.logger.log(`Deleted object from R2: ${key}`);
  }
}
