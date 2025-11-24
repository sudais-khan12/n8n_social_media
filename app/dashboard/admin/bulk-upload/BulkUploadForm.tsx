"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, User, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { bulkUploadPosts } from "@/app/server/admin/bulkUpload";
import Toast from "@/app/components/Toast";

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

interface BulkUploadFormProps {
  initialUsers: User[];
  username: string;
}

export default function BulkUploadForm({ initialUsers, username }: BulkUploadFormProps) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [parsedRowCount, setParsedRowCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "xlsx" && fileExtension !== "csv") {
      setToast({
        message: "Invalid file type. Only .xlsx and .csv files are allowed.",
        type: "error",
      });
      e.target.value = ""; // Reset input
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setToast({
        message: "File size exceeds 5MB limit.",
        type: "error",
      });
      e.target.value = ""; // Reset input
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);

    // Preview: Parse file locally to get row count (without sending to webhook)
    try {
      const arrayBuffer = await file.arrayBuffer();
      let workbook: XLSX.WorkBook;
      
      if (fileExtension === "csv") {
        const text = new TextDecoder().decode(arrayBuffer);
        workbook = XLSX.read(text, { type: "string" });
      } else {
        workbook = XLSX.read(arrayBuffer, { type: "array" });
      }

      const firstSheetName = workbook.SheetNames[0];
      if (firstSheetName) {
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });
        setParsedRowCount(rows.length);
      } else {
        setParsedRowCount(0);
      }
    } catch (error) {
      // Preview failed, but allow upload
      setParsedRowCount(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user selection
    if (!selectedUserId || selectedUserId.trim() === "") {
      setToast({
        message: "Please select a user before uploading.",
        type: "error",
      });
      return;
    }

    // Validate file selection
    if (!selectedFile) {
      setToast({
        message: "Please select a file to upload.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const result = await bulkUploadPosts(arrayBuffer, fileName, selectedUserId);

      if (result.success) {
        setToast({
          message: `Successfully uploaded ${result.rowCount || 0} rows to n8n webhook!`,
          type: "success",
        });
        // Reset form
        setSelectedUserId("");
        setSelectedFile(null);
        setFileName("");
        setParsedRowCount(null);
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setToast({
          message: result.error || "Failed to upload file",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard/admin")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors group font-semibold cursor-pointer"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </motion.button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent mb-2">
            Bulk Upload Posts
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">Upload Excel or CSV files to send post data to n8n webhook</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 p-4 sm:p-6 lg:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div>
              <label htmlFor="user-select" className="block text-sm font-semibold text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Select User <span className="text-red-500">*</span>
              </label>
              <select
                id="user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-medium text-base"
                required
              >
                <option value="">-- Select a user --</option>
                {initialUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FileSpreadsheet className="w-4 h-4 inline mr-2" />
                Upload File <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileChange}
                  disabled={isLoading || !selectedUserId}
                  className="hidden"
                />
                <label
                  htmlFor="file-input"
                  className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all text-sm sm:text-base ${
                    isLoading || !selectedUserId
                      ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-50"
                      : "border-indigo-300 bg-indigo-50/50 hover:border-indigo-500 hover:bg-indigo-100/50"
                  }`}
                >
                  <Upload className="w-5 h-5 text-indigo-600" />
                  <span className="text-slate-700 font-semibold">
                    {fileName || "Choose .xlsx or .csv file"}
                  </span>
                </label>
              </div>
              {!selectedUserId && (
                <p className="text-xs text-slate-500 mt-2">Please select a user first</p>
              )}
              <p className="text-xs text-slate-500 mt-2">Maximum file size: 5MB</p>
            </div>

            {/* Preview */}
            {fileName && parsedRowCount !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50/50 border border-blue-200 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">File: {fileName}</p>
                    <p className="text-xs text-blue-700">Rows detected: {parsedRowCount}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !selectedUserId || !selectedFile}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:via-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading and Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload and Send to n8n</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-4 sm:mt-6 bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 p-4 sm:p-6"
        >
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
            Instructions
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Select a user from the dropdown before uploading a file</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Only .xlsx and .csv files are supported</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>File size limit: 5MB</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Data will be parsed and sent to the n8n webhook</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Each row in the sheet will be sent as post data</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

