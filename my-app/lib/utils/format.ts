/**
 * Format vehicle number with spaces for better readability
 * Example: "KA01AB1234" → "KA 01 AB 1234"
 */
export function formatVehicleNumber(vehicleNumber: string): string {
    // Remove existing spaces
    const cleaned = vehicleNumber.replace(/\s/g, '').toUpperCase();

    // Indian vehicle number format: XX 00 XX 0000
    const match = cleaned.match(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{4})$/);

    if (match) {
        return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }

    // Return original if doesn't match pattern
    return vehicleNumber.toUpperCase();
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeName(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
