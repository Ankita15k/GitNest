import { body, param } from 'express-validator';

/**
 * Rejects values that contain HTML tags. Prevents stored XSS in profile
 * fields that are rendered as plain text but may later be displayed in
 * contexts where the encoding layer is missed.
 */
const rejectHtmlTags = (value) => {
    if (/<[a-z][\s\S]*>/i.test(value)) {
        throw new Error('HTML tags are not allowed');
    }
    return true;
};

/**
 * Validates that a URL is a public http/https address. Rejects private and
 * loopback hostnames to prevent SSRF when the server fetches avatar images or
 * previews website URLs on behalf of the user.
 */
const isPublicHttpUrl = (val) => {
    if (val === '') return true;
    let url;
    try {
        url = new URL(val);
    } catch {
        return false;
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname;
    if (
        host === 'localhost' ||
        /^127\./.test(host) ||
        /^10\./.test(host) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
        /^192\.168\./.test(host) ||
        host === '0.0.0.0' ||
        host === '::1'
    ) {
        return false;
    }
    return true;
};

/**
 * Validates the :username route parameter on follow/unfollow and profile
 * lookup routes. Prevents oversized or malformed values from reaching the
 * controller and firing a database query.
 */
export const usernameParamValidator = [
    param('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 1, max: 39 }).withMessage('Username must be 1–39 characters')
        .matches(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$|^[a-zA-Z0-9]$/)
        .withMessage('Username contains invalid characters'),
];

export const updateProfileValidator = [
    body('bio')
        .optional()
        .trim()
        .isString().withMessage('Bio must be a string')
        .isLength({ max: 200 }).withMessage('Bio must be at most 200 characters')
        .custom(rejectHtmlTags),

    body('location')
        .optional()
        .trim()
        .isString().withMessage('Location must be a string')
        .isLength({ max: 100 }).withMessage('Location must be at most 100 characters')
        .custom(rejectHtmlTags),

    body('displayName')
        .optional()
        .trim()
        .isString().withMessage('Display name must be a string')
        .isLength({ max: 50 }).withMessage('Display name must be at most 50 characters')
        .custom(rejectHtmlTags),

    body('company')
        .optional()
        .trim()
        .isString().withMessage('Company must be a string')
        .isLength({ max: 100 }).withMessage('Company must be at most 100 characters')
        .custom(rejectHtmlTags),

    body('twitterHandle')
        .optional()
        .trim()
        .custom((val) => {
            if (val === '') return true;
            return /^[a-zA-Z0-9_]{1,15}$/.test(val);
        })
        .withMessage('Twitter handle must be 1–15 alphanumeric characters or underscores'),

    body('website')
        .optional()
        .trim()
        .custom(isPublicHttpUrl)
        .withMessage('Website must be a valid public http or https URL'),

    body('avatarUrl')
        .optional()
        .trim()
        .custom(isPublicHttpUrl)
        .withMessage('Avatar URL must be a valid public http or https URL'),
];
