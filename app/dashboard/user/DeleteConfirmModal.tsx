"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface DeleteConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onClose,
  isLoading = false,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            </div>
          </div>

          <p className="text-slate-600 mb-6">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-500/50"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

