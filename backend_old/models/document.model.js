const mongoose = require('mongoose');

const DocumentChunkSchema = new mongoose.Schema({
    text: { type: String, required: true },
    embedding: { type: [Number], required: true }, 
    metadata: {
        pageNumber: { type: Number },
        source: { type: String }
    }
});

const DocumentSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    chunks: [DocumentChunkSchema]
});

module.exports = mongoose.model('Document', DocumentSchema);
