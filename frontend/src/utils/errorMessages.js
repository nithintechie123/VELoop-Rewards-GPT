/**
 * Frontend Error Message Converter (Requirements 42 & 43)
 * 
 * Converts machine API error codes and server error payloads into friendly,
 * reassuring, and actionable user messages without revealing internal fraud logic.
 */

export const FriendlyErrorMessages = {
  GIVEAWAY_NOT_FOUND: {
    title: 'Giveaway Not Found',
    message: 'We couldn’t find the giveaway you’re looking for. It may have expired or been removed.',
    action: 'Explore Active Giveaways'
  },
  GIVEAWAY_NOT_ACTIVE: {
    title: 'Giveaway Not Live',
    message: 'This giveaway is not currently active. Check the countdown or check out other live rewards.',
    action: 'View Live Pools'
  },
  GIVEAWAY_ENDED: {
    title: 'This giveaway has ended',
    message: 'Check out the winners and get ready for the next giveaway.',
    action: 'View Winners'
  },
  GIVEAWAY_UPCOMING: {
    title: 'Starting Soon',
    message: 'This giveaway has not started yet. Set a reminder and check back when it goes live!',
    action: 'Set Reminder'
  },
  POOL_CAP_REACHED: {
    title: 'Pool Capacity Full',
    message: 'All available tickets for this giveaway have been claimed. Try entering another active pool!',
    action: 'Find Open Pools'
  },
  ALREADY_PARTICIPATING: {
    title: "You're already participating",
    message: 'You can participate again when a new giveaway event begins.',
    action: 'View My Ticket'
  },
  ALREADY_PARTICIPATED: {
    title: "You're already participating",
    message: 'You can participate again when a new giveaway event begins.',
    action: 'View My Ticket'
  },
  INSUFFICIENT_VE_BALANCE: {
    title: 'Not enough VEs',
    message: 'You need more VEs to join this giveaway.',
    action: 'Earn VEs'
  },
  INSUFFICIENT_SVE_BALANCE: {
    title: 'Not enough SVEs',
    message: 'You need more SVEs to join this giveaway.',
    action: 'Upgrade Tier'
  },
  INSUFFICIENT_TOKEN_BALANCE: {
    title: 'Not enough Tokens',
    message: 'You need more Tokens to join this giveaway.',
    action: 'Claim Daily Tokens'
  },
  INSUFFICIENT_BALANCE: {
    title: 'Not enough VEs',
    message: 'You need more VEs to join this giveaway.',
    action: 'Earn Coins'
  },
  LOGIN_REQUIRED: {
    title: 'Login Required',
    message: 'Please sign in or create an account to participate in reward giveaways and claim prizes.',
    action: 'Sign In'
  },
  UNAUTHORIZED: {
    title: 'Sign In Required',
    message: 'Please sign in to access your tickets, winnings, and prize claim rewards.',
    action: 'Sign In'
  },
  PARTICIPATION_BLOCKED: {
    title: "Participation couldn't be completed",
    message: "We couldn't verify this participation request. Please try again later or contact support if you believe this is an error.",
    action: 'Contact Support'
  },
  SUSPICIOUS_ACTIVITY: {
    title: "Participation couldn't be completed",
    message: "We couldn't verify this participation request. Please try again later or contact support if you believe this is an error.",
    action: 'Contact Support'
  },
  PAYLOAD_TAMPERED: {
    title: "Participation couldn't be completed",
    message: "We couldn't verify this participation request. Please try again later or contact support if you believe this is an error.",
    action: 'Contact Support'
  },
  RATE_LIMITED: {
    title: 'Please Slow Down',
    message: 'You are making requests too quickly. Please wait a few seconds and try again.',
    action: 'Try Again'
  },
  CLAIM_NOT_ALLOWED: {
    title: 'Claim Not Eligible',
    message: 'Only verified winners holding the winning ticket for this giveaway can claim this prize.',
    action: 'Check Winning Status'
  },
  ALREADY_CLAIMED: {
    title: 'Prize Already Claimed',
    message: 'This prize has already been claimed and is currently being processed for delivery.',
    action: 'Track Delivery'
  },
  MISSING_REQUIRED_INFORMATION: {
    title: 'Incomplete Details',
    message: 'Please fill in all mandatory shipping address or delivery email fields to proceed.',
    action: 'Complete Form'
  }
};

/**
 * Convert any API error or error code into a user-friendly object (Requirement 43)
 */
export const getFriendlyErrorMessage = (errorOrCode) => {
  // Catch raw Mongo E11000 duplicate key error string or object
  const errorStr = typeof errorOrCode === 'string' 
    ? errorOrCode 
    : (errorOrCode?.message || errorOrCode?.error || errorOrCode?.response?.data?.message || '');
  
  if (errorStr.includes('E11000') || errorStr.includes('duplicate key') || errorStr.includes('MongoServerError')) {
    return {
      code: 'ALREADY_PARTICIPATING',
      title: "You're already participating",
      message: 'You can participate again when a new giveaway event begins.',
      action: 'View My Ticket'
    };
  }

  const code = typeof errorOrCode === 'string'
    ? errorOrCode
    : (errorOrCode?.code || errorOrCode?.error || errorOrCode?.response?.data?.error || errorOrCode?.response?.data?.code || 'UNKNOWN');

  const details = typeof errorOrCode === 'object' 
    ? (errorOrCode?.details || errorOrCode?.response?.data?.details || errorOrCode?.response?.data) 
    : null;

  // Requirement 43: Dynamic Insufficient balance formatting: "You need 130 more VEs to join this giveaway."
  if (['INSUFFICIENT_VE_BALANCE', 'INSUFFICIENT_SVE_BALANCE', 'INSUFFICIENT_TOKEN_BALANCE', 'INSUFFICIENT_BALANCE'].includes(code)) {
    const diff = details?.difference ?? details?.diff;
    const unit = details?.currencyUnit || (code === 'INSUFFICIENT_SVE_BALANCE' ? 'SVEs' : (code === 'INSUFFICIENT_TOKEN_BALANCE' ? 'Tokens' : 'VEs'));
    const title = `Not enough ${unit}`;
    const message = diff 
      ? `You need ${diff} more ${unit} to join this giveaway.`
      : `You need more ${unit} to join this giveaway.`;

    return {
      code,
      title,
      message,
      action: unit === 'SVEs' ? 'Upgrade Tier' : (unit === 'Tokens' ? 'Claim Daily Tokens' : 'Earn VEs')
    };
  }

  // Requirement 43: Suspicious Activity - Zero fraud logic leakage to user
  if ([
    'SUSPICIOUS_ACTIVITY',
    'PARTICIPATION_BLOCKED',
    'SAME_DEVICE_PARTICIPATION_LIMIT',
    'PAYLOAD_TAMPERED',
    'BURST_RATE_LIMIT_EXCEEDED',
    'RAPID_REQUEST_BURST_BLOCKED'
  ].includes(code)) {
    return {
      code: 'SUSPICIOUS_ACTIVITY',
      title: "Participation couldn't be completed",
      message: "We couldn't verify this participation request. Please try again later or contact support if you believe this is an error.",
      action: 'Contact Support'
    };
  }

  if (FriendlyErrorMessages[code]) {
    return {
      code,
      title: FriendlyErrorMessages[code].title,
      message: FriendlyErrorMessages[code].message,
      action: FriendlyErrorMessages[code].action
    };
  }

  return {
    code: 'GENERAL_ERROR',
    title: 'Notice',
    message: 'An unexpected issue occurred. Please try again or refresh the page.',
    action: 'Refresh'
  };
};
