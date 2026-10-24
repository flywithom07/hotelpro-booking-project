const express = require('express');
const router = express.Router();
const { getAllUsers, getAdminStats } = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(verifyToken, requireAdmin);

router.get('/users', getAllUsers);
router.get('/stats', getAdminStats);

module.exports = router;
