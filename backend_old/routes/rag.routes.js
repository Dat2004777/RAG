const express = require('express');
const { queryRAGFlow } = require('../controllers/rag.controller');
const router = express.Router();

router.post('/query', queryRAGFlow);

module.exports = router;
