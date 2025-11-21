"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { updateUser } from "@/app/server/admin/users";

interface User {
  id: string;
  username: string;
  role: string;
}

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({
  user,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    username: user.username,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Username cannot be changed, so just close the modal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Edit User</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-500">
              Username cannot be changed
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong>Role:</strong> {user.role} (cannot be changed)
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
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

