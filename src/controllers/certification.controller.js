import { Certification, Course, Enrollment, UserCertification, } from "../models/index.js";
import crypto from "crypto";

// GET /api/v1/certifications
export const getCertifications = async (req, res) => {
    try {
        const certifications = await Certification.findAll({
            where: { isActive: true },
            include: [
                {
                    model: Course,
                    as: "course",
                    attributes: [
                        "id",
                        "title",
                        "description",
                        "category",
                        "difficulty",
                        "estimatedHours",
                    ],
                    where: {
                        isPublished: true,
                        providerType: "internal",
                    },
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            count: certifications.length,
            data: certifications,
        });
    } catch (error) {
        console.error("Get certifications error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve certifications.",
        });
    }
};

// POST /api/v1/certifications/issue

export const issueCertificate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.body;

        // Validate course ID
        if (
            !courseId ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(courseId)
        ) {
            return res.status(400).json({
                success: false,
                message: "A valid course ID is required.",
            });
        }

        // Find published course
        const course = await Course.findOne({
            where: {
                id: courseId,
                isPublished: true,
            },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found or not available.",
            });
        }

        // Only internal courses qualify for SkillBridge certificates
        if (course.providerType !== "internal") {
            return res.status(403).json({
                success: false,
                message: "SkillBridge certificates are only available for internal courses.",
            });
        }

        // Check user enrollment
        const enrollment = await Enrollment.findOne({
            where: { userId, courseId },
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "You are not enrolled in this course.",
            });
        }

        // Find active certification
        const certification = await Certification.findOne({
            where: {
                courseId,
                isActive: true,
            },
            include: [
                {
                    model: Course,
                    as: "course",
                    where: { isPublished: true },
                    attributes: ["id", "title"],
                },
            ],
        });

        if (!certification) {
            return res.status(404).json({
                success: false,
                message: "No active certification is available for this course.",
            });
        }

        // Check required learning progress
        if (
            enrollment.progressPercentage <
            certification.completionRequired
        ) {
            return res.status(403).json({
                success: false,
                message: `You need at least ${certification.completionRequired}% course progress to receive this certificate.`,
                data: {
                    currentProgress: enrollment.progressPercentage,
                    requiredProgress: certification.completionRequired,
                },
            });
        }

        // Prevent duplicate certificates
        const existingCertificate = await UserCertification.findOne({
            where: { enrollmentId: enrollment.id },
        });

        if (existingCertificate) {
            return res.status(200).json({
                success: true,
                message: "Certificate has already been issued for this course.",
                data: existingCertificate,
            });
        }

        // Generate unique certificate code
        const certificateCode = `SB-${crypto.randomUUID()
            .replace(/-/g, "")
            .toUpperCase()}`;

        const certificate = await UserCertification.create({
            userId,
            certificationId: certification.id,
            enrollmentId: enrollment.id,
            certificateCode,
        });

        return res.status(201).json({
            success: true,
            message: "Certificate issued successfully.",
            data: certificate,
        });

    } catch (error) {
        console.error("Issue certificate error:", error);

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(200).json({
                success: true,
                message: "A certificate has already been issued for this enrollment.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to issue certificate.",
        });
    }
};


// GET /api/v1/certifications/my-certificates
export const getMyCertificates = async (req, res) => {
    try {
        const certificates = await UserCertification.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Certification,
                    as: "certification",
                    attributes: [
                        "id",
                        "title",
                        "description",
                    ],
                    include: [
                        {
                            model: Course,
                            as: "course",
                            attributes: [
                                "id",
                                "title",
                                "category",
                            ],
                        },
                    ],
                },
            ],
            order: [["issuedAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates,
        });
    } catch (error) {
        console.error("Get my certificates error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve your certificates.",
        });
    }
};

// GET /api/v1/certifications/:id
export const getCertificateById = async (req, res) => {
    try {
        const { id } = req.params;

        const isValidUUID = (value) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

        if (!isValidUUID(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid certificate ID format.",
            });
        }

        const certificate = await UserCertification.findOne({
            where: {
                id,
                userId: req.user.id,
            },
            include: [
                {
                    model: Certification,
                    as: "certification",
                    attributes: ["id", "title", "description"],
                    include: [
                        {
                            model: Course,
                            as: "course",
                            attributes: ["id", "title", "category"],
                        },
                    ],
                },
                {
                    model: Enrollment,
                    as: "enrollment",
                    attributes: ["progressPercentage", "completedAt"],
                },
            ],
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: certificate,
        });
    } catch (error) {
        console.error("Get certificate details error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve certificate details.",
        });
    }
};

// GET /api/v1/certifications/verify/:code
export const verifyCertificate = async (req, res) => {
    try {
        const { code } = req.params;

        if (!code || !/^SB-[A-F0-9]{32}$/.test(code)) {
            return res.status(400).json({
                success: false,
                message: "Invalid certificate verification code.",
            });
        }

        const certificate = await UserCertification.findOne({
            where: { certificateCode: code },
            attributes: [
                "certificateCode",
                "issuedAt",
            ],
            include: [
                {
                    model: Certification,
                    as: "certification",
                    attributes: ["title", "description"],
                    include: [
                        {
                            model: Course,
                            as: "course",
                            attributes: ["title", "category"],
                        },
                    ],
                },
            ],
        });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: "Certificate not found. This certificate could not be verified.",
            });
        }

        return res.status(200).json({
            success: true,
            valid: true,
            message: "Certificate verified successfully.",
            data: certificate,
        });
    } catch (error) {
        console.error("Verify certificate error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify certificate.",
        });
    }
};