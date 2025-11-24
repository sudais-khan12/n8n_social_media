"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, FileText, User as UserIcon, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserById } from "@/app/server/admin/users";
import { listPostsByUser } from "@/app/server/admin/posts";
import EditPostModal from "../../EditPostModal";

// Social Media Icons Component
const SocialMediaIcons = ({ social }: { social: string }) => {
  if (!social) return null;
  
  const socialLower = social.toLowerCase();
  const icons: React.ReactElement[] = [];

  if (socialLower.includes("facebook")) {
    icons.push(
      <svg
        key="facebook"
        className="w-5 h-5"
        fill="#1877F2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  if (socialLower.includes("linkedin")) {
    icons.push(
      <svg
        key="linkedin"
        className="w-5 h-5"
        fill="#0077B5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }

  if (socialLower.includes("gbp")) {
    icons.push(
      <svg
        key="gbp"
        className="w-5 h-5"
        fill="#EA4335"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.5 8.5c0-2.485-2.015-4.5-4.5-4.5S8.5 6.015 8.5 8.5c0 2.485 2.015 4.5 4.5 4.5s4.5-2.015 4.5-4.5zM13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13S20.18 0 13 0zm0 23C6.925 23 2 18.075 2 12S6.925 1 13 1s11 4.925 11 11-4.925 11-11 11z" />
        <path d="M12.5 6.5h-2v2h-2v2h2v2h2v-2h2v-2h-2v-2z" />
      </svg>
    );
  }

  if (icons.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      {icons.map((icon) => icon)}
    </div>
  );
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, [userId]);

  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (!searchQuery.trim()) {
        setIsSearching(false);
      }
    };
  }, [searchQuery]);

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return posts;
    }

    const query = debouncedSearchQuery.toLowerCase();
    return posts.filter((post) => {
      const matchesHeading = post.heading?.toLowerCase().includes(query);
      const matchesCaption = post.caption?.toLowerCase().includes(query);
      const matchesStatus = post.status?.toLowerCase().includes(query);
      const matchesSocial = post.social?.toLowerCase().includes(query);
      const matchesHashtags = post.hashtags?.some((tag) => tag.toLowerCase().includes(query));
      return matchesHeading || matchesCaption || matchesStatus || matchesSocial || matchesHashtags;
    });
  }, [posts, debouncedSearchQuery]);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
              All Posts ({filteredPosts.length}{searchQuery && ` of ${posts.length}`})
            </h2>
            
            {/* Search Bar */}
            {posts.length > 0 && (
              <div className="relative w-full sm:w-auto sm:min-w-[300px]">
                {isSearching ? (
                  <Loader2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />
                ) : (
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                )}
                <input
                  type="text"
                  placeholder="Search posts by title, caption, status, social..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 transition-all hover:shadow-md"
                />
              </div>
            )}
          </div>

          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 p-12 text-center"
            >
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">This user has no posts yet.</p>
            </motion.div>
          ) : filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 p-12 text-center"
            >
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No posts found matching your search.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredPosts.map((post, index) => (
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
                        className="mb-4 overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center min-h-[200px] max-h-[300px]"
                      >
                        <img
                          src={post.image_url}
                          alt={post.heading}
                          className="w-full h-full max-h-[300px] object-contain rounded-xl shadow-lg border-2 border-white/50 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </motion.div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2 flex-1">
                        {post.heading}
                      </h3>
                      <div className="flex-shrink-0">
                        <SocialMediaIcons social={post.social} />
                      </div>
                    </div>
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

