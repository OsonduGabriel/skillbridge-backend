
import { randomUUID } from "node:crypto";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Create an S3-compatible client for Cloudflare R2.
const getR2Client = () => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 credentials are not configured.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

// Get the configured R2 bucket name.
const getBucketName = () => {
  return process.env.R2_BUCKET_NAME || "skillbridge-cvs";
};

// Prevent directory separators and unsafe filename characters.
const sanitizeFilename = (filename) => {
  const safeName = String(filename || "cv")
    .replace(/[\/\\]/g, "_")
    .replace(/[^\w.-]/g, "_")
    .slice(0, 100);

  return safeName || "cv";
};

// Upload a CV buffer to Cloudflare R2.
const uploadCVToR2 = async (file, userId) => {
  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    throw new Error("CV file buffer is missing.");
  }

  const fileKey =
    `cvs/${userId}/${randomUUID()}-${sanitizeFilename(file.originalname)}`;

  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        userId: String(userId),
        originalName: String(file.originalname),
      },
    })
  );

  return fileKey;
};

// Retrieve a CV from Cloudflare R2.
const getCVFromR2 = async (fileKey) => {
  const client = getR2Client();

  return client.send(
    new GetObjectCommand({
      Bucket: getBucketName(),
      Key: fileKey,
    })
  );
};

// Delete a CV from Cloudflare R2.
const deleteCVFromR2 = async (fileKey) => {
  const client = getR2Client();

  return client.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: fileKey,
    })
  );
};

export {
  uploadCVToR2,
  getCVFromR2,
  deleteCVFromR2,
};
