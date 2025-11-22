"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

// Social Media Icons Component
const SocialMediaIcons = ({ social }: { social: string }) => {
  if (!social) return null;
  
  const socialLower = social.toLowerCase();
  const icons: React.ReactElement[] = [];

  if (socialLower.includes("facebook")) {
    icons.push(
      <svg
        key="facebook"
        className="w-6 h-6"
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
        className="w-6 h-6"
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
        className="w-6 h-6"
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
    <div className="flex items-center gap-2">
      {icons.map((icon) => icon)}
    </div>
  );
};

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
          {post.social && post.social.trim() && (
            <div>
              <p className="text-sm text-slate-500 mb-2">Social Platform</p>
              <div className="flex items-center gap-3">
                <SocialMediaIcons social={post.social} />
                <span className="text-slate-900 font-medium">{post.social}</span>
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

