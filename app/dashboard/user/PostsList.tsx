"use client";

import { useState, useEffect, useMemo } from "react";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
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
  social: string[];
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
}

export default function PostsList({
  initialPosts,
  onRefresh,
  statusFilter = null,
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

      {/* Desktop Grid View */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all"
          >
            {/* Post Image */}
            {post.image_url && (
              <div
                className="aspect-video bg-slate-100 relative overflow-hidden cursor-pointer"
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
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      post.status
                    )}`}
                  >
                    {post.status}
                  </span>
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="p-4">
              <h3
                className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => setViewingPostDetail(post)}
              >
                {post.heading}
              </h3>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {post.caption}
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Created: {formatDate(post.created_at)}
              </p>

              {/* Rejection Comment */}
              {post.status === "rejected" && post.comment && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-medium text-red-800 mb-1">
                    Rejection Comment:
                  </p>
                  <p className="text-sm text-red-700">{post.comment}</p>
                </div>
              )}

              {/* Action Buttons */}
              {post.status !== "approved" && post.status !== "rejected" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(post.id)}
                    disabled={loadingPostId === post.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-500/50 font-medium"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    {loadingPostId === post.id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleDisapproveClick(post.id)}
                    disabled={loadingPostId === post.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-red-500/50 font-medium"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}

              {/* Already Approved/Rejected Message */}
              {(post.status === "approved" || post.status === "rejected") && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-600">
                    {post.status === "approved"
                      ? "✓ Post has been approved"
                      : "✗ Post has been rejected"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white/70 backdrop-blur-lg rounded-xl">
            {debouncedSearchQuery.trim() ? "No results found." : "No posts found."}
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 overflow-hidden"
          >
            <div className="flex gap-4 p-4">
              {post.image_url && (
                <div
                  className="flex-shrink-0 cursor-pointer"
                  onClick={() => setViewingPostDetail(post)}
                >
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
                  <h3
                    className="text-sm font-semibold text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => setViewingPostDetail(post)}
                  >
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
                <p className="text-xs text-slate-500 mb-2">
                  {formatDate(post.created_at)}
                </p>

                {/* Rejection Comment */}
                {post.status === "rejected" && post.comment && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-medium text-red-800 mb-1">
                      Rejection Comment:
                    </p>
                    <p className="text-xs text-red-700 line-clamp-2">{post.comment}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {post.status !== "approved" && post.status !== "rejected" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={loadingPostId === post.id}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleDisapproveClick(post.id)}
                      disabled={loadingPostId === post.id}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                {/* Already Approved/Rejected Message */}
                {(post.status === "approved" || post.status === "rejected") && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-slate-600">
                      {post.status === "approved"
                        ? "✓ Approved"
                        : "✗ Rejected"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white/70 backdrop-blur-lg rounded-xl">
            {debouncedSearchQuery.trim() ? "No results found." : "No posts found."}
          </div>
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
