
const certificationSchema = {
    Certification: {
        type: "object",
        properties: {
            id: { type: "string", format: "uuid" },
            courseId: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string", nullable: true },
            completionRequired: {
                type: "integer",
                minimum: 1,
                maximum: 100,
                example: 100,
            },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },

    UserCertificate: {
        type: "object",
        properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            certificationId: { type: "string", format: "uuid" },
            enrollmentId: { type: "string", format: "uuid" },
            certificateCode: {
                type: "string",
                example: "SB-0123456789ABCDEF0123456789ABCDEF",
            },
            issuedAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
        },
    },

    IssueCertificateRequest: {
        type: "object",
        required: ["courseId"],
        properties: {
            courseId: {
                type: "string",
                format: "uuid",
                example: "550e8400-e29b-41d4-a716-446655440000",
            },
        },
        additionalProperties: false,
    },

    CertificateVerificationResponse: {
        type: "object",
        properties: {
            success: { type: "boolean", example: true },
            valid: { type: "boolean", example: true },
            message: {
                type: "string",
                example: "Certificate verified successfully.",
            },
            data: {
                $ref: "#/components/schemas/UserCertificate",
            },
        },
    },
};

export default certificationSchema;
