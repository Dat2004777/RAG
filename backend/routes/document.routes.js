const express = require('express');
const multer = require('multer');
const { uploadDocument } = require('../controllers/document.controller');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/upload', upload.single('file'), uploadDocument);

module.exports = router;
