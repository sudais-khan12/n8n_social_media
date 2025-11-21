"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

interface Post {
  id: string;
  heading: string;
  comment: string | null;
}

interface CommentModalProps {
  post: Post;
  onClose: () => void;
}

export default function CommentModal({ post, onClose }: CommentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Disapproval Comment</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Post Heading</h3>
            <p className="text-slate-900">{post.heading}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Comment</h3>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{post.comment || "No comment provided"}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
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


