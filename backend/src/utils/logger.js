/**
 * Audit Logger & Security Event Recorder
 */
export class AuditLogger {
  static info(message, meta = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  }

  static warn(message, meta = {}) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ⚠️ ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  }

  static error(message, meta = {}) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ❌ ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  }

  static securityAlert(incidentType, details = {}) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [SECURITY_ALERT] 🚨 [${incidentType}]`, JSON.stringify(details));
  }
}
