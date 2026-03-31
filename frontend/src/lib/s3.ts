import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const REGION      = process.env.AWS_REGION   || 'ap-northeast-1';
const PROD_BUCKET = process.env.S3_BUCKET    || 'terrace-villa-foresta-asama-prod';
const TEST_BUCKET = process.env.S3_BUCKET_TEST || 'terrace-villa-foresta-asama-test';
const CDN         = process.env.CDN_DOMAIN   || 'd143jkdkye8i79.cloudfront.net';

const client = new S3Client({ region: REGION });

function getBucket(isTest = false): string {
  return isTest ? TEST_BUCKET : PROD_BUCKET;
}

export function s3Url(key: string): string {
  return `https://${CDN}/${key}`;
}

// Convert old direct S3 URLs (any bucket) to CloudFront URLs
export function normalizeUrl(url: string): string {
  if (!url) return url;
  const match = url.match(/^https?:\/\/[^/]+\.amazonaws\.com\/(uploads\/.+)$/);
  if (match) return `https://${CDN}/${match[1]}`;
  return url;
}

export async function putS3(
  key: string,
  body: Buffer,
  contentType: string,
  isTest = false,
): Promise<string> {
  await client.send(
    new PutObjectCommand({ Bucket: getBucket(isTest), Key: key, Body: body, ContentType: contentType }),
  );
  return s3Url(key);
}

export async function deleteS3(key: string, isTest = false): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: getBucket(isTest), Key: key }));
}
