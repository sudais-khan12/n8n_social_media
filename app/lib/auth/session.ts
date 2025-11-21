import { createServerClient } from "../supabase/server";

export interface CurrentUser {
  id: string;
  username: string;
  role: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createServerClient();

    // Get the current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // Return null if no session or error
    if (sessionError || !session || !session.user) {
      return null;
    }

    // Extract user information from session
    const user = session.user;
    const userMetadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};

    // Get role from app_metadata (preferred) or user_metadata
    const role = appMetadata.role || userMetadata.role || "user";

    // Get username from user_metadata
    const username = userMetadata.username || user.email?.split("@")[0] || "";

    // Return user info
    return {
      id: user.id,
      username: username,
      role: role,
    };
  } catch (error) {
    // Return null on any error
    return null;
  }
}
