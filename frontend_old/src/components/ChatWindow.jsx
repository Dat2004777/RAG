import { useState } from "react";
import axios from "axios";

export default function ChatWindow() {
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        const userMsg = { role: "user", content: question };
        setChatHistory((prev) => [...prev, userMsg]);
        setLoading(true);
        setQuestion("");

        try {
            const res = await axios.post(
                "http://localhost:5000/api/rag/query",
                { question },
            );
            const botMsg = {
                role: "bot",
                content: res.data.answer,
                sources: res.data.sources,
            };
            setChatHistory((prev) => [...prev, botMsg]);
        } catch (error) {
            setChatHistory((prev) => [
                ...prev,
                {
                    role: "bot",
                    content: "Có lỗi xảy ra trong quá trình truy vấn hệ thống.",
                },
            ]);
            console.log("Lỗi khi truy vấn câu trả lời, ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-125 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
                RAG Flow Chat
            </h2>

            <div className="flex-1 overflow-y-auto space-y-4 p-2 bg-gray-50 rounded-md mb-4 border border-gray-100">
                {chatHistory.length === 0 && (
                    <p className="text-gray-400 text-center mt-10">
                        Hệ thống RAG đã sẵn sàng. Hãy hỏi bất kỳ câu hỏi nào
                        liên quan đến tài liệu đã tải lên.
                    </p>
                )}
                {chatHistory.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-lg max-w-[85%] ${msg.role === "user" ? "bg-indigo-600 text-white ml-auto" : "bg-white border border-gray-200 text-gray-800"}`}
                    >
                        <p className="text-sm font-semibold mb-1">
                            {msg.role === "user" ? "Bạn:" : "AI Agent:"}
                        </p>
                        <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                        </p>
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2 text-xs text-gray-400 italic border-t pt-1">
                                Nguồn:{" "}
                                {Array.from(new Set(msg.sources)).join(", ")}
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="text-gray-500 text-sm animate-pulse italic">
                        Agent đang thực hiện Tìm kiếm & Đang tạo phản hồi...
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn tại đây..."
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium transition"
                >
                    Gửi
                </button>
            </form>
        </div>
    );
}
