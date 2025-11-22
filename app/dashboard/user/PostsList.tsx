"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

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
import { motion, AnimatePresence } from "framer-motion";
import PostDetailModal from "./PostDetailModal";
import DisapproveModal from "./DisapproveModal";
import { approvePost, disapprovePost } from "@/app/server/user/posts";
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

interface PostsListProps {
  initialPosts: Post[];
  onRefresh: () => void;
  statusFilter?: string | null;
  socialFilter?: string | null;
}

export default function PostsList({
  initialPosts,
  onRefresh,
  statusFilter = null,
  socialFilter = null,
}: PostsListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [viewingPostDetail, setViewingPostDetail] = useState<Post | null>(null);
  const [disapprovePostId, setDisapprovePostId] = useState<string | null>(null);
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Sync posts when initialPosts changes (from realtime updates)
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter posts based on search query, status filter, and social filter
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    // Apply social filter
    if (socialFilter) {
      filtered = filtered.filter((post) => {
        const socialValue = post.social?.toLowerCase() || '';
        return socialValue.includes(socialFilter.toLowerCase());
      });
    }

    // Apply search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        const matchesTitle = post.heading?.toLowerCase().includes(query);
        const matchesStatus = post.status?.toLowerCase().includes(query);
        const matchesSocial = post.social?.toLowerCase().includes(query);
        return matchesTitle || matchesStatus || matchesSocial;
      });
    }

    return filtered;
  }, [posts, debouncedSearchQuery, statusFilter, socialFilter]);

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

  const handleApprove = async (postId: string) => {
    setLoadingPostId(postId);
    setError(null);
    setSuccess(null);

    try {
      const result = await approvePost(postId);

      if (result.success) {
        setSuccess(result.message || "Post approved successfully");
        // Update post status in local state
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, status: "approved", comment: null }
              : post
          )
        );
        // Refresh page data
        setTimeout(() => {
          onRefresh();
        }, 1000);
      } else {
        setError(result.error || "Failed to approve post");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoadingPostId(null);
    }
  };

  const handleDisapproveClick = (postId: string) => {
    setDisapprovePostId(postId);
    setError(null);
    setSuccess(null);
  };

  const handleDisapproveConfirm = async (postId: string, comment: string) => {
    setLoadingPostId(postId);
    setError(null);
    setSuccess(null);

    try {
      const result = await disapprovePost(postId, comment);

      if (result.success) {
        setSuccess(result.message || "Post rejected successfully");
        setDisapprovePostId(null);
        // Update post status in local state
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, status: "rejected", comment: comment.trim() }
              : post
          )
        );
        // Refresh page data
        setTimeout(() => {
          onRefresh();
        }, 1000);
      } else {
        setError(result.error || "Failed to reject post");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoadingPostId(null);
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

  return (
    <>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts by title, status, or social type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 transition-all hover:shadow-md"
          />
        </div>
      </motion.div>

      {/* Desktop Grid View */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 overflow-hidden hover:shadow-lg transition-all"
            >
            {/* Post Image */}
            {post.image_url && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="aspect-video bg-slate-100 relative overflow-hidden cursor-pointer rounded-t-2xl"
                onClick={() => setViewingPostDetail(post)}
              >
                <img
                  src={post.image_url}
                  alt={post.heading}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e4e4e7' width='400' height='300'/%3E%3Ctext fill='%23918196' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-sm border-2 border-white/50 ${getStatusColor(
                      post.status
                    )}`}
                  >
                    {post.status}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Post Content */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3
                  className="text-lg font-bold text-slate-900 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors flex-1"
                  onClick={() => setViewingPostDetail(post)}
                >
                  {post.heading}
                </h3>
                <div className="flex-shrink-0">
                  <SocialMediaIcons social={post.social} />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {post.caption}
              </p>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Created: {formatDate(post.created_at)}
              </p>

              {/* Rejection Comment */}
              {post.status === "rejected" && post.comment && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl"
                >
                  <p className="text-xs font-bold text-red-800 mb-1">
                    Rejection Comment:
                  </p>
                  <p className="text-sm text-red-700">{post.comment}</p>
                </motion.div>
              )}

              {/* Action Buttons */}
              {post.status !== "approved" && post.status !== "rejected" && post.status !== "posted" && (
                <div className="flex gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApprove(post.id)}
                    disabled={loadingPostId === post.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-semibold cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {loadingPostId === post.id ? "Approving..." : "Approve"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDisapproveClick(post.id)}
                    disabled={loadingPostId === post.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-semibold cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </motion.button>
                </div>
              )}

              {/* Already Approved/Rejected/Posted Message */}
              {(post.status === "approved" || post.status === "rejected" || post.status === "posted") && (
                <div className="mt-4 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    {post.status === "approved"
                      ? "✓ Post has been approved"
                      : post.status === "rejected"
                      ? "✗ Post has been rejected"
                      : "✓ Post has been posted"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center py-16 text-slate-500 bg-white/70 backdrop-blur-xl rounded-2xl"
          >
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="font-medium">
              {debouncedSearchQuery.trim() ? "No results found." : "No posts found."}
            </p>
          </motion.div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        <AnimatePresence>
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 overflow-hidden"
            >
              <div className="flex gap-4 p-4">
                {post.image_url && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex-shrink-0 cursor-pointer"
                    onClick={() => setViewingPostDetail(post)}
                  >
                    <img
                      src={post.image_url}
                      alt={post.heading}
                      className="h-24 w-24 object-cover rounded-xl shadow-lg border-2 border-white/50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </motion.div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="text-sm font-bold text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition-colors flex-1"
                      onClick={() => setViewingPostDetail(post)}
                    >
                      {post.heading}
                    </h3>
                    <div className="flex-shrink-0">
                      <SocialMediaIcons social={post.social} />
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${getStatusColor(
                        post.status
                      )}`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2 font-medium">
                    {formatDate(post.created_at)}
                  </p>

                  {/* Rejection Comment */}
                  {post.status === "rejected" && post.comment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-3 p-2 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl"
                    >
                      <p className="text-xs font-bold text-red-800 mb-1">
                        Rejection Comment:
                      </p>
                      <p className="text-xs text-red-700 line-clamp-2">{post.comment}</p>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  {post.status !== "approved" && post.status !== "rejected" && post.status !== "posted" && (
                    <div className="flex gap-2 mt-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(post.id)}
                        disabled={loadingPostId === post.id}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-semibold shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDisapproveClick(post.id)}
                        disabled={loadingPostId === post.id}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-semibold shadow-sm cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </motion.button>
                    </div>
                  )}

                  {/* Already Approved/Rejected/Posted Message */}
                  {(post.status === "approved" || post.status === "rejected" || post.status === "posted") && (
                    <div className="mt-3 text-center">
                      <p className="text-xs font-semibold text-slate-600">
                        {post.status === "approved"
                          ? "✓ Approved"
                          : post.status === "rejected"
                          ? "✗ Rejected"
                          : "✓ Posted"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-slate-500 bg-white/70 backdrop-blur-xl rounded-2xl"
          >
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="font-medium">
              {debouncedSearchQuery.trim() ? "No results found." : "No posts found."}
            </p>
          </motion.div>
        )}
      </div>

      {viewingPostDetail && (
        <PostDetailModal
          post={viewingPostDetail}
          onClose={() => setViewingPostDetail(null)}
        />
      )}

      {disapprovePostId && (
        <DisapproveModal
          postId={disapprovePostId}
          onClose={() => setDisapprovePostId(null)}
          onConfirm={handleDisapproveConfirm}
          isLoading={loadingPostId === disapprovePostId}
        />
      )}

      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}
    </>
  );
}
