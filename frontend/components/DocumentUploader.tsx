"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface DocumentUploaderProps {
  onUploadSuccess?: () => void;
}

export default function DocumentUploader({
  onUploadSuccess,
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.name.endsWith(".txt")
      ) {
        setFile(selectedFile);
        setStatus({ type: null, message: "" });
      } else {
        setStatus({
          type: "error",
          message: "Chỉ chấp nhận tệp định dạng .pdf hoặc .txt",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === "application/pdf" ||
        droppedFile.name.endsWith(".txt")
      ) {
        setFile(droppedFile);
        setStatus({ type: null, message: "" });
      } else {
        setStatus({
          type: "error",
          message: "Chỉ chấp nhận tệp định dạng .pdf hoặc .txt",
        });
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatus({ type: null, message: "" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/documents/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setStatus({
        type: "success",
        message:
          res.data.message || "Tải tài liệu và chuyển hóa vector thành công!",
      });
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error: any) {
      const errMsg =
        error.response?.data?.error || error.message || "Lỗi upload";
      setStatus({
        type: "error",
        message: `Lỗi tải lên: ${errMsg}`,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-indigo-600" />
        Tải Lên Tài Liệu
      </h2>

      <form onSubmit={handleUpload} className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            isDragOver
              ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20"
              : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-slate-850/30"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt"
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <FileText className="w-12 h-12 text-indigo-600 mb-3 animate-bounce" />
              <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm max-w-xs truncate">
                {file.name}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <UploadCloud className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-350">
                Kéo thả file vào đây hoặc click để chọn
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Hỗ trợ định dạng PDF, TXT (Tối đa 10MB)
              </p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-3 px-4 rounded-xl font-medium shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang phân tích & Vector hóa...
            </>
          ) : (
            "Tải Lên Hệ Thống"
          )}
        </button>
      </form>

      {status.type && (
        <div
          className={`mt-4 p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
            status.type === "success"
              ? "bg-emerald-550/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-550/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          )}
          <p className="text-sm font-medium leading-relaxed">
            {status.message}
          </p>
        </div>
      )}
    </div>
  );
}
