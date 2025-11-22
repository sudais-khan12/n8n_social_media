import { listAllPosts } from "@/app/server/admin/posts";
import { listUsers } from "@/app/server/admin/users";
import { getCurrentUser } from "@/app/server/auth/getCurrentUser";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const [postsResult, usersResult, currentUser] = await Promise.all([
    listAllPosts(),
    listUsers(),
    getCurrentUser(),
  ]);

  const posts = postsResult.success ? postsResult.data : [];
  const users = usersResult.success ? usersResult.data : [];
  const username = currentUser?.username || "Admin";

  return (
    <AdminDashboard initialPosts={posts} initialUsers={users} username={username} />
  );
}
