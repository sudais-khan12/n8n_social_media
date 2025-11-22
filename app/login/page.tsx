"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/server/auth/login";
import { FileText, Eye, EyeOff, User, Lock } from "lucide-react";
import { motion } from "framer-motion";
import Toast from "@/app/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await loginUser(username, password);

      // Redirect based on role
      if (result.role === "admin") {
        router.push("/dashboard/admin");
      } else if (result.role === "user") {
        router.push("/dashboard/user");
      } else {
        // Fallback for any other role
        router.push("/dashboard/user");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-lg border border-white/30 p-8 md:p-10 relative overflow-hidden"
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/20 pointer-events-none"></div>
          
          <div className="relative z-10">
            {/* Logo/Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/50 mb-6"
              >
                <FileText className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent mb-3">
                Welcome Back
              </h1>
              <p className="text-slate-600 text-lg">Sign in to your account</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 pl-12 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    placeholder="Enter your username"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 pl-12 pr-12 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-100 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:via-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg relative overflow-hidden group cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Logging in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
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
