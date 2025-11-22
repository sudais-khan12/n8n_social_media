"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, FileText, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserById } from "@/app/server/admin/users";
import { listPostsByUser } from "@/app/server/admin/posts";
import EditPostModal from "../../EditPostModal";

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userResult, postsResult] = await Promise.all([
        getUserById(userId),
        listPostsByUser(userId),
      ]);

      if (!userResult.success) {
        setError(userResult.error || "Failed to load user");
        return;
      }

      if (!postsResult.success) {
        setError(postsResult.error || "Failed to load posts");
        return;
      }

      if (!userResult.data) {
        setError("User data not found");
        return;
      }

      setUser(userResult.data);
      setPosts(postsResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "posted":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 p-8"
          >
            <p className="text-red-600 font-semibold mb-4">{error || "User not found"}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard/admin")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:via-blue-700 hover:to-purple-700 transition-all shadow-md font-semibold cursor-pointer"
            >
              Back to Admin Dashboard
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard/admin")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors group font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </motion.button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent mb-2">User Details</h1>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{user.username}</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 font-medium">Role:</span>{" "}
                    <span
                      className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${
                        user.role === "admin"
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Created:</span>{" "}
                    <span className="text-slate-900 font-semibold">
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent mb-6">
            All Posts ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 p-12 text-center"
            >
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">This user has no posts yet.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => setEditingPost(post)}
                    className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 p-4 cursor-pointer hover:shadow-lg transition-all group"
                  >
                    {post.image_url && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="mb-4 overflow-hidden rounded-xl"
                      >
                        <img
                          src={post.image_url}
                          alt={post.heading}
                          className="w-full h-48 object-cover rounded-xl shadow-lg border-2 border-white/50 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </motion.div>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      {post.heading}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(
                          post.status
                        )}`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>
                        <span className="font-semibold">Created:</span> {formatDate(post.created_at)}
                      </p>
                      <p>
                        <span className="font-semibold">Updated:</span> {formatDate(post.updated_at)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSuccess={() => {
            setEditingPost(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

