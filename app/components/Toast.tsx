"use client";

import { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      ? "bg-red-50/90 backdrop-blur-xl border-red-200/50 text-red-800"
      : type === "success"
      ? "bg-green-50/90 backdrop-blur-xl border-green-200/50 text-green-800"
      : "bg-blue-50/90 backdrop-blur-xl border-blue-200/50 text-blue-800";

  const iconColor =
    type === "error"
      ? "text-red-600"
      : type === "success"
      ? "text-green-600"
      : "text-blue-600";

  const Icon =
    type === "error" ? (
      <AlertCircle className={`w-5 h-5 ${iconColor}`} />
    ) : type === "success" ? (
      <CheckCircle2 className={`w-5 h-5 ${iconColor}`} />
    ) : (
      <Info className={`w-5 h-5 ${iconColor}`} />
    );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-4 right-4 z-[9999]"
      >
        <motion.div
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border-2 ${bgColor} min-w-[300px] max-w-md backdrop-blur-xl`}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
          >
            {Icon}
          </motion.div>
          <p className="flex-1 text-sm font-semibold">{message}</p>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className={`p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer ${iconColor}`}
            type="button"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

