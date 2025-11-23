import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/server/auth/getCurrentUser";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  // Check if user is already logged in
  const user = await getCurrentUser();

  if (user) {
    // User is already logged in, redirect to their dashboard
    if (user.role === "admin") {
      redirect("/dashboard/admin");
    } else {
      // Default to user dashboard for any other role
      redirect("/dashboard/user");
    }
  }

  // User is not logged in, show login form
  return <LoginForm />;
}
