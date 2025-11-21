"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

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
  created_at: string;
  updated_at: string;
}

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
}

export default function PostDetailModal({
  post,
  onClose,
}: PostDetailModalProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Post Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image */}
          {post.image_url && (
            <div>
              <img
                src={post.image_url}
                alt={post.heading}
                className="w-full h-64 object-cover rounded-lg border border-slate-300 shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e4e4e7' width='400' height='300'/%3E%3Ctext fill='%23918196' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3EImage not available%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          )}

          {/* Status and Dates */}
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Status</p>
              <span
                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  post.status
                )}`}
              >
                {post.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Created</p>
              <p className="text-sm text-slate-900">
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Updated</p>
              <p className="text-sm text-slate-900">
                {new Date(post.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Heading */}
          <div>
            <p className="text-sm text-slate-500 mb-1">Heading</p>
            <p className="text-lg font-semibold text-slate-900">{post.heading}</p>
          </div>

          {/* Caption */}
          <div>
            <p className="text-sm text-slate-500 mb-1">Caption</p>
            <p className="text-slate-900 whitespace-pre-wrap">{post.caption}</p>
          </div>

          {/* Hookline */}
          <div>
            <p className="text-sm text-slate-500 mb-1">Hookline</p>
            <p className="text-slate-900 font-medium">{post.hookline}</p>
          </div>

          {/* CTA */}
          <div>
            <p className="text-sm text-slate-500 mb-1">Call to Action</p>
            <p className="text-slate-900">{post.cta}</p>
          </div>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-2">Hashtags</p>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Platforms */}
          {post.social && post.social.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-2">Social Platforms</p>
              <div className="flex flex-wrap gap-2">
                {post.social.map((platform, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Comment */}
          {post.status === "rejected" && post.comment && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-1">
                Disapproval Comment
              </p>
              <p className="text-red-700">{post.comment}</p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

