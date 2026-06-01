const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getLogs } = require('../controllers/logController');

const router = express.Router();

router.get('/', protect, adminOnly, getLogs);

module.exports = router;