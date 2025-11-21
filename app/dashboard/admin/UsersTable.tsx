"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import EditUserModal from "./EditUserModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Toast from "@/app/components/Toast";
import { deleteUser } from "@/app/server/admin/users";

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

interface UsersTableProps {
  initialUsers: User[];
  onRefresh: () => void;
}

export default function UsersTable({
  initialUsers,
  onRefresh,
}: UsersTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);

  // Sync users when initialUsers changes (from realtime updates)
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return users;
    }

    const query = debouncedSearchQuery.toLowerCase();
    return users.filter((user) => {
      return user.username?.toLowerCase().includes(query);
    });
  }, [users, debouncedSearchQuery]);

  const handleDelete = async (userId: string) => {
    setLoading(userId);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers(users.filter((u) => u.id !== userId));
        setDeletingUserId(null);
        setToast({ message: "User deleted successfully!", type: "success" });
        onRefresh();
      } else {
        setToast({ message: result.error || "Failed to delete user", type: "error" });
      }
    } catch (error) {
      setToast({ message: "An error occurred while deleting the user", type: "error" });
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCopyUserId = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedUserId(userId);
      setToast({ message: "User ID copied to clipboard!", type: "success" });
      setTimeout(() => setCopiedUserId(null), 2000);
    } catch (error) {
      setToast({ message: "Failed to copy User ID", type: "error" });
    }
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-indigo-50/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-mono text-slate-500">
                        {user.id}
                      </div>
                      <button
                        onClick={(e) => handleCopyUserId(user.id, e)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Copy User ID"
                      >
                        {copiedUserId === user.id ? (
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/admin/users/${user.id}`);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingUser(user);
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingUserId(user.id);
                        }}
                        disabled={loading === user.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            {debouncedSearchQuery.trim() ? "No results found." : "No users found. Create your first user!"}
          </div>
        )}
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            onRefresh();
          }}
        />
      )}

      {deletingUserId && (
        <DeleteConfirmModal
          title="Delete User"
          message="Are you sure you want to delete this user? All associated posts will also be deleted. This action cannot be undone."
          onConfirm={() => handleDelete(deletingUserId)}
          onClose={() => setDeletingUserId(null)}
          isLoading={loading === deletingUserId}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}


