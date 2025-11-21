"use client";

import Toast from "@/app/components/Toast";
import { useState } from "react";

interface DisapproveModalProps {
  postId: string;
  onClose: () => void;
  onConfirm: (postId: string, comment: string) => void;
  isLoading: boolean;
}

export default function DisapproveModal({
  postId,
  onClose,
  onConfirm,
  isLoading,
}: DisapproveModalProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      setError("Comment is required");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Comment must be at least 10 characters long");
      return;
    }

    setError(null);
    onConfirm(postId, comment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Reject Post</h2>
            <p className="text-sm text-slate-600 mt-1">
              Please provide a reason for rejecting this post
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError(null);
              }}
              required
              rows={4}
              minLength={10}
              placeholder="Enter the reason for rejecting this post..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-900"
            />
            <p className="mt-1 text-xs text-slate-500">
              Minimum 10 characters required
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !comment.trim()}
              className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-500/50"
            >
              {isLoading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
    </div>
  );
}
