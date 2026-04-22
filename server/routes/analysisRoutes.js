const express = require('express');
const router = express.Router();
const { analyzeFIR, getDashboardAnalytics, getAICrimeAnalysis } = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/fir/:id', analyzeFIR);
router.get('/dashboard', getDashboardAnalytics);
router.post('/ai-crime-analysis', getAICrimeAnalysis);

module.exports = router;
