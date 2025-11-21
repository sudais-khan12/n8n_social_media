"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createUser } from "@/app/server/admin/users";
import Toast from "@/app/components/Toast";

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    role: "user" as const,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Always create as "user" role
      const result = await createUser({
        username: formData.username,
        role: "user",
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to create user");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Create User</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
            <p className="mt-1 text-xs text-slate-500">
              Default password: password123
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong>Note:</strong> Only users can be created. Admin accounts
              cannot be created through this interface.
            </p>
          </div>

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
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/50"
            >
              {isLoading ? "Creating..." : "Create User"}
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
