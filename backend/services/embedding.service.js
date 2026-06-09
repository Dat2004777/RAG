const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { TaskType } = require("@google/generative-ai");

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "gemini-embedding-001",
    taskType: TaskType.RETRIEVAL_DOCUMENT,
});

const generateEmbedding = async (text) => {
    try {
        return await embeddings.embedQuery(text);
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
};

const chunkText = (text, chunkSize = 500, chunkOverlap = 100) => {
    const words = text.split(' ');
    const chunks = [];
    let i = 0;

    while (i < words.length) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        chunks.push(chunk);
        i += chunkSize - chunkOverlap;
    }
    return chunks;
};

module.exports = { generateEmbedding, chunkText };
