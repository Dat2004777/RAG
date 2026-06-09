import DocumentUploader from "./components/DocumentUploader";
import ChatWindow from "./components/ChatWindow";

export default function App() {
    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        RAG Flow System
                    </h1>
                    <p className="mt-2 text-lg text-slate-600">
                        Hệ thống nạp tri thức tự động bằng Vector Search & Trả
                        lời ngữ cảnh chính xác cao
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <DocumentUploader
                            onUploadSuccess={() =>
                                console.log(
                                    "Document system dynamic refresh callback.",
                                )
                            }
                        />
                    </div>
                    <div className="md:col-span-2">
                        <ChatWindow />
                    </div>
                </div>
            </div>
        </div>
    );
}
