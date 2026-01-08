const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_AUTO_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_SEARCH_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
}

export function validateImageType(contentType: string): ImageValidationResult {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType.toLowerCase())) {
        return {
            valid: false,
            error: `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
        };
    }
    return { valid: true };
}

export function validateImageSize(
    size: number,
    type: 'auto' | 'search' = 'auto'
): ImageValidationResult {
    const maxSize = type === 'auto' ? MAX_AUTO_IMAGE_SIZE : MAX_SEARCH_IMAGE_SIZE;

    if (size > maxSize) {
        return {
            valid: false,
            error: `Image size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
        };
    }
    return { valid: true };
}

export function validateImage(
    contentType: string,
    size: number,
    type: 'auto' | 'search' = 'auto'
): ImageValidationResult {
    const typeValidation = validateImageType(contentType);
    if (!typeValidation.valid) return typeValidation;

    const sizeValidation = validateImageSize(size, type);
    if (!sizeValidation.valid) return sizeValidation;

    return { valid: true };
}
