"use server";

import { createClient } from "@supabase/supabase-js";

interface PostWithUser {
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
  users: {
    id: string;
    username: string;
  };
}

export async function getAllPosts(): Promise<PostWithUser[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
      );
    }

    // Create a service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fetch all posts with user info
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

    return (posts as PostWithUser[]) || [];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred while fetching posts");
  }
}

export async function updatePost(
  postId: string,
  updates: {
    heading?: string;
    caption?: string;
    hookline?: string;
    cta?: string;
    hashtags?: string[];
    social?: string[];
    image_url?: string | null;
  }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabaseAdmin
      .from("posts")
      .update(updates)
      .eq("id", postId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred while updating the post");
  }
}

export async function deletePost(postId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error } = await supabaseAdmin.from("posts").delete().eq("id", postId);

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred while deleting the post");
  }
}


