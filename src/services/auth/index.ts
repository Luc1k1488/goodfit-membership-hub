
// Export all auth service modules from a single entry point
import { sendOTP, verifyOTPCode, isEmail, formatPhoneNumber } from './otpService';
import { getUserOrCreate, getCurrentUserSession } from './userService';
import { logoutUser } from './authUtils';

export {
  sendOTP,
  verifyOTPCode,
  isEmail,
  formatPhoneNumber,
  getUserOrCreate,
  getCurrentUserSession,
  logoutUser
};
