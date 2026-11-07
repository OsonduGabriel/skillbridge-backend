
import { randomUUID } from "node:crypto";
import { getCloudflareEnv } from "../utils/cloudflare-context.js";

// Get the R2 bucket from the current Cloudflare request.
const getCVBucket = () => {
    const bucket = getCloudflareEnv()?.CV_BUCKET;

    if (!bucket) {
        throw new Error(
            "Cloudflare R2 binding CV_BUCKET is unavailable."
        );
    }

    return bucket;
};

// Prevent directory separators and unsafe characters in filenames.
const sanitizeFilename = (filename) => {
    const safeName = String(filename || "cv")
        .replace(/[\/\\]/g, "_")
        .replace(/[^\w.-]/g, "_")
        .slice(0, 100);

    return safeName || "cv";
};

// Upload a CV buffer to R2.
const uploadCVToR2 = async (file, userId) => {
    if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
        throw new Error("CV file buffer is missing.");
    }

    const bucket = getCVBucket();

    const fileKey =
        `cvs/${userId}/${randomUUID()}-${sanitizeFilename(file.originalname)}`;

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
};

// Retrieve a CV from R2.
const getCVFromR2 = async (fileKey) => {
    const bucket = getCVBucket();
    return bucket.get(fileKey);
};

// Delete a CV from R2.
const deleteCVFromR2 = async (fileKey) => {
    const bucket = getCVBucket();
    return bucket.delete(fileKey);
};

export {
    uploadCVToR2,
    getCVFromR2,
    deleteCVFromR2,
};
