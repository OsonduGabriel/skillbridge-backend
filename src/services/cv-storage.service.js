
import { randomUUID } from "node:crypto";
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { getCloudflareEnv } from "../utils/cloudflare-context.js";

// Reuse the S3 client across local requests.
let s3Client;

// Detect whether the application is running inside Cloudflare.
const getCVBucket = () => {
    return getCloudflareEnv()?.CV_BUCKET || null;
};

// Initialize the local Node.js S3 client.
const getS3Client = () => {
    if (s3Client) return s3Client;

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    const endpoint =
        process.env.R2_ENDPOINT ||
        `https://${accountId}.r2.cloudflarestorage.com`;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error("Missing Cloudflare R2 S3 credentials.");
    }

    s3Client = new S3Client({
        region: "auto",
        endpoint,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });

    return s3Client;
};

// Get the bucket name for local Node.js.
const getBucketName = () => {
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!bucketName) {
        throw new Error("Missing R2_BUCKET_NAME environment variable.");
    }

    return bucketName;
};

// Sanitize uploaded filenames.
const sanitizeFilename = (filename) => {
    const safeName = String(filename || "cv")
        .replace(/[\/\\]/g, "_")
        .replace(/[^\w.-]/g, "_")
        .slice(0, 100);

    return safeName || "cv";
};

// Upload a CV to Cloudflare R2.
const uploadCVToR2 = async (file, userId) => {
    if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
        throw new Error("CV file buffer is missing.");
    }

    const fileKey =
        `cvs/${userId}/${randomUUID()}-${sanitizeFilename(file.originalname)}`;

    const bucket = getCVBucket();

    // Cloudflare Worker upload.
    if (bucket) {
        await bucket.put(fileKey, file.buffer, {
            httpMetadata: {
                contentType: file.mimetype,
            },
            customMetadata: {
                userId: String(userId),
                originalName: String(file.originalname),
            },
        });

        return fileKey;
    }

    // Local Node.js upload.
    const client = getS3Client();

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
    const bucket = getCVBucket();

    // Cloudflare Worker download.
    if (bucket) {
        return bucket.get(fileKey);
    }

    // Local Node.js download.
    const client = getS3Client();

    const response = await client.send(
        new GetObjectCommand({
            Bucket: getBucketName(),
            Key: fileKey,
        })
    );

    if (!response.Body) {
        throw new Error("CV file was not found in R2.");
    }

    // Normalize AWS SDK response to match Cloudflare R2.
    return {
        arrayBuffer: async () => {
            const bytes = await response.Body.transformToByteArray();

            return bytes.buffer.slice(
                bytes.byteOffset,
                bytes.byteOffset + bytes.byteLength
            );
        },
        httpMetadata: {
            contentType: response.ContentType,
        },
    };
};

// Delete a CV from Cloudflare R2.
const deleteCVFromR2 = async (fileKey) => {
    const bucket = getCVBucket();

    // Cloudflare Worker delete.
    if (bucket) {
        return bucket.delete(fileKey);
    }

    // Local Node.js delete.
    const client = getS3Client();

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
