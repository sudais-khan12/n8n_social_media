"use server";

import { createClient } from "@supabase/supabase-js";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";

export async function loginUser(username: string, password: string) {
  try {
    // Validate input
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
      );
    }

    // Create a service role client to query the users table
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Query the users table for matching username
    const { data: user, error: queryError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (queryError || !user) {
      throw new Error("Invalid username or password");
    }

    // Compare password hash using bcrypt
    const isPasswordValid = await compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    // Get user role
    const userRole = user.role || "user";

    // Set secure HttpOnly cookie with user info
    const cookieStore = await cookies();
    const sessionData = {
      id: user.id,
      role: userRole,
      username: user.username,
    };

    // Set cookie with user session data
    cookieStore.set("session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Return user info
    return {
      id: user.id,
      username: user.username,
      role: userRole,
    };
  } catch (error) {
    // Re-throw with a user-friendly message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred during login");
  }
}
