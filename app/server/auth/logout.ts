"use server";

import { cookies } from "next/headers";

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    
    // Clear the session cookie
    cookieStore.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Error logging out:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

