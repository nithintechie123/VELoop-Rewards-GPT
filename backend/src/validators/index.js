export const validateParticipationInput = (data) => {
  const errors = [];
  if (!data) {
    errors.push('Request body cannot be empty');
    return { isValid: false, errors };
  }

  const { entryType, ticketCount } = data;

  if (entryType && !['free', 'paid'].includes(entryType)) {
    errors.push('entryType must be either "free" or "paid"');
  }

  if (ticketCount !== undefined) {
    const num = Number(ticketCount);
    if (!Number.isInteger(num) || num <= 0) {
      errors.push('ticketCount must be a positive integer');
    }
    if (num > 1000) {
      errors.push('ticketCount cannot exceed 1000 per request');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateClaimInput = (data) => {
  const errors = [];
  if (!data) {
    errors.push('Claim details are required');
    return { isValid: false, errors };
  }

  const { prizeType, fullName, phoneNumber, address, city, state, pin } = data;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('Valid recipient full name is required');
  }

  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim().length < 7) {
    errors.push('Valid contact phone number is required');
  }

  // If physical prize, address is mandatory
  if (prizeType === 'PHYSICAL' || !prizeType) {
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      errors.push('Delivery address is required for physical prizes');
    }
    if (!city || typeof city !== 'string') {
      errors.push('City is required');
    }
    if (!state || typeof state !== 'string') {
      errors.push('State is required');
    }
    if (!pin || typeof pin !== 'string') {
      errors.push('Postal/PIN code is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLoginInput = (data) => {
  const errors = [];
  if (!data) {
    errors.push('Credentials required');
    return { isValid: false, errors };
  }

  const { email, password } = data;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    errors.push('Valid email is required');
  }
  if (!password || typeof password !== 'string' || password.length < 4) {
    errors.push('Password must be at least 4 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
