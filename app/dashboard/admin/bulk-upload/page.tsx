import { listUsers } from "@/app/server/admin/users";
import { getCurrentUser } from "@/app/server/auth/getCurrentUser";
import BulkUploadForm from "./BulkUploadForm";

export default async function BulkUploadPage() {
  const [usersResult, currentUser] = await Promise.all([
    listUsers(),
    getCurrentUser(),
  ]);

  const users = usersResult.success ? usersResult.data : [];
  const username = currentUser?.username || "Admin";

  return <BulkUploadForm initialUsers={users} username={username} />;
}


