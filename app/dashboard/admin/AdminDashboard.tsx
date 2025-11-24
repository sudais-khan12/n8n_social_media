"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import PostsTable from "./PostsTable";
import UsersTable from "./UsersTable";
import CreatePostModal from "./CreatePostModal";
import CreateUserModal from "./CreateUserModal";
import {
  Plus,
  Users,
  FileText,
  LogOut,
  Key,
  Circle,
  User as UserIcon,
  Upload,
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
  users?: {
    id: string;
    username: string;
  };
}

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

interface AdminDashboardProps {
  initialPosts: Post[];
  initialUsers: User[];
  username: string;
}

export default function AdminDashboard({
  initialPosts,
  initialUsers,
  username,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "users">("posts");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [socialFilter, setSocialFilter] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Set up Supabase realtime subscriptions
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to posts changes
    const postsChannel = supabase
      .channel("posts-changes")
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

    // Subscribe to users changes
    const usersChannel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
        },
        (payload) => {
          // Refresh the page data when users change
          setIsRefreshing(true);
          router.refresh();
          // Reset loading state after a short delay
          setTimeout(() => setIsRefreshing(false), 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(usersChannel);
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
                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">Admin Portal</h1>
                    <p className="text-xs text-slate-500">Social Media</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1 flex flex-col overflow-y-auto">
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      activeTab === "posts"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Posts</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      activeTab === "users"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Users</span>
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/admin/bulk-upload")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Bulk Upload</span>
                  </button>
                </div>

                {/* Post Status Filters - Only show when Posts tab is active */}
                {activeTab === "posts" && (
                  <div className="space-y-1 pt-3 border-t border-slate-200">
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
                    <button
                      onClick={() => setStatusFilter("draft")}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        statusFilter === "draft"
                          ? "bg-slate-500 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Circle className="w-2 h-2 fill-current" />
                      <span>Draft</span>
                    </button>
                  </div>
                )}
                
                {/* Social Media Filters - Only show when Posts tab is active */}
                {activeTab === "posts" && (
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
                )}
                
                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-200 space-y-1">
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
              </nav>
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
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent truncate">
                  {activeTab === "posts" ? "Posts Management" : "Users Management"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {activeTab === "posts"
                    ? "Manage and review all posts"
                    : "Manage user accounts and permissions"}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 flex-1 sm:flex-initial">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-900 text-sm sm:text-base truncate">{username}</span>
                </div>
                <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (activeTab === "posts") {
                    setShowCreatePost(true);
                  } else {
                    setShowCreateUser(true);
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:via-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold cursor-pointer text-sm sm:text-base flex-shrink-0"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">
                  Create {activeTab === "posts" ? "Post" : "User"}
                </span>
                <span className="sm:hidden">Create</span>
              </motion.button>
              </div>
            </div>

            {/* Mobile Filter Buttons - Only show when Posts tab is active */}
            <AnimatePresence>
              {activeTab === "posts" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden px-4 sm:px-6 pb-4 overflow-hidden"
                >
                  <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStatusFilter("draft")}
                      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        statusFilter === "draft"
                          ? "bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Circle className="w-2 h-2 fill-slate-500 text-slate-500" />
                      <span>Draft</span>
                    </motion.button>
                  </div>
                  
                  {/* Mobile Social Media Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mt-4">
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
              )}
            </AnimatePresence>

            {/* Mobile Logout and Change Password */}
            <div className="lg:hidden px-4 sm:px-6 pb-4 flex gap-2 border-t border-slate-200/50 pt-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChangePassword(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>Password</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
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
              {/* Mobile Tabs */}
              <div className="lg:hidden mb-4 sm:mb-6 flex gap-2 bg-white/70 backdrop-blur-2xl rounded-xl p-2 shadow-md border border-white/30">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab("posts")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-all cursor-pointer text-sm sm:text-base ${
                    activeTab === "posts"
                      ? "bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Posts</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab("users")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-semibold transition-all cursor-pointer text-sm sm:text-base ${
                    activeTab === "users"
                      ? "bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </motion.button>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {activeTab === "posts" && (
                  <motion.div
                    key="posts"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PostsTable initialPosts={initialPosts} onRefresh={handleRefresh} statusFilter={statusFilter} socialFilter={socialFilter} />
                  </motion.div>
                )}

                {activeTab === "users" && (
                  <motion.div
                    key="users"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <UsersTable initialUsers={initialUsers} onRefresh={handleRefresh} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

        {/* Modals */}
        {showCreatePost && (
          <CreatePostModal
            onClose={() => setShowCreatePost(false)}
            onSuccess={() => {
              setShowCreatePost(false);
              handleRefresh();
            }}
          />
        )}

        {showCreateUser && (
          <CreateUserModal
            onClose={() => setShowCreateUser(false)}
            onSuccess={() => {
              setShowCreateUser(false);
              handleRefresh();
            }}
          />
        )}

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


