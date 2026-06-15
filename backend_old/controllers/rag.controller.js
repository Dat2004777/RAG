const Document = require('../models/document.model');
const { generateEmbedding } = require('../services/embedding.service');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemma-4-31b-it",
    maxOutputTokens: 2048,
});

const processRawAnswer = (rawAnswer) => {
    let cleanText = "";

    if (Array.isArray(rawAnswer)) {
        const textObj = rawAnswer.find(item => item.type === 'text');
        if (textObj && textObj.text) {
            cleanText = textObj.text;
        }
    } else if (typeof rawAnswer === 'string') {
        cleanText = rawAnswer;
    } else {
        cleanText = String(rawAnswer);
    }

    const lines = cleanText.split('\n');
    if (lines.length > 1) {
        return lines.slice(1).join('\n');
    }

    return cleanText;
}

const queryRAGFlow = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ message: 'Question is required' });

        const queryVector = await generateEmbedding(question);

        console.log("Đang thực hiện Vector Search với vector độ dài:", queryVector.length);

        const searchResult = await Document.aggregate([
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "chunks.embedding",
                    queryVector: queryVector,
                    numCandidates: 100,
                    limit: 5
                }
            },
            {
                $unwind: "$chunks"
            },
            {
                $project: {
                    _id: 0,
                    filename: 1,
                    text: "$chunks.text",
                    score: { $meta: "vectorSearchScore" }
                }
            },
            {
                $limit: 5
            }
        ]);

        console.log(`Kết quả truy vấn: tìm thấy ${searchResult.length} đoạn tiềm năng.`);

        const context = searchResult.map(item => item.text).join('\n\n');


        const systemPrompt = `You are an advanced AI Assistant specialized in Document Q&A. 
                Use the following context to answer the user's question accurately. 
                If you don't know the answer or if it's not in the context, say "Tôi không tìm thấy thông tin này trong tài liệu được cung cấp." Don't make up information.

                Context:
                ${context}`;

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(question),
        ]);

        let finalAnswer = processRawAnswer(response.content);

        res.status(200).json({
            answer: finalAnswer,
            sources: searchResult.map(d => d.filename)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { queryRAGFlow };
