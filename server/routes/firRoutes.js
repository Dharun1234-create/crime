const express = require('express');
const router = express.Router();
const {
  createFIR,
  getAllFIRs,
  getFIRById,
  updateFIR,
  deleteFIR,
  requestUpdate,
  getMyRequests
} = require('../controllers/firController');
const { generateFIRPdf } = require('../controllers/pdfController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/create', createFIR);
router.get('/all', getAllFIRs);
router.get('/my-requests', getMyRequests);
router.post('/request-update/:id', requestUpdate);
router.get('/generate-pdf/:id', generateFIRPdf);
router.get('/:id', getFIRById);
router.put('/update/:id', updateFIR);
router.delete('/:id', deleteFIR);

module.exports = router;
