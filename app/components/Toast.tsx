"use client";

import { useEffect } from "react";
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface ToastProps {
  message: string;
  type: "error" | "success" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "error"
      ? "bg-red-50 border-red-200 text-red-800"
      : type === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : "bg-blue-50 border-blue-200 text-blue-800";

  const iconColor =
    type === "error"
      ? "text-red-600"
      : type === "success"
      ? "text-green-600"
      : "text-blue-600";

  const Icon =
    type === "error" ? (
      <ExclamationCircleIcon className={`w-5 h-5 ${iconColor}`} />
    ) : type === "success" ? (
      <CheckCircleIcon className={`w-5 h-5 ${iconColor}`} />
    ) : (
      <ExclamationCircleIcon className={`w-5 h-5 ${iconColor}`} />
    );

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${bgColor} min-w-[300px] max-w-md`}
      >
        {Icon}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className={`p-1 rounded-lg hover:bg-black/10 transition-colors cursor-pointer ${iconColor}`}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

