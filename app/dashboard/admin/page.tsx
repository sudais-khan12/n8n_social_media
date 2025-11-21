import { listAllPosts } from "@/app/server/admin/posts";
import { listUsers } from "@/app/server/admin/users";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const [postsResult, usersResult] = await Promise.all([
    listAllPosts(),
    listUsers(),
  ]);

  const posts = postsResult.success ? postsResult.data : [];
  const users = usersResult.success ? usersResult.data : [];

  return (
    <AdminDashboard initialPosts={posts} initialUsers={users} />
  );
}
