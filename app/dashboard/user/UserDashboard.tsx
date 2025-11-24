"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import PostsList from "./PostsList";
import {
  FileText,
  LogOut,
  Key,
  Circle,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "@/app/server/auth/logout";
import ChangePasswordModal from "./ChangePasswordModal";
import Toast from "@/app/components/Toast";

interface Post {
  id: string;
  user_id: string;
  heading: string;
  caption: string;
  hookline: string;
  cta: string;
  hashtags: string[];
  social: string;
  image_url: string | null;
  status: string;
  comment: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserDashboardProps {
  initialPosts: Post[];
  username: string;
}

export default function UserDashboard({
  initialPosts,
  username,
}: UserDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [socialFilter, setSocialFilter] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  // Set up Supabase realtime subscriptions
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to posts changes
    const postsChannel = supabase
      .channel("user-posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          // Refresh the page data when posts change
          setIsRefreshing(true);
          router.refresh();
          // Reset loading state after a short delay
          setTimeout(() => setIsRefreshing(false), 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [router]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-indigo-50 to-purple-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-grow bg-white/70 backdrop-blur-2xl border-r border-white/30 shadow-md"
            >
              {/* Logo/Header */}
              <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-slate-200/50">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md"
                  >
                    <FileText className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">My Posts</h1>
                    <p className="text-xs text-slate-500">Social Media</p>
                  </div>
                </div>
              </div>

              {/* Navigation - Scrollable Area */}
              <nav className="flex-1 px-3 py-4 space-y-1 flex flex-col overflow-y-auto min-h-0">
                <div className="space-y-1">
                  <button
                    onClick={() => setStatusFilter(null)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      statusFilter === null
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>All Posts</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      statusFilter === "pending"
                        ? "bg-yellow-500 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-current" />
                    <span>Pending</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("approved")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      statusFilter === "approved"
                        ? "bg-green-500 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-current" />
                    <span>Approved</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("rejected")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      statusFilter === "rejected"
                        ? "bg-red-500 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-current" />
                    <span>Rejected</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("posted")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      statusFilter === "posted"
                        ? "bg-blue-500 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-current" />
                    <span>Posted</span>
                  </button>
                </div>
                
                {/* Social Media Filters */}
                <div className="space-y-1 pt-3 border-t border-slate-200">
                  <p className="px-3 text-xs font-semibold text-slate-500 uppercase mb-1">Social</p>
                  <button
                    onClick={() => setSocialFilter(null)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      socialFilter === null
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>All</span>
                  </button>
                  <button
                    onClick={() => setSocialFilter("Facebook")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      socialFilter === "Facebook"
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => setSocialFilter("GBP")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      socialFilter === "GBP"
                        ? "bg-red-500 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>GBP</span>
                  </button>
                  <button
                    onClick={() => setSocialFilter("LinkedIn")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      socialFilter === "LinkedIn"
                        ? "bg-blue-700 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>LinkedIn</span>
                  </button>
                </div>
              </nav>
              
              {/* Bottom Actions - Fixed at bottom */}
              <div className="flex-shrink-0 px-3 py-4 border-t border-slate-200/50 space-y-1 bg-white/70">
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-slate-700 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Topbar */}
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white/70 backdrop-blur-2xl border-b border-white/30 shadow-lg z-10"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 sm:px-6 py-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent">My Posts</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Review and manage your posts
                </p>
              </div>
              {/* User Menu Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/70 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-900 text-sm sm:text-base truncate hidden sm:inline">{username}</span>
                </motion.button>
                
                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-200/50">
                          <p className="text-sm font-semibold text-slate-900">{username}</p>
                          <p className="text-xs text-slate-500">User</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setShowChangePassword(true);
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Key className="w-4 h-4" />
                            <span>Change Password</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Mobile Filter Buttons */}
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden px-4 sm:px-6 pb-4 overflow-hidden"
              >
                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStatusFilter(null)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === null
                        ? "bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>All</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStatusFilter("pending")}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === "pending"
                        ? "bg-gradient-to-r from-yellow-500 via-amber-600 to-orange-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-yellow-500 text-yellow-500" />
                    <span>Pending</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStatusFilter("approved")}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === "approved"
                        ? "bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    <span>Approved</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStatusFilter("rejected")}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === "rejected"
                        ? "bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                    <span>Rejected</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStatusFilter("posted")}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === "posted"
                        ? "bg-gradient-to-r from-blue-500 via-cyan-600 to-sky-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                    <span>Posted</span>
                  </motion.button>
                </div>
                
                {/* Mobile Social Media Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSocialFilter(null)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      socialFilter === null
                        ? "bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>All Social</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSocialFilter("Facebook")}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      socialFilter === "Facebook"
                        ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-blue-600 text-blue-600" />
                    <span>Facebook</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSocialFilter("GBP")}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      socialFilter === "GBP"
                        ? "bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-red-500 text-red-500" />
                    <span>GBP</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSocialFilter("LinkedIn")}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      socialFilter === "LinkedIn"
                        ? "bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Circle className="w-2 h-2 fill-blue-700 text-blue-700" />
                    <span>LinkedIn</span>
                  </motion.button>
                </div>
                
              </motion.div>
            </AnimatePresence>
          </motion.header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
            {/* Loading Overlay */}
            {isRefreshing && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 flex flex-col items-center gap-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"
                  />
                  <p className="text-sm font-semibold text-slate-700">Updating...</p>
                </motion.div>
              </div>
            )}
            <div className="max-w-7xl mx-auto">
              <PostsList initialPosts={initialPosts} onRefresh={handleRefresh} statusFilter={statusFilter} socialFilter={socialFilter} />
            </div>
          </main>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onSuccess={() => {
            setShowChangePassword(false);
            setToast({ message: "Password changed successfully!", type: "success" });
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

