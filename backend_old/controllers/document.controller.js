const Document = require('../models/document.model');
const { chunkText, generateEmbedding } = require('../services/embedding.service');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        let extractedText = '';
        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(dataBuffer);
            extractedText = pdfData.text;
        } else {
            extractedText = fs.readFileSync(req.file.path, 'utf-8');
        }

        const textChunks = chunkText(extractedText);
        const processedChunks = [];

        for (const text of textChunks) {
            if (!text.trim()) continue;
            const embedding = await generateEmbedding(text);
            processedChunks.push({
                text,
                embedding,
                metadata: { source: req.file.originalname }
            });
        }

        const newDoc = new Document({
            filename: req.file.originalname,
            chunks: processedChunks
        });

        await newDoc.save();
        fs.unlinkSync(req.file.path);

        res.status(201).json({ message: 'Xử lý tài liệu và chuyển hóa vector thành công', docId: newDoc._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadDocument };
