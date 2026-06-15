import React from "react";
import DocumentUploader from "@/components/DocumentUploader";
import ChatWindow from "@/components/ChatWindow";
import { Database, ShieldCheck, Cpu } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-tr from-slate-50 via-indigo-50/20 to-violet-50/30 dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-900 px-4 py-8 md:py-12 transition-colors duration-300">
      {/* Background aurora blobs for rich aesthetics */}
      <div className="absolute top-0 right-0 -z-10 w-[400px] h-[400px] bg-indigo-550/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-violet-550/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="mb-10 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-4 shadow-sm">
            <Cpu className="w-3.5 h-3.5" />
            RAG Flow System
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent bg-[size:200%] animate-gradient">
            Hanoi Urban Planning Intelligent Query Platform
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-655 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Phân tích tài liệu PDF/TXT tự động, chuyển đổi vector hóa và hỏi đáp
            ngữ cảnh thời gian thực cùng mô hình ngôn ngữ lớn.
          </p>
        </header>

        {/* System Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-xl border border-slate-200/30 dark:border-slate-800/30 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Cơ sở dữ liệu
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                MongoDB Atlas Vector
              </p>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-xl border border-slate-200/30 dark:border-slate-800/30 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Embedding Model
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                gemini-embedding-001
              </p>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-xl border border-slate-200/30 dark:border-slate-800/30 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Chat Agent Model
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                gemma-4-31b-it
              </p>
            </div>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            <DocumentUploader />
          </div>
          <div className="lg:col-span-2">
            <ChatWindow />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-400 dark:text-slate-600">
          <p>© {new Date().getFullYear()} RAG Flow System</p>
        </footer>
      </div>
    </main>
  );
}
