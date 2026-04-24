const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
  getDashboardMetrics,
  checkDuplicate,
} = require('../controllers/leadController');
const { validateLead, handleValidation } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

// All lead routes require authentication
router.use(protect);

router.get('/dashboard/metrics', getDashboardMetrics);
router.post('/check-duplicate', checkDuplicate);
router.post('/:id/notes', addNote);

router.route('/')
  .get(getLeads)
  .post(validateLead, handleValidation, createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

module.exports = router;
