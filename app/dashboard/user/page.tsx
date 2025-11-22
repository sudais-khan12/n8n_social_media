import { getUserPosts } from "@/app/server/user/posts";
import { getCurrentUser } from "@/app/server/auth/getCurrentUser";
import UserDashboard from "./UserDashboard";

export default async function UserPage() {
  const [result, currentUser] = await Promise.all([
    getUserPosts(),
    getCurrentUser(),
  ]);

  if (!result.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 p-8 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-slate-600">
              {result.error || "Failed to load posts"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const posts = result.data || [];
  const username = currentUser?.username || "User";

  return <UserDashboard initialPosts={posts} username={username} />;
}

