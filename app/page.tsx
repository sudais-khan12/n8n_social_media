import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/server/auth/getCurrentUser";

export default async function Home() {
  // Check if user is logged in
  const user = await getCurrentUser();

  if (user) {
    // User is logged in, redirect to their dashboard based on role
    if (user.role === "admin") {
      redirect("/dashboard/admin");
    } else {
      // Default to user dashboard for any other role
      redirect("/dashboard/user");
    }
  } else {
    // User is not logged in, redirect to login page
    redirect("/login");
  }
}
