import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'avanyaa-images';

export async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
    }
    // Always set public read policy (fixes existing buckets that were created without it)
    const policyStr = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    });
    await minioClient.setBucketPolicy(BUCKET_NAME, policyStr);
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}

export async function uploadImage(file: File): Promise<string> {
  await ensureBucketExists();
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  
  await minioClient.putObject(BUCKET_NAME, fileName, buffer, buffer.length, {
    'Content-Type': file.type,
  });

  // Public URL for browser (omit port for standard 80/443 so images load)
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const portNum = parseInt(process.env.MINIO_PORT || '0', 10);
  const omitPort = (protocol === 'https' && portNum === 443) || (protocol === 'http' && portNum === 80) || !portNum;
  const portSuffix = omitPort ? '' : `:${process.env.MINIO_PORT}`;
  const baseUrl = `${protocol}://${process.env.MINIO_ENDPOINT}${portSuffix}`;
  return `${baseUrl}/${BUCKET_NAME}/${fileName}`;
}

export async function deleteImage(imageUrl: string) {
  try {
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      await minioClient.removeObject(BUCKET_NAME, fileName);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

export { minioClient, BUCKET_NAME };
