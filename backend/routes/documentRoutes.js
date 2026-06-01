const express = require('express');
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/documentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerConfig');

const router = express.Router();

router.post('/upload', protect, upload.array('files', 5), uploadDocument);
router.get('/', protect, getDocuments);
router.delete('/:id', protect, adminOnly, deleteDocument);

module.exports = router;