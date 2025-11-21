"use server";

import { createClient } from "@supabase/supabase-js";
import { hash } from "bcryptjs";

interface User {
  id: string;
  username: string;
  role: string;
  password_hash: string;
  created_at?: string;
}

interface CreateUserInput {
  username: string;
  role: "admin" | "user";
}

interface UpdateUserInput {
  username?: string;
  role?: "admin" | "user";
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
 * Create a new user
 * @param input - User creation data
 * @returns Created user (without password_hash)
 */
export async function createUser(input: CreateUserInput) {
  try {
    const { username, role } = input;

    // Validate input
    if (!username || !role) {
      throw new Error("Username and role are required");
    }

    if (role !== "admin" && role !== "user") {
      throw new Error("Role must be either 'admin' or 'user'");
    }

    // Check if username already exists
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Hash default password
    const defaultPassword = "password123";
    const passwordHash = await hash(defaultPassword, 10);

    // Create user
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({
        username,
        role,
        password_hash: passwordHash,
      })
      .select("id, username, role, created_at")
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Update a user
 * @param userId - User ID (UUID)
 * @param input - User update data
 * @returns Updated user
 */
export async function updateUser(userId: string, input: UpdateUserInput) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { username, role } = input;

    if (!username && !role) {
      throw new Error("At least one field (username or role) must be provided");
    }

    if (role && role !== "admin" && role !== "user") {
      throw new Error("Role must be either 'admin' or 'user'");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (checkError || !existingUser) {
      throw new Error("User not found");
    }

    // Get existing username for comparison
    const { data: existingUserData } = await supabaseAdmin
      .from("users")
      .select("username")
      .eq("id", userId)
      .single();

    // If username is being updated, check if it's already taken
    if (username && username !== existingUserData?.username) {
      const { data: usernameExists } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (usernameExists) {
        throw new Error("Username already exists");
      }
    }

    // Build update object
    const updates: { username?: string; role?: string } = {};
    if (username) updates.username = username;
    if (role) updates.role = role;

    // Update user
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select("id, username, role, created_at")
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Delete a user (cascades to delete all posts)
 * @param userId - User ID (UUID)
 * @returns Success status
 */
export async function deleteUser(userId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (checkError || !existingUser) {
      throw new Error("User not found");
    }

    // Delete user (posts will be cascade deleted due to foreign key constraint)
    const { error } = await supabaseAdmin.from("users").delete().eq("id", userId);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return {
      success: true,
      message: "User and all associated posts deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * List all users
 * @returns Array of all users (without password_hash)
 */
export async function listUsers() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, username, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return {
      success: true,
      data: users || [],
    };
  } catch (error) {
    console.error("Error listing users:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      data: [],
    };
  }
}

/**
 * Get a single user by ID
 * @param userId - User ID (UUID)
 * @returns User data (without password_hash)
 */
export async function getUserById(userId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, username, role, created_at")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    if (!user) {
      throw new Error("User not found");
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

