"use server";

import { createClient } from "@supabase/supabase-js";

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
}

interface CreatePostInput {
  user_id: string;
  heading: string;
  caption: string;
  hookline: string;
  cta: string;
  hashtags: string[];
  social: string[];
  image_url?: string | null;
}

interface UpdatePostInput {
  heading?: string;
  caption?: string;
  hookline?: string;
  cta?: string;
  hashtags?: string[];
  social?: string[];
  image_url?: string | null;
  status?: string; // Allow status update for auto-update logic (when image is added/removed)
  comment?: string | null; // Allow comment update (e.g., clear comment when rejected post is updated)
}

interface UpdatePostStatusInput {
  status: "approved" | "rejected";
  comment?: string | null;
}

/**
 * Get Supabase admin client
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a new post
 * @param input - Post creation data
 * @returns Created post
 */
export async function createPost(input: CreatePostInput) {
  try {
    const {
      user_id,
      heading,
      caption,
      hookline,
      cta,
      hashtags,
      social,
      image_url,
    } = input;

    // Validate input
    if (!user_id || !heading || !caption || !hookline || !cta) {
      throw new Error(
        "user_id, heading, caption, hookline, and cta are required"
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      throw new Error("User not found");
    }

    // Validate arrays
    const hashtagsArray = Array.isArray(hashtags) ? hashtags : [];
    const socialArray = Array.isArray(social) ? social : [];

    // Admin always creates posts as "draft"
    // Status will change to "pending" when user uploads an image
    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .insert({
        user_id,
        heading,
        caption,
        hookline,
        cta,
        hashtags: hashtagsArray,
        social: socialArray,
        status: "draft", // Always draft when admin creates
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Update a post (does NOT update status - use updatePostStatus for that)
 * @param postId - Post ID (UUID)
 * @param input - Post update data
 * @returns Updated post
 */
export async function updatePost(postId: string, input: UpdatePostInput) {
  try {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    const {
      heading,
      caption,
      hookline,
      cta,
      hashtags,
      social,
      image_url,
      status,
      comment,
    } = input;

    const supabaseAdmin = getSupabaseAdmin();

    // Check if post exists
    const { data: existingPost, error: checkError } = await supabaseAdmin
      .from("posts")
      .select("id, posted_at")
      .eq("id", postId)
      .single();

    if (checkError || !existingPost) {
      throw new Error("Post not found");
    }

    // Build update object
    const updates: any = {};
    if (heading !== undefined) updates.heading = heading;
    if (caption !== undefined) updates.caption = caption;
    if (hookline !== undefined) updates.hookline = hookline;
    if (cta !== undefined) updates.cta = cta;
    if (hashtags !== undefined)
      updates.hashtags = Array.isArray(hashtags) ? hashtags : [];
    if (social !== undefined)
      updates.social = Array.isArray(social) ? social : [];
    if (image_url !== undefined) updates.image_url = image_url;
    // Allow status update only for auto-update logic (when image is added/removed)
    if (status !== undefined) updates.status = status;
    // Allow comment update (e.g., clear comment when rejected post is updated)
    if (comment !== undefined) updates.comment = comment;

    // Update post
    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .update(updates)
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error updating post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Update post status (only for pending posts)
 * @param postId - Post ID (UUID)
 * @param input - Status update data
 * @returns Updated post
 */
export async function updatePostStatus(
  postId: string,
  input: UpdatePostStatusInput
) {
  try {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    const { status, comment } = input;

    // Validate status
    if (status !== "approved" && status !== "rejected") {
      throw new Error("Status must be either 'approved' or 'rejected'");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if post exists and is pending
    const { data: existingPost, error: checkError } = await supabaseAdmin
      .from("posts")
      .select("id, status, posted_at")
      .eq("id", postId)
      .single();

    if (checkError || !existingPost) {
      throw new Error("Post not found");
    }

    // Only allow status update for pending posts
    if (existingPost.status !== "pending") {
      throw new Error(
        `Cannot update status. Post is currently "${existingPost.status}". Only pending posts can be approved or rejected.`
      );
    }

    // Build update object
    const updates: any = {
      status,
    };

    // Add comment if provided (especially for rejected posts)
    if (comment !== undefined) {
      updates.comment = comment || null;
    }

    // If status is being set to "posted", set posted_at
    if (status === "approved") {
      // Note: "approved" doesn't set posted_at - that happens when actually posted
      // But if you want to track when it was approved, you could add an approved_at field
    }

    // Update post
    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .update(updates)
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post status: ${error.message}`);
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error updating post status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Delete a post
 * @param postId - Post ID (UUID)
 * @returns Success status
 */
export async function deletePost(postId: string) {
  try {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if post exists
    const { data: existingPost, error: checkError } = await supabaseAdmin
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (checkError || !existingPost) {
      throw new Error("Post not found");
    }

    // Delete post
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", postId);

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }

    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * List all posts for a specific user
 * @param userId - User ID (UUID)
 * @returns Array of posts for the user
 */
export async function listPostsByUser(userId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new Error("User not found");
    }

    // Fetch posts for user
    const { data: posts, error } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return {
      success: true,
      data: posts || [],
    };
  } catch (error) {
    console.error("Error listing posts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      data: [],
    };
  }
}

/**
 * List all posts (across all users) with user info
 * @returns Array of all posts with user information
 */
export async function listAllPosts() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: posts, error } = await supabaseAdmin
      .from("posts")
      .select(
        `
        *,
        users (
          id,
          username
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return {
      success: true,
      data: posts || [],
    };
  } catch (error) {
    console.error("Error listing posts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      data: [],
    };
  }
}

/**
 * Get a single post by ID
 * @param postId - Post ID (UUID)
 * @returns Post data
 */
export async function getPostById(postId: string) {
  try {
    if (!postId) {
      throw new Error("Post ID is required");
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch post: ${error.message}`);
    }

    if (!post) {
      throw new Error("Post not found");
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
