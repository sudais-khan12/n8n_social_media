"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

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
 * Get current user from session cookie
 */
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value);
    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch all posts for the logged-in user
 * @returns Array of all posts for the user
 */
export async function getUserPosts() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "User not authenticated",
        data: [],
      };
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch all posts for the user (excluding draft posts)
    const { data: posts, error } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "draft")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return {
      success: true,
      data: posts || [],
    };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      data: [],
    };
  }
}

/**
 * Approve a post (update status to 'approved')
 * @param postId - Post ID (UUID)
 * @returns Success status
 */
export async function approvePost(postId: string) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    if (!postId) {
      return {
        success: false,
        error: "Post ID is required",
      };
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if post exists and belongs to the user
    const { data: post, error: checkError } = await supabaseAdmin
      .from("posts")
      .select("id, user_id")
      .eq("id", postId)
      .single();

    if (checkError || !post) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    if (post.user_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to approve this post",
      };
    }

    // Update post status to approved
    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update({
        status: "approved",
        comment: null, // Clear any previous comments
      })
      .eq("id", postId);

    if (updateError) {
      throw new Error(`Failed to approve post: ${updateError.message}`);
    }

    return {
      success: true,
      message: "Post approved successfully",
    };
  } catch (error) {
    console.error("Error approving post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Disapprove a post (update status to 'rejected' with comment)
 * @param postId - Post ID (UUID)
 * @param comment - Mandatory comment explaining disapproval
 * @returns Success status
 */
export async function disapprovePost(postId: string, comment: string) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    if (!postId) {
      return {
        success: false,
        error: "Post ID is required",
      };
    }

    if (!comment || comment.trim().length === 0) {
      return {
        success: false,
        error: "Comment is required for disapproval",
      };
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if post exists and belongs to the user
    const { data: post, error: checkError } = await supabaseAdmin
      .from("posts")
      .select("id, user_id")
      .eq("id", postId)
      .single();

    if (checkError || !post) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    if (post.user_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to disapprove this post",
      };
    }

    // Update post status to rejected with comment
    const { error: updateError } = await supabaseAdmin
      .from("posts")
      .update({
        status: "rejected",
        comment: comment.trim(),
      })
      .eq("id", postId);

    if (updateError) {
      throw new Error(`Failed to disapprove post: ${updateError.message}`);
    }

    return {
      success: true,
      message: "Post disapproved successfully",
    };
  } catch (error) {
    console.error("Error disapproving post:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Create a new post for the logged-in user
 * @param input - Post creation data
 * @returns Created post
 */
export async function createUserPost(input: {
  heading: string;
  caption: string;
  hookline: string;
  cta: string;
  hashtags: string[];
  social: string;
  image_url?: string | null;
}) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const { heading, caption, hookline, cta, hashtags, social, image_url } = input;

    // Validate input
    if (!heading || !caption || !hookline || !cta) {
      return {
        success: false,
        error: "heading, caption, hookline, and cta are required",
      };
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Validate arrays
    const hashtagsArray = Array.isArray(hashtags) ? hashtags : [];
    const socialString = typeof social === 'string' ? social : '';

    // User creates posts as "draft", status changes to "pending" when image is uploaded
    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .insert({
        user_id: user.id,
        heading,
        caption,
        hookline,
        cta,
        hashtags: hashtagsArray,
        social: socialString,
        status: image_url ? "pending" : "draft",
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
 * Update a post for the logged-in user
 * @param postId - Post ID (UUID)
 * @param input - Post update data
 * @returns Updated post
 */
export async function updateUserPost(
  postId: string,
  input: {
    heading?: string;
    caption?: string;
    hookline?: string;
    cta?: string;
    hashtags?: string[];
    social?: string;
    image_url?: string | null;
    status?: string;
  }
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    if (!postId) {
      return {
        success: false,
        error: "Post ID is required",
      };
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if post exists and belongs to the user
    const { data: existingPost, error: checkError } = await supabaseAdmin
      .from("posts")
      .select("id, user_id, image_url, status")
      .eq("id", postId)
      .single();

    if (checkError || !existingPost) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    if (existingPost.user_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to update this post",
      };
    }

    // Build update object
    const updates: any = {};
    if (input.heading !== undefined) updates.heading = input.heading;
    if (input.caption !== undefined) updates.caption = input.caption;
    if (input.hookline !== undefined) updates.hookline = input.hookline;
    if (input.cta !== undefined) updates.cta = input.cta;
    if (input.hashtags !== undefined)
      updates.hashtags = Array.isArray(input.hashtags) ? input.hashtags : [];
    if (input.social !== undefined)
      updates.social = typeof input.social === 'string' ? input.social : '';
    if (input.image_url !== undefined) updates.image_url = input.image_url;
    if (input.status !== undefined) updates.status = input.status;

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
 * Delete a post for the logged-in user
 * @param postId - Post ID (UUID)
 * @returns Success status
 */
export async function deleteUserPost(postId: string) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    if (!postId) {
      return {
        success: false,
        error: "Post ID is required",
      };
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if post exists and belongs to the user
    const { data: existingPost, error: checkError } = await supabaseAdmin
      .from("posts")
      .select("id, user_id")
      .eq("id", postId)
      .single();

    if (checkError || !existingPost) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    if (existingPost.user_id !== user.id) {
      return {
        success: false,
        error: "You don't have permission to delete this post",
      };
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

