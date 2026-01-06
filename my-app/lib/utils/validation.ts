import { z } from 'zod';

/**
 * Indian vehicle registration number pattern
 * Format: XX 00 XX 0000 (State Code, District Code, Series, Number)
 * Accepts with or without spaces
 */
export const vehicleNumberSchema = z
    .string()
    .min(1, 'Vehicle number is required')
    // Allow 1-3 digits for district, 1-3 letters for series, 1-4 digits for number
    // Regex: ^[A-Z]{2,3} (State) \s* \d{1,2} (District) \s* [A-Z]{0,3} (Series) \s* \d{1,4} (Number)$
    .regex(
        /^[A-Z]{2,3}\s*\d{1,2}\s*[A-Z]{0,3}\s*\d{1,4}$/i,
        'Invalid vehicle number format. Expected format: KA 01 AB 1234'
    );

/**
 * Driver name validation
 */
export const driverNameSchema = z
    .string()
    .min(2, 'Driver name must be at least 2 characters')
    .max(100, 'Driver name must not exceed 100 characters')
    // Allow letters, numbers, spaces, periods, hyphens, and apostrophes
    .regex(/^[a-zA-Z0-9\s.\-']+$/, 'Driver name contains invalid characters');

/**
 * Area/zone validation
 */
export const areaSchema = z
    .string()
    .min(2, 'Area must be at least 2 characters')
    .max(100, 'Area must not exceed 100 characters');

/**
 * Complete auto form validation schema
 */
export const autoFormSchema = z.object({
    driverName: driverNameSchema,
    vehicleNumber: vehicleNumberSchema,
    area: areaSchema,
});

/**
 * Admin login validation schema
 */
export const adminLoginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AutoFormData = z.infer<typeof autoFormSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
