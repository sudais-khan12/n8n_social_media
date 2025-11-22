"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Pencil,
  Trash2,
  Eye,
  Search,
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
import EditPostModal from "./EditPostModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import CommentModal from "./CommentModal";
import PostDetailModal from "./PostDetailModal";
import StatusUpdateModal from "./StatusUpdateModal";
import { deletePost } from "@/app/server/admin/posts";
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

interface PostsTableProps {
  initialPosts: Post[];
  onRefresh: () => void;
  statusFilter?: string | null;
  socialFilter?: string | null;
}

export default function PostsTable({
  initialPosts,
  onRefresh,
  statusFilter = null,
  socialFilter = null,
}: PostsTableProps) {
  const [posts, setPosts] = useState(initialPosts);

  // Sync posts when initialPosts changes (from realtime updates)
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [viewingCommentPost, setViewingCommentPost] = useState<Post | null>(
    null
  );
  const [viewingPostDetail, setViewingPostDetail] = useState<Post | null>(null);
  const [updatingStatusPostId, setUpdatingStatusPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

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

  const handleDelete = async (postId: string) => {
    setLoading(postId);
    try {
      const result = await deletePost(postId);
      if (result.success) {
        setPosts(posts.filter((p) => p.id !== postId));
        setDeletingPostId(null);
        setToast({ message: "Post deleted successfully!", type: "success" });
        onRefresh();
      } else {
        setToast({ message: result.error || "Failed to delete post", type: "error" });
      }
    } catch (error) {
      setToast({ message: "An error occurred while deleting the post", type: "error" });
    } finally {
      setLoading(null);
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

      {/* Desktop Table View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden md:block bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-50/80 via-blue-50/80 to-purple-50/80 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Heading
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              <AnimatePresence>
                {filteredPosts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-indigo-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        {post.users?.username || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-slate-900 max-w-xs truncate font-medium">
                          {post.heading}
                        </div>
                        <SocialMediaIcons social={post.social} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full ${getStatusColor(
                          post.status
                        )}`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.image_url ? (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="inline-block"
                        >
                          <img
                            src={post.image_url}
                            alt={post.heading}
                            className="h-14 w-14 object-cover rounded-xl shadow-lg border-2 border-white/50"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <ImageIcon className="w-4 h-4" />
                          <span>No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === "pending" && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setUpdatingStatusPostId(post.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-xl transition-colors shadow-sm cursor-pointer"
                            title="Review"
                          >
                            <FileText className="w-5 h-5" />
                          </motion.button>
                        )}
                        {post.status === "rejected" && post.comment && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setViewingCommentPost(post)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shadow-sm cursor-pointer"
                            title="View comment"
                          >
                            <Eye className="w-5 h-5" />
                          </motion.button>
                        )}
                        {post.status !== "posted" && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingPost(post)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setDeletingPostId(post.id)}
                              disabled={loading === post.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              {debouncedSearchQuery.trim() ? "No results found." : "No posts found. Create your first post!"}
            </p>
          </motion.div>
        )}
      </motion.div>

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
              onClick={() => setViewingPostDetail(post)}
              className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-md border border-white/30 p-4 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex gap-4">
                {post.image_url && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex-shrink-0"
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
                    <h3 className="text-sm font-bold text-slate-900 truncate flex-1">
                      {post.heading}
                    </h3>
                    {!post.image_url && (
                      <div className="flex-shrink-0">
                        <SocialMediaIcons social={post.social} />
                      </div>
                    )}
                    <span
                      className={`flex-shrink-0 inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${getStatusColor(
                        post.status
                      )}`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 font-medium">
                    {post.users?.username || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {post.caption}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {post.status === "pending" && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setUpdatingStatusPostId(post.id);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all shadow-sm cursor-pointer"
                        title="Update Status"
                      >
                        Review
                      </motion.button>
                    )}
                    {post.status === "rejected" && post.comment && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingCommentPost(post);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shadow-sm cursor-pointer"
                        title="View comment"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    )}
                    {post.status !== "posted" && (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPost(post);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingPostId(post.id);
                          }}
                          disabled={loading === post.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
                  </div>
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
              {debouncedSearchQuery.trim() ? "No results found." : "No posts found. Create your first post!"}
            </p>
          </motion.div>
        )}
      </div>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSuccess={() => {
            setEditingPost(null);
            onRefresh();
          }}
        />
      )}

      {deletingPostId && (
        <DeleteConfirmModal
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          onConfirm={() => handleDelete(deletingPostId)}
          onClose={() => setDeletingPostId(null)}
          isLoading={loading === deletingPostId}
        />
      )}

      {viewingCommentPost && (
        <CommentModal
          post={viewingCommentPost}
          onClose={() => setViewingCommentPost(null)}
        />
      )}

      {viewingPostDetail && (
        <PostDetailModal
          post={viewingPostDetail}
          onClose={() => setViewingPostDetail(null)}
        />
      )}

      {updatingStatusPostId && (
        <StatusUpdateModal
          postId={updatingStatusPostId}
          currentStatus={
            posts.find((p) => p.id === updatingStatusPostId)?.status || "pending"
          }
          onClose={() => setUpdatingStatusPostId(null)}
          onSuccess={() => {
            setUpdatingStatusPostId(null);
            onRefresh();
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
    </>
  );
}
