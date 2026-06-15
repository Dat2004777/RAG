import { useState } from "react";
import axios from "axios";

export default function DocumentUploader({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(
                "http://localhost:5000/api/documents/upload",
                formData
            );
            setMessage(res.data.message);
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            setMessage(
                "Lỗi upload: " + (error.response?.data?.error || error.message),
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
                Thêm nguồn Tài Liệu
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
                <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition"
                >
                    {uploading
                        ? "Đang phân tích & Vector hóa..."
                        : "Tải Lên Hệ Thống"}
                </button>
            </form>
            {message && (
                <p className="mt-3 text-sm font-medium text-gray-700">
                    {message}
                </p>
            )}
        </div>
    );
}
