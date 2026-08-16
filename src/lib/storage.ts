import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.S3_BUCKET || "doc-images";
const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "us-east-1",
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY || "", secretAccessKey: process.env.S3_SECRET_KEY || "" },
});

export async function uploadImage(file: File) {
  const key = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: file.type }));
  const publicBase = process.env.S3_PUBLIC_URL || `${process.env.S3_ENDPOINT}/${bucket}`;
  return `${publicBase.replace(/\/$/, "")}/${key}`;
}
