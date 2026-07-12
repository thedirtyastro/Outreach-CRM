"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  leads_count: number;
  emails_sent: number;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function AdminUsersTable() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        sortField: "created_at",
        sortDir: "desc",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" size="default">
          Search
        </Button>
      </form>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">User</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Email</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Verified</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Leads</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Emails Sent</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Joined</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                      </td>
                    </tr>
                  ))
                ) : data?.users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  data?.users.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.image ?? undefined} alt={user.name} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.email_verified ? "bg-green-400/10 text-green-400" : "bg-yellow-400/10 text-yellow-400"}`}>
                          {user.email_verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.leads_count}</td>
                      <td className="px-4 py-3">{user.emails_sent}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="icon-sm" aria-label="View user">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(user.id, user.name)}
                            aria-label="Delete user"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {((data.page - 1) * data.limit) + 1}–{Math.min(data.page * data.limit, data.total)} of {data.total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
