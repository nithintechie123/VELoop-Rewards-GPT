import { db } from '../data/store.js';

export const getAuditLogs = (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const logs = db.getAuditLogs(limit);
    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    next(err);
  }
};

export const getFraudIncidents = (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const incidents = db.getFraudIncidents(limit);
    res.json({
      success: true,
      count: incidents.length,
      incidents
    });
  } catch (err) {
    next(err);
  }
};
