"use client";

import { useState } from "react";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { changePassword } from "@/app/server/auth/changePassword";
import Toast from "@/app/components/Toast";

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangePasswordModal({
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to change password");
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
          <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
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
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                required
                className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPasswords.current ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                required
                minLength={6}
                className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPasswords.new ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Must be at least 6 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                minLength={6}
                className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPasswords.confirm ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-lg shadow-indigo-500/50"
            >
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
}

