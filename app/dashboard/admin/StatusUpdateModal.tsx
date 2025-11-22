"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { updatePostStatus } from "@/app/server/admin/posts";
import Toast from "@/app/components/Toast";

interface StatusUpdateModalProps {
  postId: string;
  currentStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StatusUpdateModal({
  postId,
  currentStatus,
  onClose,
  onSuccess,
}: StatusUpdateModalProps) {
  const [status, setStatus] = useState<"approved" | "rejected">("approved");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only allow status update for pending posts
  if (currentStatus !== "pending") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === "rejected" && !comment.trim()) {
      setError("Comment is required when rejecting a post");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updatePostStatus(postId, {
        status,
        comment: status === "rejected" ? comment.trim() : null,
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to update status");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-lg w-full max-w-md border border-white/30"
        >
          <div className="border-b border-slate-200/50 px-6 py-5 flex justify-between items-center bg-gradient-to-r from-slate-50/50 to-white/50">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">Update Post Status</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    status === "approved"
                      ? "bg-green-50/80 border-green-400 shadow-lg shadow-green-500/20"
                      : "border-green-200 hover:bg-green-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="approved"
                    checked={status === "approved"}
                    onChange={(e) => setStatus(e.target.value as "approved")}
                    className="text-green-600 focus:ring-green-500 w-4 h-4"
                  />
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-slate-900">Approve</span>
                </motion.label>
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    status === "rejected"
                      ? "bg-red-50/80 border-red-400 shadow-lg shadow-red-500/20"
                      : "border-red-200 hover:bg-red-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="rejected"
                    checked={status === "rejected"}
                    onChange={(e) => setStatus(e.target.value as "rejected")}
                    className="text-red-600 focus:ring-red-500 w-4 h-4"
                  />
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-slate-900">Reject</span>
                </motion.label>
              </div>
            </div>

            <AnimatePresence>
              {status === "rejected" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Rejection Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    placeholder="Please provide a reason for rejection..."
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-slate-900 placeholder:text-slate-400 transition-all shadow-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/50">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-semibold cursor-pointer"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2.5 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-semibold cursor-pointer ${
                  status === "approved"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/50"
                    : "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/50"
                }`}
              >
                {isLoading ? "Updating..." : status === "approved" ? "Approve Post" : "Reject Post"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


