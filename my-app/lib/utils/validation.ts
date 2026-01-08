import { z } from 'zod';

/**
 * Relaxed Vehicle Number Schema
 * Accepts any string as long as it's not empty
 */
export const vehicleNumberSchema = z
    .string()
    .min(1, 'Vehicle number is required');

/**
 * Relaxed Driver Name Schema
 */
export const driverNameSchema = z
    .string()
    .min(1, 'Driver name is required');

/**
 * Area/zone validation - (Deprecated/Unused but kept for type safety if needed temporarily)
 */
export const areaSchema = z.string().optional();

/**
 * Relaxed Auto Form Schema
 * Minimal constraints to allow flexible data entry
 */
export const autoFormSchema = z.object({
    driverName: driverNameSchema,
    vehicleNumber: vehicleNumberSchema,
    // Professional Details - Relaxed
    licenseNumber: z.string().min(1, 'License number is required'),
    driverAddress: z.string().min(1, 'Address is required'),
    driverPhone: z.string().min(1, 'Phone number is required'),
    // Optional
    bloodGroup: z.string().optional(),
    emergencyContact: z.string().optional(),
    status: z.enum(['Active', 'Suspended', 'Pending']).default('Active'),
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
