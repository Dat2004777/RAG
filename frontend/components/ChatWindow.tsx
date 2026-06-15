"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Trash2, FileCheck, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "bot";
  content: string;
  sources?: string[];
}

export default function ChatWindow() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const handleSend = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const queryText = customQuestion || question;
    if (!queryText.trim()) return;

    const userMsg: Message = { role: "user", content: queryText };
    setChatHistory((prev) => [...prev, userMsg]);
    setLoading(true);
    if (!customQuestion) setQuestion("");

    try {
      const res = await axios.post("http://localhost:5000/api/rag/query", {
        question: queryText,
      });

      const botMsg: Message = {
        role: "bot",
        content: res.data.answer,
        sources: res.data.sources,
      };
      setChatHistory((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error("Lỗi khi truy vấn RAG:", error);
      const errMsg =
        error.response?.data?.error || error.message || "Lỗi kết nối";
      setChatHistory((prev) => [
        ...prev,
        {
          role: "bot",
          content: `Đã xảy ra lỗi khi truy vấn hệ thống: ${errMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col h-[520px] transition-all duration-300 hover:shadow-2xl">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-850">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          RAG Flow Chat Agent
        </h2>
        {chatHistory.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1 text-xs font-semibold text-rose-550 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-350 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-95 transition-all"
            title="Xóa cuộc trò chuyện"
          >
            <Trash2 className="w-4 h-4" />
            Xóa Chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-2 bg-slate-50/50 dark:bg-slate-950/30 rounded-xl mb-4 border border-slate-100/55 dark:border-slate-850/50">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <Bot className="w-16 h-16 text-indigo-600/30 dark:text-indigo-600/20 mb-3 animate-pulse" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Hệ thống RAG đã sẵn sàng!
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
              Tải tài liệu lên và bắt đầu đặt câu hỏi liên quan để nhận câu trả
              lời chính xác dựa trên ngữ cảnh.
            </p>
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`p-2 rounded-full shrink-0 ${
                  msg.role === "user"
                    ? "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                    : "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl relative group shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none"
                    : "bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-250 border border-slate-100 dark:border-slate-800 rounded-tl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 text-[10px] text-slate-400 dark:text-slate-500 italic border-t border-slate-100/50 dark:border-slate-800/50 flex flex-wrap items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Nguồn tài liệu:{" "}
                    {Array.from(new Set(msg.sources)).map((src, sIdx) => (
                      <span
                        key={sIdx}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[9px] font-semibold not-italic"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex items-start gap-2 max-w-[80%]">
            <div className="p-2 rounded-full shrink-0 bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-850 text-slate-500 dark:text-slate-450 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center gap-2 text-sm italic">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              Agent đang tìm kiếm thông tin & tạo phản hồi...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={(e) => handleSend(e)} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Nhập câu hỏi liên quan đến tài liệu tại đây..."
          disabled={loading}
          className="flex-1 px-4 py-3 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-550 text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
