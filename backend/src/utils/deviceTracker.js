import crypto from 'crypto';

const SYSTEM_SALT = process.env.DEVICE_SALT || 'veloop_privacy_device_salt_2026_secure';

export class DeviceTracker {
  /**
   * Anonymizes IP address to subnet-level to eliminate personal IP storage
   * e.g., 198.51.100.42 -> 198.51.100.0/24
   */
  static anonymizeIp(ip) {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      return '127.0.0.0/24';
    }
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
      }
    }
    if (ip.includes(':')) {
      const parts = ip.split(':');
      return `${parts.slice(0, 3).join(':')}::/48`;
    }
    return '0.0.0.0/24';
  }

  /**
   * Generates a privacy-conscious, one-way cryptographically secure deviceHash.
   * Compiles ambient request signals and produces a fixed-length SHA-256 digest.
   * No raw device identifiers, serials, or personally identifiable hardware data are stored.
   */
  static generateDeviceHash(req = {}) {
    // If client supplied a pre-computed client hash/id, incorporate it
    const clientProvidedHash = 
      req.headers?.['x-device-hash'] || 
      req.headers?.['x-device-id'] || 
      req.body?.deviceHash || 
      '';

    const userAgent = req.headers?.['user-agent'] || req.userAgent || 'generic-agent';
    const acceptLanguage = req.headers?.['accept-language'] || 'en';
    const secChUa = req.headers?.['sec-ch-ua'] || '';
    const secChUaPlatform = req.headers?.['sec-ch-ua-platform'] || '';
    const ipSubnet = this.anonymizeIp(req.ip || req.connection?.remoteAddress || '127.0.0.1');

    const entropyString = [
      clientProvidedHash,
      userAgent,
      acceptLanguage,
      secChUa,
      secChUaPlatform,
      ipSubnet,
      SYSTEM_SALT
    ].join('##');

    return crypto.createHash('sha256').update(entropyString).digest('hex');
  }

  /**
   * Evaluates environment similarity for abuse detection
   */
  static compareEnvironments(hashA, hashB) {
    if (!hashA || !hashB) return false;
    return hashA === hashB;
  }
}
