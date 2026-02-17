const Minio = require('minio');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
});

async function testMinio() {
    console.log('Attempting to connect to MinIO...');
    try {
        const buckets = await minioClient.listBuckets();
        console.log('Successfully connected to MinIO!');
        console.log('Buckets:', buckets.map(b => b.name).join(', '));
        process.exit(0);
    } catch (error) {
        console.error('Error connecting to MinIO:', error);
        process.exit(1);
    }
}

testMinio();
