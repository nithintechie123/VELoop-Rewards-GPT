/**
 * Standardized Meaningful Error Codes (Requirement 42)
 * 
 * Provides centralized error definitions across the entire VELoop platform
 * allowing clients and frontend interfaces to convert exact machine codes
 * into friendly, contextual user messages.
 */

export const ErrorCodes = {
  // Giveaway Lifecycle & State
  GIVEAWAY_NOT_FOUND: 'GIVEAWAY_NOT_FOUND',
  GIVEAWAY_NOT_ACTIVE: 'GIVEAWAY_NOT_ACTIVE',
  GIVEAWAY_ENDED: 'GIVEAWAY_ENDED',
  GIVEAWAY_UPCOMING: 'GIVEAWAY_UPCOMING',
  POOL_CAP_REACHED: 'POOL_CAP_REACHED',

  // Participation & Entry
  ALREADY_PARTICIPATING: 'ALREADY_PARTICIPATING',
  ALREADY_PARTICIPATED: 'ALREADY_PARTICIPATING',
  PARTICIPATION_BLOCKED: 'PARTICIPATION_BLOCKED',
  SAME_DEVICE_PARTICIPATION_LIMIT: 'PARTICIPATION_BLOCKED',

  // Currency & Wallet Balances
  INSUFFICIENT_VE_BALANCE: 'INSUFFICIENT_VE_BALANCE',
  INSUFFICIENT_SVE_BALANCE: 'INSUFFICIENT_SVE_BALANCE',
  INSUFFICIENT_TOKEN_BALANCE: 'INSUFFICIENT_TOKEN_BALANCE',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',

  // Authentication & Security
  LOGIN_REQUIRED: 'LOGIN_REQUIRED',
  UNAUTHORIZED: 'LOGIN_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMITED: 'RATE_LIMITED',

  // Prize Claiming & Integrity
  CLAIM_NOT_ALLOWED: 'CLAIM_NOT_ALLOWED',
  FORBIDDEN_CLAIM: 'CLAIM_NOT_ALLOWED',
  ALREADY_CLAIMED: 'ALREADY_CLAIMED',
  MISSING_REQUIRED_INFORMATION: 'MISSING_REQUIRED_INFORMATION'
};

/**
 * Friendly User Message Catalog
 */
export const FriendlyErrorMessages = {
  GIVEAWAY_NOT_FOUND: 'We couldn’t find the giveaway you’re looking for. It may have been removed or moved.',
  GIVEAWAY_NOT_ACTIVE: 'This giveaway is not currently active. Check the start date or explore other active pools.',
  GIVEAWAY_ENDED: 'Check out the winners and get ready for the next giveaway.',
  GIVEAWAY_UPCOMING: 'This giveaway has not started yet. Please check back when the countdown finishes!',
  POOL_CAP_REACHED: 'This giveaway ticket pool has reached maximum capacity.',
  ALREADY_PARTICIPATING: 'You can participate again when a new giveaway event begins.',
  PARTICIPATION_BLOCKED: "We couldn't verify this participation request. Please try again later or contact support if you believe this is an error.",
  INSUFFICIENT_VE_BALANCE: 'You need more VEs to join this giveaway.',
  INSUFFICIENT_SVE_BALANCE: 'You need more SVEs to join this giveaway.',
  INSUFFICIENT_TOKEN_BALANCE: 'You need more Tokens to join this giveaway.',
  INSUFFICIENT_BALANCE: 'You need more coins to join this giveaway.',
  LOGIN_REQUIRED: 'Please log in or create an account to participate in giveaways and claim prizes.',
  SUSPICIOUS_ACTIVITY: "We couldn't verify this participation request. Please try again later or contact support if you believe this is an error.",
  RATE_LIMITED: 'You are making requests too quickly. Please slow down and try again in a few moments.',
  CLAIM_NOT_ALLOWED: 'You are not eligible to claim this prize. Only verified winning tickets can submit claims.',
  ALREADY_CLAIMED: 'This prize has already been claimed and is in fulfillment processing.',
  MISSING_REQUIRED_INFORMATION: 'Please provide all required shipping or delivery details to complete your claim.'
};

/**
 * Formats a standardized error object
 */
export const createApiError = (code, customMessage = null, status = 400, details = null) => {
  const message = customMessage || FriendlyErrorMessages[code] || 'An unexpected error occurred.';
  const error = new Error(message);
  error.code = code;
  error.status = status;
  if (details) error.details = details;
  return error;
};
