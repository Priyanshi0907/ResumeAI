const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getAllUsers,
  deleteUser,
  getStoredPdfs,
  exportCsv,
} = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');

router.get('/metrics', authenticateAdmin, getDashboardMetrics);
router.get('/users', authenticateAdmin, getAllUsers);
router.delete('/users/:id', authenticateAdmin, deleteUser);
router.get('/pdfs', authenticateAdmin, getStoredPdfs);
router.get('/export-csv', authenticateAdmin, exportCsv);

module.exports = router;
