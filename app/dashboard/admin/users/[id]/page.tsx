"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
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
  social: string[];
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">{error || "User not found"}</p>
            <button
              onClick={() => router.push("/dashboard/admin")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">User Details</h1>
        </div>

        {/* User Info Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{user.username}</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Role:</span>{" "}
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Created:</span>{" "}
                  <span className="text-slate-900">
                    {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            All Posts ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <p className="text-slate-500">This user has no posts yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setEditingPost(post)}
                  className="bg-white/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-4 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  {post.image_url && (
                    <div className="mb-4">
                      <img
                        src={post.image_url}
                        alt={post.heading}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                    {post.heading}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        post.status
                      )}`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>
                      <span className="font-medium">Created:</span> {formatDate(post.created_at)}
                    </p>
                    <p>
                      <span className="font-medium">Updated:</span> {formatDate(post.updated_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

