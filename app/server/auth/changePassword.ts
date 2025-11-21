"use server";

import { createClient } from "@supabase/supabase-js";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";

export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      return {
        success: false,
        error: "Current password and new password are required",
      };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        error: "New password must be at least 6 characters long",
      };
    }

    // Get session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const session = JSON.parse(sessionCookie.value);
    const userId = session.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return {
        success: false,
        error: "Server configuration error",
      };
    }

    // Create a service role client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("password_hash")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Hash new password
    const newPasswordHash = await hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_hash: newPasswordHash })
      .eq("id", userId);

    if (updateError) {
      return {
        success: false,
        error: `Failed to update password: ${updateError.message}`,
      };
    }

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

