import express from 'express';
import { getAuditLogs, getFraudIncidents } from '../controllers/auditController.js';

const router = express.Router();

router.get('/logs', getAuditLogs);
router.get('/fraud-incidents', getFraudIncidents);

export default router;
