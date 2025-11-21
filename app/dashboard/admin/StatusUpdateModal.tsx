"use client";

import { useState } from "react";
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Update Post Status</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-colors border-green-200">
                <input
                  type="radio"
                  name="status"
                  value="approved"
                  checked={status === "approved"}
                  onChange={(e) => setStatus(e.target.value as "approved")}
                  className="text-green-600 focus:ring-green-500"
                />
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="font-medium text-slate-900">Approve</span>
              </label>
              <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-red-50 transition-colors border-red-200">
                <input
                  type="radio"
                  name="status"
                  value="rejected"
                  checked={status === "rejected"}
                  onChange={(e) => setStatus(e.target.value as "rejected")}
                  className="text-red-600 focus:ring-red-500"
                />
                <XCircleIcon className="w-5 h-5 text-red-600" />
                <span className="font-medium text-slate-900">Reject</span>
              </label>
            </div>
          </div>

          {status === "rejected" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rejection Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                placeholder="Please provide a reason for rejection..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg ${
                status === "approved"
                  ? "bg-green-600 shadow-green-500/50"
                  : "bg-red-600 shadow-red-500/50"
              }`}
            >
              {isLoading ? "Updating..." : status === "approved" ? "Approve Post" : "Reject Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


