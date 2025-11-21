"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import PostsList from "./PostsList";
import {
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
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
  social: string[];
  image_url: string | null;
  status: string;
  comment: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserDashboardProps {
  initialPosts: Post[];
}

export default function UserDashboard({
  initialPosts,
}: UserDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
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
        () => {
          // Refresh the page data when posts change
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [router]);

  const handleRefresh = () => {
    router.refresh();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl">
              {/* Logo/Header */}
              <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-slate-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">My Posts</h1>
                    <p className="text-xs text-slate-500">Social Media</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 flex flex-col">
                <div className="space-y-2">
                  <button
                    onClick={() => setStatusFilter(null)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      statusFilter === null
                        ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/50"
                        : "text-slate-700 hover:bg-slate-100/80"
                    }`}
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>All Posts</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      statusFilter === "pending"
                        ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/50"
                        : "text-slate-700 hover:bg-slate-100/80"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span>Pending</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("approved")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      statusFilter === "approved"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50"
                        : "text-slate-700 hover:bg-slate-100/80"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Approved</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("rejected")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      statusFilter === "rejected"
                        ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/50"
                        : "text-slate-700 hover:bg-slate-100/80"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>Rejected</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("posted")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      statusFilter === "posted"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50"
                        : "text-slate-700 hover:bg-slate-100/80"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Posted</span>
                  </button>
                </div>
                {/* Change Password Button */}
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <KeyIcon className="w-5 h-5" />
                  <span>Change Password</span>
                </button>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-slate-700 hover:bg-red-50 hover:text-red-600 mt-auto"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Topbar */}
          <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm z-10">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">My Posts</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Review and approve or reject your posts
                </p>
              </div>
            </div>
            
            {/* Mobile Filter Buttons */}
            <div className="lg:hidden px-6 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-4">
                <button
                  onClick={() => setStatusFilter(null)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    statusFilter === null
                      ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/50"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>All</span>
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    statusFilter === "pending"
                      ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/50"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span>Pending</span>
                </button>
                <button
                  onClick={() => setStatusFilter("approved")}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    statusFilter === "approved"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>Approved</span>
                </button>
                <button
                  onClick={() => setStatusFilter("rejected")}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    statusFilter === "rejected"
                      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/50"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>Rejected</span>
                </button>
                <button
                  onClick={() => setStatusFilter("posted")}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    statusFilter === "posted"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Posted</span>
                </button>
              </div>
              
              {/* Mobile Logout and Change Password */}
              <div className="flex gap-2 border-t border-slate-200/50 pt-4">
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <KeyIcon className="w-4 h-4" />
                  <span>Password</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <PostsList initialPosts={initialPosts} onRefresh={handleRefresh} statusFilter={statusFilter} />
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

