"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
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
  social: string[];
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
}

export default function PostsTable({
  initialPosts,
  onRefresh,
  statusFilter = null,
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

  // Filter posts based on search query and status filter
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    // Apply search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        const matchesTitle = post.heading?.toLowerCase().includes(query);
        const matchesStatus = post.status?.toLowerCase().includes(query);
        return matchesTitle || matchesStatus;
      });
    }

    return filtered;
  }, [posts, debouncedSearchQuery, statusFilter]);

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
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search posts by title or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Heading
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-indigo-50/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {post.users?.username || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 max-w-xs truncate">
                      {post.heading}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        post.status
                      )}`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.heading}
                        className="h-12 w-12 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No image</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(post.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === "rejected" && post.comment && (
                        <button
                          onClick={() => setViewingCommentPost(post)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View comment"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingPost(post)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeletingPostId(post.id)}
                        disabled={loading === post.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            {debouncedSearchQuery.trim() ? "No results found." : "No posts found. Create your first post!"}
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => setViewingPostDetail(post)}
            className="bg-white/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-4 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="flex gap-4">
              {post.image_url && (
                <div className="flex-shrink-0">
                  <img
                    src={post.image_url}
                    alt={post.heading}
                    className="h-20 w-20 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {post.heading}
                  </h3>
                  <span
                    className={`flex-shrink-0 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      post.status
                    )}`}
                  >
                    {post.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  {post.users?.username || "Unknown"}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {post.caption}
                </p>
                  <div className="flex items-center gap-2 mt-3">
                    {post.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUpdatingStatusPostId(post.id);
                        }}
                        className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition-colors"
                        title="Update Status"
                      >
                        Review
                      </button>
                    )}
                    {post.status === "rejected" && post.comment && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingCommentPost(post);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View comment"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPost(post);
                      }}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingPostId(post.id);
                      }}
                      disabled={loading === post.id}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
              </div>
            </div>
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white/70 backdrop-blur-lg rounded-xl">
            {debouncedSearchQuery.trim() ? "No results found." : "No posts found. Create your first post!"}
          </div>
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
