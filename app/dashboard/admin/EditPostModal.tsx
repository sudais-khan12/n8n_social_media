"use client";

import { useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { updatePost } from "@/app/server/admin/posts";
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
}

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPostModal({
  post,
  onClose,
  onSuccess,
}: EditPostModalProps) {
  const [formData, setFormData] = useState({
    heading: post.heading,
    caption: post.caption,
    hookline: post.hookline,
    cta: post.cta,
    hashtags: post.hashtags.join(", "),
    social: post.social.join(", "),
    image_url: post.image_url ?? "",
  });
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    post.image_url
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      
      // Create preview using URL.createObjectURL
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
    setNewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setNewImage(null);
    setFormData({ ...formData, image_url: "" });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Auto-update status to 'draft' when image is removed
    // This will be handled in the submit function
  };

  const uploadImageToStorage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to upload image");
    }

    return result.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let imageUrl: string | null = formData.image_url || null;

      // Upload new image if provided
      if (newImage) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImageToStorage(newImage);
        } catch (uploadError) {
          throw uploadError;
        } finally {
          setUploadingImage(false);
        }
      }

      // Auto-update status based on image state
      let newStatus: string | undefined = undefined;
      let newComment: string | null | undefined = undefined;
      const hadImage = !!post.image_url;
      const hasImage = !!imageUrl;
      
      // If post is rejected, change status to pending and clear comment when updated
      if (post.status === "rejected") {
        newStatus = "pending";
        newComment = null;
      } else if (hasImage && !hadImage) {
        // Image was just uploaded - set to pending
        newStatus = "pending";
      } else if (!hasImage && hadImage) {
        // Image was removed - set to draft
        newStatus = "draft";
      }

      // Update post with auto-status update
      const result = await updatePost(post.id, {
        heading: formData.heading,
        caption: formData.caption,
        hookline: formData.hookline,
        cta: formData.cta,
        hashtags: formData.hashtags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        social: formData.social
          .split(",")
          .map((platform) => platform.trim())
          .filter((platform) => platform.length > 0),
        image_url: imageUrl,
        status: newStatus,
        comment: newComment,
      });

      if (result.success) {
        // Cleanup preview URL
        if (imagePreview && imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreview);
        }
        onSuccess();
      } else {
        setError(result.error || "Failed to update post");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Edit Post</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-sm text-slate-700">
              <strong>Status:</strong> <span className="font-semibold">{post.status}</span> (Use status update controls in the posts table to change status)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.heading}
              onChange={(e) =>
                setFormData({ ...formData, heading: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Caption <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.caption}
              onChange={(e) =>
                setFormData({ ...formData, caption: e.target.value })
              }
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hookline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hookline}
              onChange={(e) =>
                setFormData({ ...formData, hookline: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              CTA <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.cta}
              onChange={(e) =>
                setFormData({ ...formData, cta: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hashtags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.hashtags}
                onChange={(e) =>
                  setFormData({ ...formData, hashtags: e.target.value })
                }
                placeholder="#tag1, #tag2"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Social Platforms (comma-separated)
              </label>
              <input
                type="text"
                value={formData.social}
                onChange={(e) =>
                  setFormData({ ...formData, social: e.target.value })
                }
                placeholder="twitter, facebook"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Image URL or Upload New Image
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 mb-2"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="edit-image-upload"
              className="hidden"
            />
            <label
              htmlFor="edit-image-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors border border-indigo-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {newImage ? "Change Image" : "Upload New Image"}
            </label>
            {(newImage || formData.image_url) && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="ml-2 text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-lg border border-slate-300 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            {uploadingImage && (
              <p className="mt-2 text-sm text-indigo-600">Uploading image...</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingImage}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/50"
            >
              {isLoading ? "Saving..." : uploadingImage ? "Uploading..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
