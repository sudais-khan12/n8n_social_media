"use server";

import { cookies } from "next/headers";

interface SessionData {
  id: string;
  role: string;
  username: string;
}

export async function getCurrentUser(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return null;
    }

    const session = JSON.parse(sessionCookie.value) as SessionData;
    return session;
  } catch (error) {
    return null;
  }
}

