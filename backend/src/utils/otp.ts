import crypto from 'crypto';

/**
 * Generates a cryptographically secure 4-digit numeric OTP (1000 - 9999).
 */
export const generateDeliveryOtp = (): string => {
  const num = crypto.randomInt(1000, 10000);
  return num.toString();
};
